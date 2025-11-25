package com.muicochay.mory.connection.mapper;

import com.muicochay.mory.connection.dto.ConnectionResponse;
import com.muicochay.mory.connection.entity.Connection;
import com.muicochay.mory.user.mapper.UserMapper;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ConnectionMapper {
    ConnectionResponse toResponse(Connection connection);

    List<ConnectionResponse> toResponseList(List<Connection> connectionList);
}
