package com.muicochay.mory.user.worker;

import com.muicochay.mory.auth.enums.AuthProvider;
import com.muicochay.mory.user.repositoriy.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnverifiedUserCleanupService {
    private final UserRepository userRepository;

    @Scheduled(cron = "0 */2 * * * *")
    @Transactional
    public void deleteUnverifiedUsersOlderThan7Days() {
        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        int deletedCount = userRepository.deleteUnverifiedEmailPasswordOnlyUsers(cutoff, AuthProvider.EMAIL_PASSWORD);
        log.info("Deleted {} unverified email-password users older than 7 days.", deletedCount);
    }
}
