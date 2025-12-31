package com.muicochay.mory.notification.helper.story;

import com.muicochay.mory.story.entity.Story;
import com.muicochay.mory.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class StoryNotificationMetadata {

    public Map<String, Object> addedToStory(User fromUser, Story story) {
        return Map.of(
                "fromUserId", fromUser.getId(),
                "fromUserName", fromUser.getProfile().getDisplayName(),
                "fromUserAvatar", fromUser.getProfile().getAvatarUrl(),
                "storyId", story.getId(),
                "storyTitle", story.getTitle()
        );
    }

    public Map<String, Object> storyDissolved(User fromUser, Story story) {
        return Map.of(
                "fromUserId", fromUser.getId(),
                "fromUserName", fromUser.getProfile().getDisplayName(),
                "fromUserAvatar", fromUser.getProfile().getAvatarUrl(),
                "storyId", story.getId(),
                "storyTitle", story.getTitle()
        );
    }
}
