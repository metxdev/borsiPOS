package com.borsibaar.backend.dtos;

import com.borsibaar.backend.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.util.Date;

@Getter
@Builder
public class UserDto {
    private Integer id;
    private String fullName;
    private String email;
    private Role role;
    private Date createdAt;
    private Date updatedAt;
}
