package com.borsibaar.backend.service;

import com.borsibaar.backend.dtos.RegisterUserDto;
import com.borsibaar.backend.dtos.UpdateUserDto;
import com.borsibaar.backend.entity.User;
import com.borsibaar.backend.exceptions.ResourceNotFoundException;
import com.borsibaar.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> allUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    public java.util.Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }

    public java.util.Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(RegisterUserDto dto) {
        userRepository.findByEmail(dto.getEmail()).ifPresent(u -> {
            throw new DataIntegrityViolationException("Email already in use");
        });

        User user = User.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();
        return userRepository.save(user);
    }

    public User updateUserById(Integer id, UpdateUserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getEmail() != null) {
            userRepository.findByEmail(dto.getEmail())
                    .filter(u -> !u.getId().equals(id))
                    .ifPresent(u -> { throw new DataIntegrityViolationException("Email already in use"); });
            user.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteUserById(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }
}
