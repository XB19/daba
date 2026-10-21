package tg.daba.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.daba.model.*;
import java.util.List;
import java.util.Optional;
public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<AppUser> findAllByOrderByCreatedAtDesc();
    long countByRole(AppUser.Role role);
}
