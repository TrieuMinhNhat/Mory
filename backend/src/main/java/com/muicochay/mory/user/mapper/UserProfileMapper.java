package com.muicochay.mory.user.mapper;

import com.muicochay.mory.user.dto.UserProfileDto;
import com.muicochay.mory.user.entity.UserProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {

    UserProfileDto toDto(UserProfile userProfile);
}
