package com.muicochay.mory.connection.mapper;

import com.muicochay.mory.connection.dto.ConnectionRequestResponse;
import com.muicochay.mory.connection.entity.ConnectionRequest;
import com.muicochay.mory.user.mapper.UserMapper;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ConnectionRequestMapper {
    ConnectionRequestResponse toResponse(ConnectionRequest connectionRequest);

    List<ConnectionRequestResponse> toResponseList(List<ConnectionRequest> connectionRequests);
}
