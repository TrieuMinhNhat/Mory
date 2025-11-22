package com.muicochay.mory.admin.mapper;

import com.muicochay.mory.admin.dto.user.AdminUserResponse;
import com.muicochay.mory.user.entity.User;
import com.muicochay.mory.user.mapper.UserProfileMapper;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {UserProfileMapper.class})
public interface AdminUserMapper {

    @Mapping(target = "isPasswordVerified", expression = "java(user.isPasswordVerified())")
    @Mapping(target = "isDeleted", expression = "java(user.isDeleted())")
    AdminUserResponse toDto(User user);

}
