package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.dto.ConversationMemberCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ConversationMemberBatchRepositoryImpl implements ConversationMemberBatchRepository {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void saveAllIgnoreDuplicates(List<ConversationMemberCreateRequest> members) {
        String sql = """
            INSERT INTO conversation_members
                (id, conversation_id, user_id, role, unread_count)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (conversation_id, user_id) DO NOTHING
        """;

        List<Object[]> batchArgs = members.stream()
                .map(m -> new Object[]{
                        UUID.randomUUID(),
                        m.getConversationId(),
                        m.getUserId(),
                        m.getRole().name(),
                        0
                })
                .toList();

        jdbcTemplate.batchUpdate(sql, batchArgs);
    }
}
