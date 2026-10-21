package tg.daba.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tg.daba.model.*;
import tg.daba.repo.*;

import java.util.List;
import java.util.Map;

/** Gestion du catalogue : catégories, produits, services, témoignages. */
@RestController
@RequestMapping("/api/admin")
public class AdminCatalogController {
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ServiceItemRepository services;
    private final TestimonialRepository testimonials;

    public AdminCatalogController(CategoryRepository categories, ProductRepository products,
                                  ServiceItemRepository services, TestimonialRepository testimonials) {
        this.categories = categories;
        this.products = products;
        this.services = services;
        this.testimonials = testimonials;
    }

    // ---- Catégories ----
    @GetMapping("/categories")
    public List<Map<String, Object>> categories() {
        return categories.findAllByOrderByPositionAscIdAsc().stream()
                .map(c -> Map.<String, Object>of(
                        "id", c.getId(), "name", c.getName(),
                        "description", c.getDescription() == null ? "" : c.getDescription(),
                        "position", c.getPosition(), "productCount", products.countByCategoryId(c.getId())))
                .toList();
    }

    @PostMapping("/categories")
    public Category createCategory(@RequestBody Category body) {
        body.setId(null);
        return categories.save(body);
    }

    @PutMapping("/categories/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category body) {
        Category c = find(categories.findById(id));
        c.setName(body.getName());
        c.setDescription(body.getDescription());
        c.setPosition(body.getPosition());
        return categories.save(c);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable Long id) {
        if (products.countByCategoryId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette catégorie contient encore des produits");
        }
        categories.deleteById(id);
    }

    // ---- Produits ----
    @PostMapping("/products")
    public Product createProduct(@RequestBody Product body) {
        body.setId(null);
        body.setCategory(resolveCategory(body.getCategory()));
        return products.save(body);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product body) {
        Product p = find(products.findById(id));
        p.setName(body.getName());
        p.setDescription(body.getDescription());
        p.setPrice(body.getPrice());
        p.setUnit(body.getUnit());
        p.setImageUrl(body.getImageUrl());
        p.setAvailable(body.isAvailable());
        p.setFeatured(body.isFeatured());
        p.setStock(body.getStock());
        p.setCategory(resolveCategory(body.getCategory()));
        return products.save(p);
    }

    @PatchMapping("/products/{id}/toggle")
    public Product toggleProduct(@PathVariable Long id, @RequestParam String field) {
        Product p = find(products.findById(id));
        if ("featured".equals(field)) p.setFeatured(!p.isFeatured());
        else p.setAvailable(!p.isAvailable());
        return products.save(p);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        products.deleteById(id);
    }

    // ---- Services ----
    @PostMapping("/services")
    public ServiceItem createService(@RequestBody ServiceItem body) {
        body.setId(null);
        return services.save(body);
    }

    @PutMapping("/services/{id}")
    public ServiceItem updateService(@PathVariable Long id, @RequestBody ServiceItem body) {
        find(services.findById(id));
        body.setId(id);
        return services.save(body);
    }

    @DeleteMapping("/services/{id}")
    public void deleteService(@PathVariable Long id) {
        services.deleteById(id);
    }

    // ---- Témoignages ----
    @GetMapping("/testimonials")
    public List<Testimonial> testimonials() {
        return testimonials.findAllByOrderByIdAsc();
    }

    @PostMapping("/testimonials")
    public Testimonial createTestimonial(@RequestBody Testimonial body) {
        body.setId(null);
        return testimonials.save(body);
    }

    @PutMapping("/testimonials/{id}")
    public Testimonial updateTestimonial(@PathVariable Long id, @RequestBody Testimonial body) {
        find(testimonials.findById(id));
        body.setId(id);
        return testimonials.save(body);
    }

    @DeleteMapping("/testimonials/{id}")
    public void deleteTestimonial(@PathVariable Long id) {
        testimonials.deleteById(id);
    }

    private Category resolveCategory(Category ref) {
        if (ref == null || ref.getId() == null) return null;
        return find(categories.findById(ref.getId()));
    }

    static <T> T find(java.util.Optional<T> opt) {
        return opt.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Élément introuvable"));
    }
}
