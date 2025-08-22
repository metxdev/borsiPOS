package com.borsibaar.backend.dtos;

import com.borsibaar.backend.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.Date;

@Getter
@Builder
public class UserDto {
    private Integer id;
    private String fullName;
    private String email;
    private Date createdAt;
    private Date updatedAt;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
