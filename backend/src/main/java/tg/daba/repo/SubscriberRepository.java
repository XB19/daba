package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    boolean existsByEmailIgnoreCase(String email);
    List<Subscriber> findAllByOrderByCreatedAtDesc();
}
