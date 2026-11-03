package tg.daba.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tg.daba.model.JobApplication;
import tg.daba.model.JobOffer;
import tg.daba.repo.JobApplicationRepository;
import tg.daba.repo.JobOfferRepository;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.*;

import static tg.daba.web.AdminCatalogController.find;

/** Offres d'emploi et candidatures (spontanées ou sur offre). */
@RestController
@Validated
public class CareerController {
    private static final Map<String, MediaType> CV_TYPES = Map.of(
            "pdf", MediaType.APPLICATION_PDF,
            "doc", MediaType.parseMediaType("application/msword"),
            "docx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
    private static final long CV_MAX_BYTES = 5L * 1024 * 1024;

    private final JobOfferRepository offers;
    private final JobApplicationRepository applications;
    /** Dossier privé : les CV ne sont jamais servis publiquement, seulement via l'API admin. */
    private final Path cvDir;

    public CareerController(JobOfferRepository offers, JobApplicationRepository applications,
                            @Value("${app.cv-dir}") String cvDir) {
        this.offers = offers;
        this.applications = applications;
        this.cvDir = Path.of(cvDir).toAbsolutePath();
    }

    // ---------- Public ----------

    @GetMapping("/api/public/jobs")
    public List<JobOffer> publishedOffers() {
        LocalDate today = LocalDate.now();
        return offers.findByPublishedTrueOrderByCreatedAtDesc().stream()
                .filter(o -> o.getDeadline() == null || !o.getDeadline().isBefore(today))
                .toList();
    }

    @GetMapping("/api/public/jobs/{id}")
    public JobOffer publishedOffer(@PathVariable Long id) {
        return offers.findById(id).filter(JobOffer::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre introuvable ou clôturée"));
    }

    @PostMapping(value = "/api/public/jobs/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> apply(@RequestParam(required = false) Long offerId,
                                     @RequestParam(required = false) String desiredPosition,
                                     @RequestParam @NotBlank String fullName,
                                     @RequestParam @NotBlank @Email String email,
                                     @RequestParam(required = false) String phone,
                                     @RequestParam(required = false) String city,
                                     @RequestParam(required = false) String message,
                                     @RequestParam("cv") MultipartFile cv) throws IOException {
        JobApplication a = new JobApplication();
        if (offerId != null) {
            JobOffer offer = offers.findById(offerId).filter(JobOffer::isPublished)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette offre n'est plus disponible"));
            if (offer.getDeadline() != null && offer.getDeadline().isBefore(LocalDate.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date limite de cette offre est dépassée");
            }
            a.setOfferId(offer.getId());
            a.setOfferTitle(offer.getTitle());
        } else if (desiredPosition == null || desiredPosition.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indiquez le poste souhaité");
        }
        a.setDesiredPosition(trim(desiredPosition));
        a.setFullName(fullName.trim());
        a.setEmail(email.trim().toLowerCase());
        a.setPhone(trim(phone));
        a.setCity(trim(city));
        a.setMessage(trim(message));
        storeCv(a, cv);
        applications.save(a);
        return Map.of("message", "Merci ! Votre candidature a bien été envoyée. Nous reviendrons vers vous rapidement.");
    }

    private void storeCv(JobApplication a, MultipartFile cv) throws IOException {
        if (cv == null || cv.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Merci de joindre votre CV");
        }
        if (cv.getSize() > CV_MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le CV ne doit pas dépasser 5 Mo");
        }
        String original = Objects.requireNonNullElse(cv.getOriginalFilename(), "cv");
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!CV_TYPES.containsKey(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Format accepté : PDF, DOC ou DOCX");
        }
        Files.createDirectories(cvDir);
        String stored = UUID.randomUUID() + "." + ext;
        cv.transferTo(cvDir.resolve(stored));
        a.setCvOriginalName(Path.of(original).getFileName().toString());
        a.setCvStoredName(stored);
    }

    private static String trim(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    // ---------- Administration : offres ----------

    @GetMapping("/api/admin/jobs")
    public List<Map<String, Object>> allOffers() {
        return offers.findAllByOrderByCreatedAtDesc().stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("offer", o);
            m.put("applicationCount", applications.countByOfferId(o.getId()));
            return m;
        }).toList();
    }

    @PostMapping("/api/admin/jobs")
    public JobOffer createOffer(@RequestBody JobOffer body) {
        if (body.getTitle() == null || body.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'intitulé du poste est requis");
        }
        body.setId(null);
        return offers.save(body);
    }

    @PutMapping("/api/admin/jobs/{id}")
    public JobOffer updateOffer(@PathVariable Long id, @RequestBody JobOffer body) {
        JobOffer o = find(offers.findById(id));
        o.setTitle(body.getTitle());
        o.setDepartment(body.getDepartment());
        o.setLocation(body.getLocation());
        o.setContractType(body.getContractType());
        o.setSummary(body.getSummary());
        o.setMissions(body.getMissions());
        o.setRequirements(body.getRequirements());
        o.setBenefits(body.getBenefits());
        o.setDeadline(body.getDeadline());
        o.setPublished(body.isPublished());
        return offers.save(o);
    }

    @DeleteMapping("/api/admin/jobs/{id}")
    public void deleteOffer(@PathVariable Long id) {
        offers.deleteById(id);
    }

    // ---------- Administration : candidatures ----------

    @GetMapping("/api/admin/applications")
    public List<JobApplication> allApplications() {
        return applications.findAllByOrderByCreatedAtDesc();
    }

    @PatchMapping("/api/admin/applications/{id}")
    public JobApplication updateApplication(@PathVariable Long id, @RequestBody Map<String, String> body) {
        JobApplication a = find(applications.findById(id));
        if (body.containsKey("status")) {
            try {
                a.setStatus(JobApplication.Status.valueOf(body.get("status")));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide");
            }
        }
        if (body.containsKey("adminNote")) a.setAdminNote(body.get("adminNote"));
        return applications.save(a);
    }

    @DeleteMapping("/api/admin/applications/{id}")
    public void deleteApplication(@PathVariable Long id) throws IOException {
        JobApplication a = find(applications.findById(id));
        if (a.getCvStoredName() != null) Files.deleteIfExists(cvDir.resolve(a.getCvStoredName()));
        applications.delete(a);
    }

    @GetMapping("/api/admin/applications/{id}/cv")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long id) {
        JobApplication a = find(applications.findById(id));
        if (a.getCvStoredName() == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun CV joint");
        Path file = cvDir.resolve(a.getCvStoredName()).normalize();
        if (!file.startsWith(cvDir) || !Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable");
        }
        String ext = a.getCvStoredName().substring(a.getCvStoredName().lastIndexOf('.') + 1);
        return ResponseEntity.ok()
                .contentType(CV_TYPES.getOrDefault(ext, MediaType.APPLICATION_OCTET_STREAM))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(a.getCvOriginalName(), StandardCharsets.UTF_8).build().toString())
                .body(new FileSystemResource(file));
    }
}
