package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findAllByOrderByCreatedAtDesc();
    long countByStatus(JobApplication.Status status);
    long countByOfferId(Long offerId);
}
