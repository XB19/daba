package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByPublishedTrueOrderByCreatedAtDesc();
    List<JobOffer> findAllByOrderByCreatedAtDesc();
}
