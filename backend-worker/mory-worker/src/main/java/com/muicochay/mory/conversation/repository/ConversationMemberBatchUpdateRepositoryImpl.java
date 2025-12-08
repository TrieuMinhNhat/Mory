package com.muicochay.mory.conversation.repository;

import com.muicochay.mory.conversation.dto.ConversationMemberUpdate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ConversationMemberBatchUpdateRepositoryImpl implements ConversationMemberBatchUpdateRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public ConversationMemberBatchUpdateRepositoryImpl(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void batchUpdate(List<ConversationMemberUpdate> updates) {
        if (updates.isEmpty()) return;

        StringBuilder lastReadMessageIdCase = new StringBuilder();
        StringBuilder lastReadAtCase = new StringBuilder();
        StringBuilder unreadCountCase = new StringBuilder();

        List<String> whereClauses = new ArrayList<>();
        MapSqlParameterSource params = new MapSqlParameterSource();

        int index = 0;
        for (ConversationMemberUpdate u : updates) {
            String convParam = "convId" + index;
            String userParam = "userId" + index;

            whereClauses.add("(conversation_id = :" + convParam + " AND user_id = :" + userParam + ")");
            params.addValue(convParam, u.conversationId());
            params.addValue(userParam, u.userId());

            // last_read_message_id CASE
            lastReadMessageIdCase.append("WHEN (conversation_id = :").append(convParam)
                    .append(" AND user_id = :").append(userParam).append(") THEN ");
            if (u.lastReadMessageId() != null) {
                String paramName = "lastReadMessageId" + index;
                lastReadMessageIdCase.append(":").append(paramName).append(" ");
                params.addValue(paramName, u.lastReadMessageId().toHexString());
            } else {
                lastReadMessageIdCase.append("last_read_message_id ");
            }

            // last_read_at CASE
            lastReadAtCase.append("WHEN (conversation_id = :").append(convParam)
                    .append(" AND user_id = :").append(userParam).append(") THEN ");
            if (u.lastReadAt() != null) {
                String paramName = "lastReadAt" + index;
                lastReadAtCase.append(":").append(paramName).append(" ");
                params.addValue(paramName, u.lastReadAt());
            } else {
                lastReadAtCase.append("last_read_at ");
            }

            // unread_count CASE
            unreadCountCase.append("WHEN (conversation_id = :").append(convParam)
                    .append(" AND user_id = :").append(userParam).append(") THEN :unreadCount")
                    .append(index).append(" ");

            params.addValue("unreadCount" + index, u.unreadCount());

            index++;
        }

        String sql = "UPDATE conversation_members SET " +
                "last_read_message_id = CASE " + lastReadMessageIdCase + "ELSE last_read_message_id END, " +
                "last_read_at = CASE " + lastReadAtCase + "ELSE last_read_at END, " +
                "unread_count = CASE " + unreadCountCase + "ELSE unread_count END " +
                "WHERE " + String.join(" OR ", whereClauses);

        jdbcTemplate.update(sql, params);
    }
}
