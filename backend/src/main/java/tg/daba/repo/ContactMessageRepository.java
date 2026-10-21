package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    long countByReadFalse();
}
