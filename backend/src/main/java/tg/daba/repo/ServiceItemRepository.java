package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findAllByOrderByPositionAscIdAsc();
}
