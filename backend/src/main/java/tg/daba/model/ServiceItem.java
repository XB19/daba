package tg.daba.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
public class ServiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 1000)
    private String imageUrl;

    /** Nom d'icône lucide (ex. "Tractor", "Truck"). */
    private String icon;

    private int position;

    /** Affiché dans « Nos domaines d'expertise » sur l'accueil. */
    private boolean showOnHome = true;
}
