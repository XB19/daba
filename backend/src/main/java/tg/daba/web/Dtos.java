package tg.daba.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import tg.daba.model.AppUser;

import java.util.List;

/** Objets de requête/réponse de l'API. */
public final class Dtos {
    private Dtos() {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record RegisterRequest(@NotBlank String fullName, @NotBlank @Email String email,
                                  String phone, @NotBlank @Size(min = 6) String password) {}

    public record UserView(Long id, String fullName, String email, String phone, String role, boolean active) {
        public static UserView of(AppUser u) {
            return new UserView(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole().name(), u.isActive());
        }
    }

    public record AuthResponse(String token, UserView user) {}

    public record ContactRequest(@NotBlank String name, @NotBlank @Email String email, String phone,
                                 String subject, @NotBlank String message) {}

    public record NewsletterRequest(@NotBlank @Email String email) {}

    public record OrderLine(@NotNull Long productId, @Min(1) int quantity) {}

    public record OrderRequest(@NotBlank String customerName, @NotBlank String phone, String email,
                               String address, @NotBlank String deliveryMode, @NotBlank String paymentMethod,
                               String note, @NotEmpty List<@Valid OrderLine> items) {}

    public record StatusRequest(@NotBlank String status) {}

    public record UserRequest(@NotBlank String fullName, @NotBlank @Email String email, String phone,
                              String password, @NotBlank String role, boolean active) {}
}
