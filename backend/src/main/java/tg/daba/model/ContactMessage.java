package tg.daba.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "contact_messages")
@Getter
@Setter
@NoArgsConstructor
public class ContactMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String subject;

    @Column(length = 5000)
    private String message;

    @Column(name = "is_read")
    private boolean read;

    private Instant createdAt = Instant.now();
}
