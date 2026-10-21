package tg.daba.web;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tg.daba.model.*;
import tg.daba.repo.*;
import tg.daba.web.Dtos.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

import static tg.daba.web.AdminCatalogController.find;

/** Commandes, messages, abonnés, utilisateurs, contenu du site, statistiques et téléversements. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Set<String> IMAGE_EXT = Set.of("jpg", "jpeg", "png", "webp", "gif", "svg", "avif");

    private final OrderRepository orders;
    private final ContactMessageRepository messages;
    private final SubscriberRepository subscribers;
    private final UserRepository users;
    private final SettingRepository settings;
    private final ProductRepository products;
    private final PasswordEncoder encoder;
    private final Path uploadDir;

    public AdminController(OrderRepository orders, ContactMessageRepository messages, SubscriberRepository subscribers,
                           UserRepository users, SettingRepository settings, ProductRepository products,
                           PasswordEncoder encoder, @Value("${app.upload-dir}") String uploadDir) {
        this.orders = orders;
        this.messages = messages;
        this.subscribers = subscribers;
        this.users = users;
        this.settings = settings;
        this.products = products;
        this.encoder = encoder;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath();
    }

    // ---- Tableau de bord ----
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        List<CustomerOrder> all = orders.findAll();
        List<CustomerOrder> valid = all.stream().filter(o -> o.getStatus() != CustomerOrder.Status.ANNULEE).toList();
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("revenue", valid.stream().mapToLong(CustomerOrder::getTotal).sum());
        res.put("orders", all.size());
        res.put("pendingOrders", orders.countByStatus(CustomerOrder.Status.EN_ATTENTE));
        res.put("products", products.count());
        res.put("outOfStock", products.countByAvailableFalse());
        res.put("customers", users.countByRole(AppUser.Role.CUSTOMER));
        res.put("unreadMessages", messages.countByReadFalse());
        res.put("subscribers", subscribers.count());
        res.put("averageBasket", valid.isEmpty() ? 0 : valid.stream().mapToLong(CustomerOrder::getTotal).sum() / valid.size());

        List<Map<String, Object>> daily = new ArrayList<>();
        for (int i = 13; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<CustomerOrder> ofDay = valid.stream()
                    .filter(o -> LocalDate.ofInstant(o.getCreatedAt(), zone).equals(d)).toList();
            daily.add(Map.of("date", d.toString(),
                    "revenue", ofDay.stream().mapToLong(CustomerOrder::getTotal).sum(),
                    "orders", ofDay.size()));
        }
        res.put("daily", daily);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (CustomerOrder.Status s : CustomerOrder.Status.values()) byStatus.put(s.name(), 0L);
        all.forEach(o -> byStatus.merge(o.getStatus().name(), 1L, Long::sum));
        res.put("byStatus", byStatus);

        Map<String, long[]> top = new HashMap<>();
        valid.forEach(o -> o.getItems().forEach(it -> {
            long[] agg = top.computeIfAbsent(it.getProductName(), k -> new long[2]);
            agg[0] += it.getQuantity();
            agg[1] += it.getLineTotal();
        }));
        res.put("topProducts", top.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[1], a.getValue()[1]))
                .limit(5)
                .map(e -> Map.of("name", e.getKey(), "quantity", e.getValue()[0], "revenue", e.getValue()[1]))
                .toList());
        res.put("recentOrders", orders.findAllByOrderByCreatedAtDesc().stream().limit(6).toList());
        return res;
    }

    // ---- Commandes ----
    @GetMapping("/orders")
    public List<CustomerOrder> orders() {
        return orders.findAllByOrderByCreatedAtDesc();
    }

    @PatchMapping("/orders/{id}/status")
    public CustomerOrder updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        CustomerOrder o = find(orders.findById(id));
        try {
            o.setStatus(CustomerOrder.Status.valueOf(req.status()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide");
        }
        return orders.save(o);
    }

    @DeleteMapping("/orders/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orders.deleteById(id);
    }

    // ---- Messages ----
    @GetMapping("/messages")
    public List<ContactMessage> messages() {
        return messages.findAllByOrderByCreatedAtDesc();
    }

    @PatchMapping("/messages/{id}/read")
    public ContactMessage markRead(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean read) {
        ContactMessage m = find(messages.findById(id));
        m.setRead(read);
        return messages.save(m);
    }

    @DeleteMapping("/messages/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messages.deleteById(id);
    }

    // ---- Newsletter ----
    @GetMapping("/subscribers")
    public List<Subscriber> subscribers() {
        return subscribers.findAllByOrderByCreatedAtDesc();
    }

    @DeleteMapping("/subscribers/{id}")
    public void deleteSubscriber(@PathVariable Long id) {
        subscribers.deleteById(id);
    }

    // ---- Utilisateurs ----
    @GetMapping("/users")
    public List<UserView> users() {
        return users.findAllByOrderByCreatedAtDesc().stream().map(UserView::of).toList();
    }

    @PostMapping("/users")
    public UserView createUser(@Valid @RequestBody UserRequest req) {
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mot de passe : 6 caractères minimum");
        }
        AppUser u = new AppUser();
        apply(u, req);
        return UserView.of(users.save(u));
    }

    @PutMapping("/users/{id}")
    public UserView updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest req, Authentication auth) {
        AppUser u = find(users.findById(id));
        if (id.equals(auth.getPrincipal()) && (!req.active() || !"ADMIN".equals(req.role()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous ne pouvez pas retirer vos propres droits");
        }
        users.findByEmailIgnoreCase(req.email()).filter(o -> !o.getId().equals(id)).ifPresent(o -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        });
        apply(u, req);
        return UserView.of(users.save(u));
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id, Authentication auth) {
        if (id.equals(auth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous ne pouvez pas supprimer votre propre compte");
        }
        users.deleteById(id);
    }

    private void apply(AppUser u, UserRequest req) {
        u.setFullName(req.fullName());
        u.setEmail(req.email().trim().toLowerCase());
        u.setPhone(req.phone());
        u.setRole(AppUser.Role.valueOf(req.role()));
        u.setActive(req.active());
        if (req.password() != null && !req.password().isBlank()) {
            u.setPasswordHash(encoder.encode(req.password()));
        }
    }

    // ---- Contenu du site ----
    @PutMapping("/settings")
    @Transactional
    public Map<String, String> saveSettings(@RequestBody Map<String, String> body) {
        body.forEach((k, v) -> settings.save(new Setting(k, v)));
        return settings.findAll().stream().collect(Collectors.toMap(Setting::getKey, s -> s.getValue() == null ? "" : s.getValue()));
    }

    // ---- Téléversement d'images ----
    @PostMapping("/upload")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String original = Objects.requireNonNullElse(file.getOriginalFilename(), "image");
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!IMAGE_EXT.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Format d'image non supporté");
        }
        Files.createDirectories(uploadDir);
        String name = UUID.randomUUID() + "." + ext;
        file.transferTo(uploadDir.resolve(name));
        return Map.of("url", "/uploads/" + name);
    }
}
