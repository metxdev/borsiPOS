package com.borsibaar.backend.dtos;

import com.borsibaar.backend.entity.User;

public record AuthUserDto(
        Integer id,
        String fullName,
        String email
) {
    public static AuthUserDto from(User u) {
        return new AuthUserDto(
                u.getId(),
                u.getFullName(),
                u.getEmail()
        );
    }
}
