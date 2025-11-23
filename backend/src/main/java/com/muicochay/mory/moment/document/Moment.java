package com.muicochay.mory.moment.document;

import com.fantus.mory.shared.enums.Visibility;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Document(collection = "moments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Moment {
    @Id
    private ObjectId id;

    private UUID storyId;
    private UUID userId;
    private String mediaUrl;
    private String audioUrl;
    private String caption;

    private Visibility visibility;

    private Integer position;
    private Integer dayIndex;

    private LocalDate date;

    private Instant deletedAt;

    private boolean milestone = false;

    private List<UUID> tags = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant lastModifiedAt;
}
