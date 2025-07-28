package com.borsibaar.backend.dtos;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterUserDto {
    private String email;

    private String password;

    private String fullName;
}
