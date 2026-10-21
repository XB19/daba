package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByOrderByIdAsc();
    List<Product> findByFeaturedTrueOrderByIdAsc();
    long countByCategoryId(Long categoryId);
    long countByAvailableFalse();
}
