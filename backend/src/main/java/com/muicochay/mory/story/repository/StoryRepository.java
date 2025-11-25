package com.muicochay.mory.story.repository;

import com.muicochay.mory.story.entity.Story;
import org.bson.types.ObjectId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
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

    @Query(value = """
        SELECT s.latest_moment_id
        FROM stories s
        WHERE s.deleted_at IS NULL
          AND (
            s.creator_id IN :userIds
            OR EXISTS (
                SELECT 1
                FROM story_members sm
                WHERE sm.story_id = s.id
                  AND sm.user_id IN :userIds
            )
          )
          AND (
              (:asc = TRUE AND (
                  s.latest_moment_created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                  OR (s.latest_moment_created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND s.latest_moment_id > :cursorMomentId)
              ))
              OR (:asc = FALSE AND (
                  s.latest_moment_created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                  OR (s.latest_moment_created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND s.latest_moment_id < :cursorMomentId)
              ))
          )
        ORDER BY
            CASE WHEN :asc = TRUE THEN s.latest_moment_created_at END ASC,
            CASE WHEN :asc = TRUE THEN s.latest_moment_id END ASC,
            CASE WHEN :asc = FALSE THEN s.latest_moment_created_at END DESC,
            CASE WHEN :asc = FALSE THEN s.latest_moment_id END DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<ObjectId> findLatestMomentIdsByUserIdsKeysetLatestMoment(
            @Param("userIds") Collection<UUID> userIds,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorMomentId") ObjectId cursorMomentId,
            @Param("asc") boolean asc,
            @Param("limit") int limit
    );

    @Query(value = """
        SELECT s.latest_moment_id
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
          AND (
              (:asc = TRUE AND (
                  s.latest_moment_created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                  OR (s.latest_moment_created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND s.latest_moment_id > :cursorMomentId)
              ))
              OR (:asc = FALSE AND (
                  s.latest_moment_created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                  OR (s.latest_moment_created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND s.latest_moment_id < :cursorMomentId)
              ))
          )
        ORDER BY
            CASE WHEN :asc = TRUE THEN s.latest_moment_created_at END ASC,
            CASE WHEN :asc = TRUE THEN s.latest_moment_id END ASC,
            CASE WHEN :asc = FALSE THEN s.latest_moment_created_at END DESC,
            CASE WHEN :asc = FALSE THEN s.latest_moment_id END DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<ObjectId> findLatestMomentIdsByUserIdKeysetLatestMoment(
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorMomentId") ObjectId cursorMomentId,
            @Param("asc") boolean asc,
            @Param("limit") int limit
    );


    @Query("""
            SELECT s FROM Story s
            WHERE s.id = :id
                AND s.deletedAt IS NULL
            """)
    Optional<Story> findActiveById(@Param("id") UUID storyId);

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

    @EntityGraph(attributePaths = {"creator", "creator.profile", "members", "members.user"})
    @Query("SELECT s FROM Story s WHERE s.id IN :ids AND s.deletedAt IS NULL")
    List<Story> findAllByIdInWithGraph(@Param("ids") Collection<UUID> ids);

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
              AND (
                  (:type IS NULL)
                  OR s.type = :type
              )
              AND (
                  (s.type = 'BEFORE_AFTER' AND (s.has_before = FALSE OR s.has_after = FALSE))
                  OR (s.type = 'JOURNEY'
                      AND CURRENT_DATE >= DATE(s.start_date)
                      AND CURRENT_DATE <= COALESCE(DATE(s.end_date), CURRENT_DATE)
                  )
                  OR (s.type = 'CHALLENGE'
                      AND CURRENT_DATE >= DATE(s.start_date)
                      AND CURRENT_DATE <= COALESCE(DATE(s.end_date), CURRENT_DATE)
                  )
                  OR (s.type = 'ALBUM')
              )
              AND (
                  (:asc = TRUE AND (
                      s.created_at > COALESCE(:cursorCreatedAt, '-infinity'::timestamptz)
                      OR (s.created_at = COALESCE(:cursorCreatedAt, '-infinity'::timestamptz) AND s.id > :cursorId)
                  ))
                  OR (:asc = FALSE AND (
                      s.created_at < COALESCE(:cursorCreatedAt, 'infinity'::timestamptz)
                      OR (s.created_at = COALESCE(:cursorCreatedAt, 'infinity'::timestamptz) AND s.id < :cursorId)
                  ))
              )
            ORDER BY
                CASE WHEN :asc = TRUE THEN s.created_at END ASC,
                CASE WHEN :asc = TRUE THEN s.id END ASC,
                CASE WHEN :asc = FALSE THEN s.created_at END DESC,
                CASE WHEN :asc = FALSE THEN s.id END DESC
            LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findAvailableIdsForAddMomentKeysetOptimized(
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") UUID cursorId,
            @Param("asc") boolean asc,
            @Param("limit") int limit,
            @Param("type") String type
    );
}
