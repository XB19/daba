package tg.daba.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
public class JobApplication {
    public enum Status { NOUVELLE, EN_COURS, ENTRETIEN, RETENUE, REFUSEE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Offre visée ; null pour une candidature spontanée. */
    private Long offerId;

    /** Intitulé de l'offre au moment de la candidature (conservé si l'offre est supprimée). */
    private String offerTitle;

    /** Poste souhaité (candidature spontanée). */
    private String desiredPosition;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String city;

    @Column(columnDefinition = "TEXT")
    private String message;

    /** Nom d'origine du CV, affiché dans l'administration. */
    private String cvOriginalName;

    /** Nom du fichier stocké dans le dossier privé des CV (jamais exposé publiquement). */
    @JsonIgnore
    private String cvStoredName;

    @Enumerated(EnumType.STRING)
    private Status status = Status.NOUVELLE;

    @Column(length = 2000)
    private String adminNote;

    private Instant createdAt = Instant.now();

    public boolean isSpontaneous() {
        return offerId == null;
    }

    public boolean isHasCv() {
        return cvStoredName != null;
    }
}
