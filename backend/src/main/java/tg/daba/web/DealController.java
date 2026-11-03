package tg.daba.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tg.daba.model.Deal;
import tg.daba.repo.DealRepository;

import java.time.LocalDate;
import java.util.List;

import static tg.daba.web.AdminCatalogController.find;

/** Bons plans : promotions et offres spéciales gérées depuis l'administration. */
@RestController
public class DealController {
    private final DealRepository deals;

    public DealController(DealRepository deals) {
        this.deals = deals;
    }

    @GetMapping("/api/public/deals")
    public List<Deal> activeDeals() {
        LocalDate today = LocalDate.now();
        return deals.findAllByOrderByPositionAscCreatedAtDesc().stream().filter(d -> d.isActiveOn(today)).toList();
    }

    @GetMapping("/api/public/deals/{id}")
    public Deal activeDeal(@PathVariable Long id) {
        return deals.findById(id).filter(d -> d.isActiveOn(LocalDate.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ce bon plan n'est plus disponible"));
    }

    @GetMapping("/api/admin/deals")
    public List<Deal> allDeals() {
        return deals.findAllByOrderByPositionAscCreatedAtDesc();
    }

    @PostMapping("/api/admin/deals")
    public Deal create(@RequestBody Deal body) {
        validate(body);
        body.setId(null);
        return deals.save(body);
    }

    @PutMapping("/api/admin/deals/{id}")
    public Deal update(@PathVariable Long id, @RequestBody Deal body) {
        validate(body);
        Deal d = find(deals.findById(id));
        body.setId(d.getId());
        body.setCreatedAt(d.getCreatedAt());
        return deals.save(body);
    }

    @DeleteMapping("/api/admin/deals/{id}")
    public void delete(@PathVariable Long id) {
        deals.deleteById(id);
    }

    private static void validate(Deal d) {
        if (d.getTitle() == null || d.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le titre est requis");
        }
        if (d.getStartDate() != null && d.getEndDate() != null && d.getEndDate().isBefore(d.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin précède la date de début");
        }
    }
}
