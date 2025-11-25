package com.muicochay.mory.question.entity;

import com.muicochay.mory.question.enums.QuestionType;
import com.muicochay.mory.shared.entity.BaseAuditEntity;
import com.muicochay.mory.shared.enums.Locale;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OlyneQuestion extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "content_en", nullable = false)
    private String contentEN;

    @Column(name = "content_vi", nullable = false)
    private String contentVI;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private QuestionTopic topic;

    @Column
    private Integer difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(nullable = false)
    private boolean active = true;

    public String getContentByLocale(Locale locale) {
        return switch (locale) {
            case EN -> contentEN;
            case VI -> contentVI;
        };
    }
}
