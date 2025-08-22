package com.borsibaar.backend.controller;

import com.borsibaar.backend.dtos.RegisterUserDto;
import com.borsibaar.backend.dtos.UpdateUserDto;
import com.borsibaar.backend.dtos.UserDto;
import com.borsibaar.backend.entity.User;
import com.borsibaar.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserDto.from(user));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> allUsers() {
        List<UserDto> dtos = userService.allUsers().stream()
                .map(UserDto::from)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody RegisterUserDto dto) {
        User user = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserDto.from(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUserById(@PathVariable Integer id, @Valid @RequestBody UpdateUserDto dto) {
        User updatedUser = userService.updateUserById(id, dto);
        return ResponseEntity.ok(UserDto.from(updatedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}
