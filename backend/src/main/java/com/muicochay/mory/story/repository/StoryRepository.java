package com.muicochay.mory.story.repository;

import com.muicochay.mory.story.entity.Story;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StoryRepository extends JpaRepository<Story, UUID> {

    @Query(value = """
            SELECT s.id
            FROM stories s
            WHERE s.deleted_at IS NULL
              AND (
                s.creator_id = :userId
                OR EXISTS (
                      SELECT 1
                      FROM story_members sm
                      WHERE sm.story_id = s.id
                      AND sm.user_id = :userId
                )
              )
              AND s.type = COALESCE(:type, s.type)
              AND (
                  (:asc = TRUE AND (s.created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                      OR (s.created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND s.id > :cursorId)))
                  OR (:asc = FALSE AND (s.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                      OR (s.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND s.id < :cursorId)))
              )
            ORDER BY
                CASE WHEN :asc = TRUE THEN s.created_at END ASC,
                CASE WHEN :asc = TRUE THEN s.id END ASC,
                CASE WHEN :asc = FALSE THEN s.created_at END DESC,
                CASE WHEN :asc = FALSE THEN s.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findIdsByUserIdAndTypeKeyset(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("asc") boolean asc,
            @Param("limit") int limit
    );

    @EntityGraph(attributePaths = {"members"})
    @Query("""
            SELECT s FROM Story s
            WHERE s.id = :id
                AND s.deletedAt IS NULL
            """)
    Optional<Story> findByIdAndDeletedAtIsNull(@Param("id") UUID storyId);

    @Query("""
        select s
        from Story s
        where s.id in :ids
          and s.deletedAt is null
    """)
    List<Story> findAllByIdsAndDeletedAtIsNull(List<UUID> ids);

    @Query(value = """
            SELECT s.id
            FROM stories s
            WHERE s.deleted_at IS NULL
              AND (
                s.creator_id = :userId
                OR s.id IN (
                        SELECT m.story_id
                        FROM story_members m
                        WHERE m.user_id = :userId
                    )
                )
              AND s.visibility IN :visibilities
              AND s.type = COALESCE(:type, s.type)
              AND (
                  (:asc = TRUE AND (s.created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                      OR (s.created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND s.id > :cursorId)))
                  OR (:asc = FALSE AND (s.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                      OR (s.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND s.id < :cursorId)))
              )
            ORDER BY
                CASE WHEN :asc = TRUE THEN s.created_at END ASC,
                CASE WHEN :asc = TRUE THEN s.id END ASC,
                CASE WHEN :asc = FALSE THEN s.created_at END DESC,
                CASE WHEN :asc = FALSE THEN s.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findVisibleIdsByTypeKeyset(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("visibilities") Collection<String> visibilities,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("asc") boolean asc,
            @Param("limit") int limit
    );

    @EntityGraph(attributePaths = {"creator", "creator.profile", "members", "members.user", "members.user.profile"})
    @Query("SELECT s FROM Story s WHERE s.id IN :ids AND s.deletedAt IS NULL")
    List<Story> findAllByIdInWithGraph(@Param("ids") Collection<UUID> ids);

    @EntityGraph(attributePaths = {"creator", "creator.profile", "members", "members.user", "members.user.profile"})
    @Query("SELECT s FROM Story s WHERE s.id IN :ids AND s.deletedAt IS NULL")
    List<Story> findAllByIdWithMembers(@Param("ids") Collection<UUID> ids);

    @EntityGraph(attributePaths = {"creator", "creator.profile", "members", "members.user", "members.user.profile"})
    @Query("SELECT s FROM Story s WHERE s.id = :storyId AND s.deletedAt IS NULL")
    Optional<Story> findByIdWithMembers(@Param("storyId") UUID storyId);

    @EntityGraph(attributePaths = {"creator", "creator.profile"})
    @Query("SELECT s FROM Story s WHERE s.id = :storyId AND s.deletedAt IS NULL")
    Optional<Story> findByIdWithCreatorAndProfile(@Param("storyId") UUID storyId);

    @EntityGraph(attributePaths = {"creator"})
    @Query("SELECT s FROM Story s WHERE s.id = :storyId AND s.deletedAt IS NULL")
    Optional<Story> findByIdWithCreator(@Param("storyId") UUID storyId);

    @Query(value = """
            WITH moment_stats AS (
                SELECT
                    m.story_id,
                    COUNT(*) FILTER (WHERE m.deleted_at IS NULL AND m.user_id = :userId) AS total_moments,
                    BOOL_OR(
                        (m.deleted_at IS NULL
                        AND m.user_id = :userId
                        AND m.created_at::date = :today)
                    ) AS has_today_moment
                FROM moments m
                GROUP BY m.story_id
            )
            SELECT s.id
            FROM stories s
            LEFT JOIN moment_stats ms ON ms.story_id = s.id
            WHERE s.deleted_at IS NULL
              AND (
                  s.creator_id = :userId
                  OR EXISTS (
                      SELECT 1
                      FROM story_members sm
                      WHERE sm.story_id = s.id
                      AND sm.user_id = :userId
                  )
              )
              AND (
                  (:type IS NULL)
                  OR s.type = :type
              )
              AND (
                  (s.type = 'BEFORE_AFTER' AND (s.has_before = FALSE OR s.has_after = FALSE))
                  OR (s.type = 'JOURNEY'
                      AND :today >= s.start_date
                      AND :today <= COALESCE(s.end_date, :today)
                  )
                  OR (s.type = 'CHALLENGE'
                      AND :today >= DATE(s.start_date)
                      AND :today <= COALESCE(DATE(s.end_date), :today)
                      AND COALESCE(ms.total_moments, 0) < s.duration
                      AND COALESCE(ms.has_today_moment, FALSE) = FALSE
                      AND (COALESCE(s.end_date, :today) - :today + 1) >= (s.duration - COALESCE(ms.total_moments, 0))
                  )
                  OR (s.type = 'ALBUM')
              )
              AND (
                s.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                OR (s.created_at = :cursorCreatedAt AND s.id < :cursorId)
              )
              ORDER BY s.created_at DESC, s.id DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findAvailableIdsForAddMomentKeysetOptimized(
            @Param("userId") UUID userId,
            @Param("today") LocalDate today,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("limit") int limit,
            @Param("type") String type
    );
}
