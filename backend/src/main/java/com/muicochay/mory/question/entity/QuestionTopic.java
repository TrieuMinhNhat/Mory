package com.muicochay.mory.question.entity;

import com.fantus.mory.shared.entity.BaseAuditEntity;
import com.fantus.mory.shared.enums.Locale;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "question_topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionTopic extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name_en", nullable = false, unique = true)
    private String nameEN;

    @Column(name = "name_vi", nullable = false, unique = true)
    private String nameVI;

    @Column(name = "description_en", nullable = false)
    private String descriptionEN;
    @Column(name = "description_vi", nullable = false)
    private String descriptionVI;

    public String getNameByLocale(Locale locale) {
        return switch (locale) {
            case EN -> nameEN;
            case VI -> nameVI;
        };
    }

    public String getDescriptionByLocale(Locale locale) {
        return switch (locale) {
            case EN -> descriptionEN;
            case VI -> descriptionVI;
        };
    }
}
