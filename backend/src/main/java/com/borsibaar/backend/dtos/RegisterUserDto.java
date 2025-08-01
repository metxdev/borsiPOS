package com.borsibaar.backend.dtos;

import com.borsibaar.backend.entity.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterUserDto {
    private String email;
    private String password;
    private String fullName;
    private Role role;
}

