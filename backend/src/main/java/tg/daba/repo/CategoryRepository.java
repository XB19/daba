package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByOrderByPositionAscIdAsc();
    boolean existsByNameIgnoreCase(String name);
}
