package tg.daba.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tg.daba.model.AppUser;
import tg.daba.model.CustomerOrder;
import tg.daba.repo.OrderRepository;
import tg.daba.repo.UserRepository;
import tg.daba.security.JwtService;
import tg.daba.web.Dtos.*;

import java.util.List;

@RestController
public class AuthController {
    private final UserRepository users;
    private final OrderRepository orders;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, OrderRepository orders, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.orders = orders;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/api/auth/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        AppUser user = users.findByEmailIgnoreCase(req.email().trim())
                .filter(u -> encoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect"));
        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ce compte est désactivé");
        }
        return new AuthResponse(jwt.generate(user), UserView.of(user));
    }

    @PostMapping("/api/auth/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        if (users.existsByEmailIgnoreCase(req.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        AppUser user = new AppUser();
        user.setFullName(req.fullName().trim());
        user.setEmail(req.email().trim().toLowerCase());
        user.setPhone(req.phone());
        user.setPasswordHash(encoder.encode(req.password()));
        user.setRole(AppUser.Role.CUSTOMER);
        users.save(user);
        return new AuthResponse(jwt.generate(user), UserView.of(user));
    }

    @GetMapping("/api/auth/me")
    public UserView me(Authentication auth) {
        return UserView.of(current(auth));
    }

    @GetMapping("/api/me/orders")
    public List<CustomerOrder> myOrders(Authentication auth) {
        return orders.findByUserIdOrderByCreatedAtDesc(current(auth).getId());
    }

    private AppUser current(Authentication auth) {
        return users.findById((Long) auth.getPrincipal())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expirée"));
    }
}
