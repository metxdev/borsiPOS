package com.borsibaar.backend.dtos;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginUserDto {
    private String email;
    private String password;
}

