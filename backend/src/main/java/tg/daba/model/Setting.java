package tg.daba.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Contenu éditable du site (textes, coordonnées, images) sous forme clé/valeur. */
@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Setting {
    @Id
    @Column(name = "setting_key", length = 120)
    private String key;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;
}
