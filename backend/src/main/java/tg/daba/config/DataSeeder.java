package tg.daba.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tg.daba.model.*;
import tg.daba.repo.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Remplit la base au premier démarrage (catalogue, services, contenus, compte admin). */
@Component
public class DataSeeder implements CommandLineRunner {
    /** Photos livrées avec le frontend (frontend/public/images), indexées par identifiant de photo d'origine. */
    private static final Map<String, String> LOCAL_IMAGES = Map.ofEntries(
            Map.entry("1598103442097-8b74394b95c6", "hero-poulet-roti"),
            Map.entry("1548550023-2bdb3c5beed7", "elevage-poules"),
            Map.entry("1555939594-58d7cb561ad1", "grillades"),
            Map.entry("1500595046743-cd271d694d30", "ferme"),
            Map.entry("1587593810167-a84920ea0781", "poulet-entier"),
            Map.entry("1606728035253-49e8a23146de", "poulet-fume"),
            Map.entry("1527477396000-e27163b481c2", "ailes"),
            Map.entry("1604503468506-a8da13d82791", "blanc-poulet"),
            Map.entry("1626082927389-6cd097cdc6ec", "cuisses"),
            Map.entry("1607623814075-e51df1bdc82f", "charcuterie"),
            Map.entry("1544025162-d76694265947", "marinade"),
            Map.entry("1532550907401-a500c9a57435", "haut-cuisses"),
            Map.entry("1562967914-608f82629710", "poulet-pane"),
            Map.entry("1588168333986-5078d3ae3976", "transformation"),
            Map.entry("1601599561213-832382fd07ba", "distribution"),
            // anciennes photos remplacées
            Map.entry("1625944230945-1b7dd3b949ab", "charcuterie"));

    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ServiceItemRepository services;
    private final TestimonialRepository testimonials;
    private final SettingRepository settings;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(CategoryRepository categories, ProductRepository products, ServiceItemRepository services,
                      TestimonialRepository testimonials, SettingRepository settings, UserRepository users,
                      PasswordEncoder encoder,
                      @Value("${app.admin.email}") String adminEmail,
                      @Value("${app.admin.password}") String adminPassword) {
        this.categories = categories;
        this.products = products;
        this.services = services;
        this.testimonials = testimonials;
        this.settings = settings;
        this.users = users;
        this.encoder = encoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    private static String img(String id) {
        return "/images/" + LOCAL_IMAGES.get(id) + ".jpg";
    }

    /** Convertit un ancien lien Unsplash connu en chemin local ; renvoie la valeur inchangée sinon. */
    private static String localize(String url) {
        if (url == null || !url.startsWith("https://images.unsplash.com/photo-")) return url;
        String id = url.substring("https://images.unsplash.com/photo-".length()).split("[?]")[0];
        return LOCAL_IMAGES.containsKey(id) ? img(id) : url;
    }

    /** Les bases remplies avant l'ajout des photos locales pointaient vers Unsplash : on les migre. */
    private void localizeExistingImages() {
        products.findAll().forEach(p -> {
            String u = localize(p.getImageUrl());
            if (!Objects.equals(u, p.getImageUrl())) { p.setImageUrl(u); products.save(p); }
        });
        services.findAll().forEach(sv -> {
            String u = localize(sv.getImageUrl());
            if (!Objects.equals(u, sv.getImageUrl())) { sv.setImageUrl(u); services.save(sv); }
        });
        settings.findAll().forEach(st -> {
            String u = localize(st.getValue());
            if (!Objects.equals(u, st.getValue())) { st.setValue(u); settings.save(st); }
        });
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedSettings();
        if (categories.count() == 0) seedCatalog();
        if (services.count() == 0) seedServices();
        removePlaceholderTestimonials();
        localizeExistingImages();
    }

    private void seedAdmin() {
        if (users.countByRole(AppUser.Role.ADMIN) > 0) return;
        AppUser admin = new AppUser();
        admin.setFullName("Administrateur DABA");
        admin.setEmail(adminEmail.toLowerCase());
        admin.setPasswordHash(encoder.encode(adminPassword));
        admin.setRole(AppUser.Role.ADMIN);
        users.save(admin);
    }

    private void seedSettings() {
        Map<String, String> d = new LinkedHashMap<>();
        d.put("site.name", "DABA");
        d.put("site.tagline", "Le goût du terroir");
        d.put("hero.badge", "100 % production locale togolaise");
        d.put("hero.title", "Des produits d’élevage frais, sains et de qualité pour tous.");
        d.put("hero.subtitle", "Particuliers, restaurants, hôtels, supermarchés ou distributeurs : nous élevons, transformons et livrons des volailles et charcuteries préparées avec soin, dans le respect strict de l’hygiène.");
        d.put("hero.image", img("1598103442097-8b74394b95c6"));
        d.put("intro.title", "L’excellence au service de l’agroalimentaire");
        d.put("intro.text", "De la ferme jusqu’à votre table, chaque étape est maîtrisée par nos équipes : élevage suivi, abattage moderne, découpe soignée et chaîne du froid respectée.");
        d.put("stats.1.value", "22+");
        d.put("stats.1.label", "Produits au catalogue");
        d.put("stats.2.value", "24h");
        d.put("stats.2.label", "Délai de livraison");
        d.put("stats.3.value", "100%");
        d.put("stats.3.label", "Élevage local");
        d.put("stats.4.value", "5");
        d.put("stats.4.label", "Gammes de produits");
        d.put("why.title", "Pourquoi choisir DABA ?");
        d.put("why.text", "Nous travaillons chaque jour pour proposer une viande de confiance, au juste prix, produite ici au Togo.");
        d.put("why.items", "Une entreprise de confiance\nUne qualité contrôlée à chaque étape\nUne production 100 % locale\nLa valorisation du savoir-faire national\nDes normes d’hygiène et de sécurité strictes");
        d.put("why.image", img("1548550023-2bdb3c5beed7"));
        d.put("cta.title", "Passez votre commande en ligne");
        d.put("cta.text", "Choisissez vos produits, réglez à la livraison ou par mobile money, et recevez votre commande en moins de 24h.");
        d.put("cta.image", img("1555939594-58d7cb561ad1"));
        d.put("about.intro", "Une entreprise engagée pour valoriser la production nationale et élever les standards de l’agroalimentaire au Togo.");
        d.put("about.history.1", "DABA est née d’un constat simple : les familles et les professionnels togolais méritent une viande locale fraîche, saine et dont on connaît l’origine. Dès le départ, nous avons placé l’hygiène et la traçabilité au cœur de notre activité.");
        d.put("about.history.2", "Aujourd’hui, nous maîtrisons toute la chaîne de valeur — élevage, abattage, transformation et distribution — avec des outils modernes et des procédures inspirées des standards internationaux.");
        d.put("about.image", img("1500595046743-cd271d694d30"));
        d.put("about.mission", "Proposer des produits d’élevage de qualité supérieure, accessibles à tous, tout en soutenant l’économie locale et la sécurité alimentaire.");
        d.put("about.vision", "Devenir une référence de la transformation agroalimentaire en Afrique de l’Ouest, reconnue pour son innovation et son engagement durable.");
        d.put("about.values", "Intégrité, excellence, innovation et respect de l’environnement guident chacune de nos décisions.");
        d.put("about.goal.1.title", "Modernisation");
        d.put("about.goal.1.text", "Industrialiser nos procédés de transformation pour gagner en productivité et en régularité.");
        d.put("about.goal.2.title", "Impact social");
        d.put("about.goal.2.text", "Créer des emplois locaux et accompagner les éleveurs togolais dans leur développement.");
        d.put("about.goal.3.title", "Qualité durable");
        d.put("about.goal.3.text", "Réduire notre empreinte et garantir une qualité constante sur l’ensemble de nos gammes.");
        d.put("contact.phone", "+228 93 49 42 26");
        d.put("contact.email", "info@daba.tg");
        d.put("contact.address", "Agoè BKS, Immeuble D&D, Lomé – Togo");
        d.put("contact.hours", "Lun – Sam : 8h00 – 18h00");
        d.put("contact.mapQuery", "Agoè, Lomé, Togo");
        d.put("social.facebook", "https://facebook.com");
        d.put("social.instagram", "https://instagram.com");
        d.put("social.linkedin", "https://linkedin.com");
        d.put("social.whatsapp", "https://wa.me/22893494226");
        d.put("delivery.fee", "1000");
        d.put("footer.text", "Des produits d’élevage frais, sains et de qualité pour tous. DABA accompagne particuliers et professionnels avec exigence.");
        d.forEach((k, v) -> {
            if (!settings.existsById(k)) settings.save(new Setting(k, v));
        });
    }

    private void seedCatalog() {
        Category poulets = categories.save(new Category("Poulets", "Poulets entiers frais et fumés", 1));
        Category decoupes = categories.save(new Category("Découpes", "Morceaux de poulet prêts à cuisiner", 2));
        Category charcut = categories.save(new Category("Charcuteries", "Saucisses, pâtés et saucissons", 3));
        Category marines = categories.save(new Category("Produits marinés", "Marinades maison prêtes à griller", 4));
        Category transf = categories.save(new Category("Produits transformés", "Préparations prêtes à cuire", 5));

        String raw = "1587593810167-a84920ea0781", roast = "1606728035253-49e8a23146de", wings = "1527477396000-e27163b481c2",
                breast = "1604503468506-a8da13d82791", legs = "1626082927389-6cd097cdc6ec", platter = "1607623814075-e51df1bdc82f",
                grill = "1555939594-58d7cb561ad1", ribs = "1544025162-d76694265947", grilled = "1532550907401-a500c9a57435",
                breaded = "1562967914-608f82629710";

        List<Object[]> rows = List.of(
                new Object[]{"Poulet entier", "Poulet entier frais, élevé localement et préparé le jour même.", 2600, "Sachet", poulets, raw, true},
                new Object[]{"Poulet fumé", "Poulet entier fumé lentement selon un procédé traditionnel.", 3400, "Sachet", poulets, roast, false},
                new Object[]{"Cuisse de poulet", "Sachet de 3 à 4 cuisses charnues.", 2200, "Sachet", decoupes, legs, true},
                new Object[]{"Ailes de poulet", "Sachet de 10 à 15 ailes, idéales pour le grill.", 2000, "Sachet", decoupes, wings, false},
                new Object[]{"Blanc de poulet", "Filets de poitrine sans os, tranchés.", 6000, "Sachet", decoupes, breast, false},
                new Object[]{"Saucisse", "Paquet de 10 saucisses de volaille.", 1000, "Sachet", charcut, platter, true},
                new Object[]{"Saucisse fumée", "Saucisses fumées au bois, paquet de 10.", 1000, "Sachet", charcut, grill, false},
                new Object[]{"Pâté de foie", "Pâté de foie de volaille, boîte de 200 g.", 1000, "Boîte", charcut, platter, false},
                new Object[]{"Merguez", "Merguez épicées, barquette de 500 g.", 6000, "kg", charcut, grill, false},
                new Object[]{"Chipolatas", "Chipolatas fines, barquette de 500 g.", 6000, "kg", charcut, platter, false},
                new Object[]{"Saucisses cuites", "Saucisses précuites, paquet de 410 g.", 1000, "Paquet", charcut, platter, false},
                new Object[]{"Saucissons", "Saucisson sec affiné avec soin.", 2000, "Pièce", charcut, platter, false},
                new Object[]{"Saucisse à griller nature", "Saucisses à griller, recette nature.", 2000, "Paquet", charcut, grill, false},
                new Object[]{"Saucisse à griller aux fines herbes", "Saucisses à griller parfumées aux fines herbes.", 2000, "Paquet", charcut, grill, false},
                new Object[]{"Saucisse à griller au curry", "Saucisses à griller relevées au curry.", 2000, "Paquet", charcut, grill, false},
                new Object[]{"Cuisses marinées", "Cuisses de poulet marinées, prêtes à cuire.", 5500, "kg", marines, ribs, true},
                new Object[]{"Haut de cuisses", "Hauts de cuisses marinés aux épices.", 5500, "kg", marines, grilled, false},
                new Object[]{"Pilon mariné", "Pilons de poulet marinés maison.", 5500, "kg", marines, legs, false},
                new Object[]{"Ailes marinées", "Ailes de poulet marinées, saveur barbecue.", 4500, "kg", marines, wings, false},
                new Object[]{"Brochettes de blanc", "Brochettes de blanc de poulet mariné.", 7500, "kg", marines, grill, true},
                new Object[]{"Brochettes de gésiers", "Brochettes de gésiers marinés.", 5000, "kg", marines, grill, false},
                new Object[]{"Poulet pané", "Morceaux de poulet panés, prêts à frire.", 2000, "Paquet", transf, breaded, true}
        );
        for (Object[] r : rows) {
            Product p = new Product();
            p.setName((String) r[0]);
            p.setDescription((String) r[1]);
            p.setPrice((Integer) r[2]);
            p.setUnit((String) r[3]);
            p.setCategory((Category) r[4]);
            p.setImageUrl(img((String) r[5]));
            p.setFeatured((Boolean) r[6]);
            products.save(p);
        }
    }

    private void seedServices() {
        Object[][] rows = {
                {"Production animale", "Élevage suivi de volailles selon des règles strictes d’hygiène, d’alimentation et de santé animale.", "Bird", "1548550023-2bdb3c5beed7"},
                {"Transformation", "Une unité moderne pour élaborer des produits dérivés sains, savoureux et prêts à consommer.", "Factory", "1588168333986-5078d3ae3976"},
                {"Abattoir moderne", "Des installations récentes pour un abattage et une découpe propres, hygiéniques et conformes aux normes.", "ShieldCheck", "1604503468506-a8da13d82791"},
                {"Distribution", "Un réseau logistique fiable qui livre supermarchés, hôtels, restaurants et particuliers.", "Truck", "1601599561213-832382fd07ba"},
                {"Agro-business", "Conseil et accompagnement des acteurs agricoles et de l’élevage pour optimiser leur production.", "Sprout", "1500595046743-cd271d694d30"}
        };
        int pos = 1;
        for (Object[] r : rows) {
            ServiceItem s = new ServiceItem();
            s.setTitle((String) r[0]);
            s.setDescription((String) r[1]);
            s.setIcon((String) r[2]);
            s.setImageUrl(img((String) r[3]));
            s.setPosition(pos);
            s.setShowOnHome(pos <= 4);
            pos++;
            services.save(s);
        }
    }

    /**
     * Supprime les avis d'exemple des premières versions. Les avis publiés doivent être de vrais
     * témoignages clients, ajoutés depuis l'administration ; sans avis, l'accueil présente nos clientèles.
     */
    private void removePlaceholderTestimonials() {
        testimonials.findAll().stream()
                .filter(t -> t.getName() != null && t.getName().startsWith("Client exemple"))
                .forEach(testimonials::delete);
    }
}
