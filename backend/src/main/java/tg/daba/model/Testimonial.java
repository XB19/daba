package tg.daba.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "testimonials")
@Getter
@Setter
@NoArgsConstructor
public class Testimonial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String role;

    @Column(length = 2000, nullable = false)
    private String comment;

    private int rating = 5;

    private boolean visible = true;
}
