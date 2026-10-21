package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.time.Instant;
import java.util.List;
public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CustomerOrder> findByCreatedAtAfter(Instant after);
    long countByStatus(CustomerOrder.Status status);
}
