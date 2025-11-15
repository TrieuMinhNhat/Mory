package com.muicochay.mory.question.document;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Document(collection = "daily_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyQuestion {
    @Id
    private ObjectId id;
    private UUID relationshipId;
    private LocalDate date;

    private List<QuestionAnswer> questions = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionAnswer {
        private Integer questionId;
        private Map<UUID, String> answers; // userId -> answer
    }
}
