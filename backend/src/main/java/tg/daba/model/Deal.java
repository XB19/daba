package tg.daba.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

/** Bon plan : promotion, offre spéciale ou nouveauté mise en avant. */
@Entity
@Table(name = "deals")
@Getter
@Setter
@NoArgsConstructor
public class Deal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    /** Libellé court affiché sur la carte : Promotion, Nouveauté, Offre pro… */
    private String category;

    /** Pastille mise en avant : « -10 % », « Offert », « Nouveau »… */
    private String badge;

    /** Accroche courte (cartes et bloc mis en avant). */
    @Column(length = 1000)
    private String summary;

    /** Détail complet de l'offre (conditions, durée…). Un paragraphe par ligne. */
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 1000)
    private String imageUrl;

    /** Texte et lien du bouton d'action (facultatifs). Par défaut : contact WhatsApp. */
    private String ctaLabel;
    @Column(length = 1000)
    private String ctaUrl;

    /** Période de validité (facultative). Hors période, le bon plan n'est pas affiché. */
    private LocalDate startDate;
    private LocalDate endDate;

    /** Un seul bon plan est affiché en grand ; s'il y en a plusieurs, le plus récent. */
    private boolean featured;

    private boolean published = true;

    private int position;

    private Instant createdAt = Instant.now();

    public boolean isActiveOn(LocalDate day) {
        return published
                && (startDate == null || !startDate.isAfter(day))
                && (endDate == null || !endDate.isBefore(day));
    }
}
