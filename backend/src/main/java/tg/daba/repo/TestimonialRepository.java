package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByVisibleTrueOrderByIdAsc();
    List<Testimonial> findAllByOrderByIdAsc();
}
