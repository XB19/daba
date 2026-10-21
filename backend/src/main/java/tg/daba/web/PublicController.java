package tg.daba.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tg.daba.model.*;
import tg.daba.repo.*;
import tg.daba.web.Dtos.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ServiceItemRepository services;
    private final TestimonialRepository testimonials;
    private final SettingRepository settings;
    private final ContactMessageRepository messages;
    private final SubscriberRepository subscribers;
    private final OrderRepository orders;

    public PublicController(CategoryRepository categories, ProductRepository products, ServiceItemRepository services,
                            TestimonialRepository testimonials, SettingRepository settings,
                            ContactMessageRepository messages, SubscriberRepository subscribers, OrderRepository orders) {
        this.categories = categories;
        this.products = products;
        this.services = services;
        this.testimonials = testimonials;
        this.settings = settings;
        this.messages = messages;
        this.subscribers = subscribers;
        this.orders = orders;
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return categories.findAllByOrderByPositionAscIdAsc();
    }

    @GetMapping("/products")
    public List<Product> products() {
        return products.findAllByOrderByIdAsc();
    }

    @GetMapping("/products/{id}")
    public Product product(@PathVariable Long id) {
        return products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produit introuvable"));
    }

    @GetMapping("/services")
    public List<ServiceItem> services() {
        return services.findAllByOrderByPositionAscIdAsc();
    }

    @GetMapping("/testimonials")
    public List<Testimonial> testimonials() {
        return testimonials.findByVisibleTrueOrderByIdAsc();
    }

    @GetMapping("/settings")
    public Map<String, String> settings() {
        Map<String, String> map = new TreeMap<>();
        settings.findAll().forEach(s -> map.put(s.getKey(), s.getValue()));
        return map;
    }

    @PostMapping("/contact")
    public Map<String, String> contact(@Valid @RequestBody ContactRequest req) {
        ContactMessage m = new ContactMessage();
        m.setName(req.name());
        m.setEmail(req.email());
        m.setPhone(req.phone());
        m.setSubject(req.subject());
        m.setMessage(req.message());
        messages.save(m);
        return Map.of("message", "Merci ! Votre message a bien été envoyé.");
    }

    @PostMapping("/newsletter")
    public Map<String, String> newsletter(@Valid @RequestBody NewsletterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (!subscribers.existsByEmailIgnoreCase(email)) {
            Subscriber s = new Subscriber();
            s.setEmail(email);
            subscribers.save(s);
        }
        return Map.of("message", "Merci, vous êtes inscrit à notre newsletter !");
    }

    @PostMapping("/orders")
    public CustomerOrder order(@Valid @RequestBody OrderRequest req, Authentication auth) {
        CustomerOrder order = new CustomerOrder();
        order.setCustomerName(req.customerName());
        order.setPhone(req.phone());
        order.setEmail(req.email());
        order.setAddress(req.address());
        order.setDeliveryMode("pickup".equals(req.deliveryMode()) ? "pickup" : "delivery");
        order.setPaymentMethod(req.paymentMethod());
        order.setNote(req.note());
        if (auth != null && auth.getPrincipal() instanceof Long userId) {
            order.setUserId(userId);
        }
        if ("delivery".equals(order.getDeliveryMode()) && (req.address() == null || req.address().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'adresse de livraison est requise");
        }

        int subtotal = 0;
        for (OrderLine line : req.items()) {
            Product p = products.findById(line.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produit introuvable"));
            if (!p.isAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, p.getName() + " est en rupture de stock");
            }
            OrderItem item = new OrderItem();
            item.setProductId(p.getId());
            item.setProductName(p.getName());
            item.setUnit(p.getUnit());
            item.setImageUrl(p.getImageUrl());
            item.setUnitPrice(p.getPrice());
            item.setQuantity(line.quantity());
            item.setLineTotal(p.getPrice() * line.quantity());
            subtotal += item.getLineTotal();
            order.getItems().add(item);
        }
        int fee = "delivery".equals(order.getDeliveryMode()) ? deliveryFee() : 0;
        order.setSubtotal(subtotal);
        order.setDeliveryFee(fee);
        order.setTotal(subtotal + fee);
        order.setReference(newReference());
        return orders.save(order);
    }

    private int deliveryFee() {
        return settings.findById("delivery.fee")
                .map(s -> {
                    try { return Integer.parseInt(s.getValue().trim()); } catch (NumberFormatException e) { return 1000; }
                })
                .orElse(1000);
    }

    private static String newReference() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String rand = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "DABA-" + date + "-" + rand;
    }
}
