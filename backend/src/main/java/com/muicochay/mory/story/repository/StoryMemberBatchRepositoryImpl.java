package com.muicochay.mory.story.repository;

import com.muicochay.mory.story.dto.StoryMemberCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class StoryMemberBatchRepositoryImpl implements StoryMemberBatchRepository {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void saveAllIgnoreDuplicates(List<StoryMemberCreateRequest> members) {
        String sql = """
            INSERT INTO story_members (id, story_id, user_id, created_at)
            VALUES (?, ?, ?, now())
            ON CONFLICT (story_id, user_id) DO NOTHING
        """;

        List<Object[]> batchArgs = members.stream()
                .map(m -> new Object[]{
                        UUID.randomUUID(),
                        m.getStoryId(),
                        m.getUserId()
                })
                .toList();

        jdbcTemplate.batchUpdate(sql, batchArgs);
    }
}
