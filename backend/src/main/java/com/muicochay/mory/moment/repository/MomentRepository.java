package com.muicochay.mory.moment.repository;

import com.muicochay.mory.moment.entity.Moment;
import com.muicochay.mory.moment.interfaces.ChallengeProgressProjection;
import com.muicochay.mory.shared.enums.Visibility;
import com.muicochay.mory.story.interfaces.StoryMomentCountProjection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;


public interface MomentRepository extends JpaRepository<Moment, UUID> {
    @Query(value = """
            SELECT
                COUNT(*) as total,
                COALESCE(BOOL_OR(m.date = :date), false) as existsToday
            FROM moments m
            WHERE m.story_id = :storyId
              AND m.user_id = :userId
              AND m.deleted_at IS NULL
        """, nativeQuery = true)
    ChallengeProgressProjection getChallengeProgress(
            @Param("storyId") UUID storyId,
            @Param("userId") UUID userId,
            @Param("date") LocalDate date
    );

    Optional<Moment> findByIdAndDeletedAtIsNull(UUID id);

    @Query(value = """
            SELECT m.id
            FROM moments m
            WHERE m.user_id = :creatorId
              AND m.deleted_at IS NULL
              AND (
                  (:asc = TRUE AND (m.created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                      OR (m.created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND m.id > :cursorId)))
                  OR (:asc = FALSE AND (m.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                      OR (m.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND m.id < :cursorId)))
              )
            ORDER BY
                CASE WHEN :asc = TRUE THEN m.created_at END ASC,
                CASE WHEN :asc = TRUE THEN m.id END ASC,
                CASE WHEN :asc = FALSE THEN m.created_at END DESC,
                CASE WHEN :asc = FALSE THEN m.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findMomentIdsKeyset(
            @Param("creatorId") UUID creatorId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("asc") boolean asc,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT m.id
            FROM moments m
            WHERE m.user_id = :creatorId
              AND m.visibility IN (:visibilities)
              AND m.deleted_at IS NULL
              AND (
                  (:asc = TRUE AND (m.created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                      OR (m.created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND m.id > :cursorId)))
                  OR (:asc = FALSE AND (m.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                      OR (m.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND m.id < :cursorId)))
              )
            ORDER BY
                CASE WHEN :asc = TRUE THEN m.created_at END ASC,
                CASE WHEN :asc = TRUE THEN m.id END ASC,
                CASE WHEN :asc = FALSE THEN m.created_at END DESC,
                CASE WHEN :asc = FALSE THEN m.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findVisibleIdsKeyset(
            @Param("creatorId") UUID creatorId,
            @Param("visibilities") Collection<String> visibilities,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("asc") boolean asc,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT m.id
            FROM moments m
            WHERE m.story_id = :storyId
              AND m.deleted_at IS NULL
              AND (
                  (:asc = TRUE AND (m.created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                      OR (m.created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND m.id > :cursorId)))
                  OR (:asc = FALSE AND (m.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                      OR (m.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND m.id < :cursorId)))
              )
            ORDER BY
                CASE WHEN :asc = TRUE THEN m.created_at END ASC,
                CASE WHEN :asc = TRUE THEN m.id END ASC,
                CASE WHEN :asc = FALSE THEN m.created_at END DESC,
                CASE WHEN :asc = FALSE THEN m.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findIdsByStoryIdKeyset(
            @Param("storyId") UUID storyId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("asc") boolean asc,
            @Param("limit") int limit
    );

    boolean existsByStoryIdAndDeletedAtIsNull(UUID storyId);

    @Modifying
    @Query("""
            UPDATE Moment m
            SET m.visibility = :visibility
            WHERE m.story.id = :storyId
        """)
    int updateVisibilityByStoryId(
            @Param("storyId") UUID storyId,
            @Param("visibility") Visibility visibility
    );

    @Modifying
    @Query("""
            UPDATE Moment m
            SET m.deletedAt = :deletedAt
            WHERE m.story.id = :storyId
        """)
    int softDeleteByStoryId(@Param("storyId") UUID storyId,
                            @Param("deletedAt") Instant deletedAt);

    @Modifying
    @Query("""
            UPDATE Moment m
            SET m.story = null
            WHERE m.story.id = :storyId
        """)
    int unlinkByStoryId(@Param("storyId") UUID storyId);

    @Modifying
    @Query("""
        UPDATE Moment m
        SET m.story = null
        WHERE m.story.id = :storyId
          AND m.user.id = :userId
    """)
    int unlinkByStoryIdAndUserId(
            @Param("storyId") UUID storyId,
            @Param("userId") UUID userId
    );

    @Modifying
    @Query("""
        UPDATE Moment m
        SET m.story = null
        WHERE m.story.id = :storyId
          AND m.user.id IN :userIds
    """)
    int unlinkByStoryIdAndUserIds(
            @Param("storyId") UUID storyId,
            @Param("userIds") Collection<UUID> userIds
    );

    @Modifying
    @Query("""
            UPDATE Moment m
            SET m.deletedAt = :deletedAt
            WHERE m.story.id = :storyId
            AND m.user.id = :userId
        """)
    int softDeleteByStoryIdAndUserId(
            @Param("storyId") UUID storyId,
            @Param("userId") UUID userId,
            @Param("deletedAt") Instant deletedAt
    );

    @Modifying
    @Query("""
            UPDATE Moment m
            SET m.story.id = :newStoryId
            WHERE m.story.id = :oldStoryId
              AND m.user.id = :userId
        """)
    int moveMomentsToAnotherStory(
            @Param("oldStoryId") UUID oldStoryId,
            @Param("newStoryId") UUID newStoryId,
            @Param("userId") UUID userId
    );

    @EntityGraph(attributePaths = {
            "user",
            "story"
    })
    @Query("""
        SELECT m
        FROM Moment m
        WHERE m.id IN :ids
          AND m.deletedAt IS NULL
    """)
    List<Moment> findAllByIdInWithUserAndStory(
            @Param("ids") Collection<UUID> ids
    );

    @Modifying
    @Query("""
            UPDATE Moment m
            SET m.deletedAt = :deletedAt
            WHERE m.story.id = :storyId
              AND m.user.id IN :userIds
        """)
    int softDeleteByStoryIdAndUserIds(
            @Param("storyId") UUID storyId,
            @Param("userIds") Collection<UUID> userIds,
            @Param("deletedAt") Instant deletedAt
    );

    @Query(value = """
            SELECT sub.id
            FROM (
                SELECT m.id, m.created_at
                FROM moments m
                WHERE m.deleted_at IS NULL
                  AND m.story_id IS NULL
                  AND (
                      m.user_id = :requesterId
                      OR EXISTS (
                          SELECT 1
                          FROM connections c
                          WHERE c.status = 'CONNECTED'
                            AND (
                                (c.user1_id = :requesterId AND c.user2_id = m.user_id)
                             OR (c.user2_id = :requesterId AND c.user1_id = m.user_id)
                            )
                            AND (
                                (c.connection_type = 'FRIEND' AND m.visibility = 'ALL_FRIENDS')
                             OR (c.connection_type = 'CLOSE_FRIEND' AND m.visibility IN ('ALL_FRIENDS','CLOSE_FRIENDS'))
                             OR (c.connection_type = 'SPECIAL' AND m.visibility IN ('ALL_FRIENDS','CLOSE_FRIENDS','PARTNER_ONLY'))
                            )
                      )
                  )

                UNION ALL

                SELECT t.id, t.created_at
                        FROM (
                            SELECT DISTINCT ON (m.story_id)
                                   m.id,
                                   m.created_at
                            FROM moments m
                            WHERE m.deleted_at IS NULL
                              AND m.story_id IS NOT NULL
                              AND (
                                  m.user_id = :requesterId
                                  OR EXISTS (
                                      SELECT 1
                                      FROM connections c
                                      WHERE c.status = 'CONNECTED'
                                        AND (
                                            (c.user1_id = :requesterId AND c.user2_id = m.user_id)
                                         OR (c.user2_id = :requesterId AND c.user1_id = m.user_id)
                                        )
                                        AND (
                                            (c.connection_type = 'FRIEND' AND m.visibility = 'ALL_FRIENDS')
                                         OR (c.connection_type = 'CLOSE_FRIEND' AND m.visibility IN ('ALL_FRIENDS','CLOSE_FRIENDS'))
                                         OR (c.connection_type = 'SPECIAL' AND m.visibility IN ('ALL_FRIENDS','CLOSE_FRIENDS','PARTNER_ONLY'))
                                        )
                                  )
                                  OR m.story_id IN (
                                      SELECT s.id
                                      FROM stories s
                                      WHERE s.creator_id = :requesterId
                                      UNION
                                      SELECT sm.story_id
                                      FROM story_members sm
                                      WHERE sm.user_id = :requesterId
                                  )
                              )
                            ORDER BY m.story_id, m.created_at DESC, m.id DESC
                        ) t
            ) sub
            WHERE (
                sub.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                     OR (sub.created_at = :cursorCreatedAt AND sub.id < :cursorId)
                )
            ORDER BY sub.created_at DESC, sub.id DESC
            LIMIT :limit
            """,
            nativeQuery = true
    )
    List<UUID> findFeedsKeyset(
            @Param("requesterId") UUID requesterId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT sub.id
            FROM (
                SELECT
                    m.id,
                    m.created_at
                FROM moments m
                WHERE m.deleted_at IS NULL
                  AND m.story_id IS NULL
                  AND (
                        m.user_id = :requesterId
                     OR (m.visibility = 'ALL_FRIENDS' AND m.user_id = ANY(:allFriends))
                     OR (m.visibility = 'CLOSE_FRIENDS' AND m.user_id = ANY(:closeFriends))
                     OR (m.visibility = 'PARTNER_ONLY' AND m.user_id = ANY(:partners))
                  )
        
                UNION ALL
        
                SELECT DISTINCT ON (m.story_id) m.id, m.created_at
                FROM moments m
                WHERE m.deleted_at IS NULL
                  AND m.story_id IS NOT NULL
                  AND (
                        m.user_id = :requesterId
                     OR (m.visibility = 'ALL_FRIENDS' AND m.user_id = ANY(:allFriends))
                     OR (m.visibility = 'CLOSE_FRIENDS' AND m.user_id = ANY(:closeFriends))
                     OR (m.visibility = 'PARTNER_ONLY' AND m.user_id = ANY(:partners))
                  )
            ) sub
            WHERE (
                  sub.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
               OR (sub.created_at = :cursorCreatedAt AND sub.id < :cursorId)
            )
            ORDER BY sub.created_at DESC, sub.id DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findFeedsKeysetOptimized(
            UUID requesterId,
            Instant cursorCreatedAt,
            UUID cursorId,
            int limit,
            UUID[] allFriends,
            UUID[] closeFriends,
            UUID[] partners
    );

    @Query(value = """
            SELECT sub.id
            FROM (
                SELECT m.id, m.created_at
                FROM moments m
                WHERE m.deleted_at IS NULL
                  AND m.visibility IN (:visibilities)
                  AND m.story_id IS NULL
                  AND m.user_id = :targetUserId
        
                SELECT t.id, t.created_at
                   FROM (
                    SELECT DISTINCT ON (m.story_id)
                         m.id,
                         m.created_at
                         FROM moments m
                         WHERE m.deleted_at IS NULL
                             AND m.story_id IS NOT NULL
                             AND m.visibility IN (:visibilities)
                             AND m.user_id = :targetUserId
                         ORDER BY m.story_id, m.created_at DESC, m.id DESC
                    ) t
            ) sub
            WHERE (
                sub.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                     OR (sub.created_at = :cursorCreatedAt AND sub.id < :cursorId)
                )
            ORDER BY sub.created_at DESC, sub.id DESC
            LIMIT :limit
            """,
            nativeQuery = true
    )
    List<UUID> findFeedsByTargetUser(
            @Param("targetUserId") UUID targetUserId,
            @Param("visibilities") Collection<String> visibilities,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT sub.id
            FROM (
                SELECT m.id, m.created_at
                FROM moments m
                WHERE m.deleted_at IS NULL
                  AND m.story_id IS NULL
                  AND m.user_id = :targetUserId
        
                UNION ALL
           
                SELECT t.id, t.created_at
                     FROM (
                          SELECT DISTINCT ON (m.story_id)
                          m.id,
                          m.created_at
                          FROM moments m
                               WHERE m.deleted_at IS NULL
                                    AND m.story_id IS NOT NULL
                                    AND m.user_id = :targetUserId
                          ORDER BY m.story_id, m.created_at DESC, m.id DESC
                     ) t
       
            ) sub
            WHERE (
                sub.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                     OR (sub.created_at = :cursorCreatedAt AND sub.id < :cursorId)
                )
            ORDER BY sub.created_at DESC, sub.id DESC
            LIMIT :limit
            """,
            nativeQuery = true
    )
    List<UUID> findFeedsMe(
            @Param("targetUserId") UUID targetUserId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("limit") int limit
    );

    Optional<Moment> findFirstByUserIdAndStoryIdAndDeletedAtIsNullOrderByCreatedAtDescIdDesc(
            UUID userId,
            UUID storyId
    );

    Optional<Moment> findFirstByStoryIdAndUserIdNotAndDeletedAtIsNullOrderByCreatedAtDescIdDesc(
            UUID storyId,
            UUID excludedUserId
    );

    @Query("""
        select
            m.story.id as storyId,
            count(m) as total
        from Moment m
        where m.story.id in :storyIds
          and m.deletedAt is null
        group by m.story.id
    """)
    List<StoryMomentCountProjection> countMomentsByStoryIds(List<UUID> storyIds);

    @Query("""
            select
                m.story.id as storyId,
                count(m) as total
            from Moment m
            where m.story.id = :storyId
              and m.deletedAt is null
            group by m.story.id
        """)
    Optional<StoryMomentCountProjection> countMomentsByStoryId(UUID storyId);
}