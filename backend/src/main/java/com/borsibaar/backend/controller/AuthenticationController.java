package com.borsibaar.backend.controller;

import com.borsibaar.backend.dtos.AuthUserDto;
import com.borsibaar.backend.dtos.LoginUserDto;
import com.borsibaar.backend.dtos.RegisterUserDto;
import com.borsibaar.backend.entity.User;
import com.borsibaar.backend.service.AuthenticationService;
import com.borsibaar.backend.service.JwtService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final Logger log = LoggerFactory.getLogger(getClass());


    public AuthenticationController(
            JwtService jwtService,
            AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterUserDto dto) {
        try {
            User saved = authenticationService.signup(dto);
            AuthUserDto registeredDto = AuthUserDto.from(saved);
            String token = jwtService.generateTokenForUser(saved.getEmail());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", registeredDto
            ));
        } catch (Exception e) {
            log.error("Signup failed for email {}: {}", dto.getEmail(), e.getMessage(), e);
            throw e; // let global handler translate
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        LoginUserDto loginDto = new LoginUserDto();
        loginDto.setEmail(request.getEmail());
        loginDto.setPassword(request.getPassword());

        User user = authenticationService.authenticate(loginDto);
        AuthUserDto userDto = AuthUserDto.from(user);
        String token = jwtService.generateTokenForUser(user.getEmail());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", userDto
        ));
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
