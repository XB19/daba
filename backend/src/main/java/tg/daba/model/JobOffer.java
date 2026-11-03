package tg.daba.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "job_offers")
@Getter
@Setter
@NoArgsConstructor
public class JobOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    /** Service : Production, Logistique, Commercial… */
    private String department;

    private String location;

    /** CDI, CDD, Stage, Alternance, Freelance. */
    private String contractType;

    @Column(length = 1000)
    private String summary;

    /** Missions, une par ligne. */
    @Column(columnDefinition = "TEXT")
    private String missions;

    /** Profil recherché, un critère par ligne. */
    @Column(columnDefinition = "TEXT")
    private String requirements;

    /** Ce que nous offrons, un avantage par ligne. */
    @Column(columnDefinition = "TEXT")
    private String benefits;

    /** Date limite de candidature (facultative). */
    private LocalDate deadline;

    private boolean published = true;

    private Instant createdAt = Instant.now();
}
