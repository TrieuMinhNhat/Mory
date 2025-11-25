package com.muicochay.mory.user.scheduler;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UnverifiedUserCleanupService {

    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void deleteUnverifiedUsersOlderThan7Days() {
        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);

        List<User> usersToDelete = userRepository.findUnverifiedEmailPasswordOnlyUsers(
                cutoff,
                AuthProvider.EMAIL_PASSWORD
        );

        if (!usersToDelete.isEmpty()) {
            userRepository.deleteAllInBatch(usersToDelete);
            System.out.printf("🧹 Deleted %d unverified email-password users older than 7 days.%n",
                    usersToDelete.size());
        }
    }
}
