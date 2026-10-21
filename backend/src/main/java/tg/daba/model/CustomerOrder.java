package tg.daba.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class CustomerOrder {
    public enum Status { EN_ATTENTE, CONFIRMEE, EN_PREPARATION, EN_LIVRAISON, LIVREE, ANNULEE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String reference;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(length = 1000)
    private String address;

    /** "delivery" ou "pickup". */
    private String deliveryMode;

    /** "cash", "tmoney", "flooz", "card". */
    private String paymentMethod;

    @Column(length = 2000)
    private String note;

    private int subtotal;
    private int deliveryFee;
    private int total;

    @Enumerated(EnumType.STRING)
    private Status status = Status.EN_ATTENTE;

    /** Compte client ayant passé la commande (facultatif). */
    private Long userId;

    private Instant createdAt = Instant.now();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();
}
