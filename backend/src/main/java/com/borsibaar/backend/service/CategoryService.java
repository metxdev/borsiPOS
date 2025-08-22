package com.borsibaar.backend.service;

import com.borsibaar.backend.dtos.CategoryDto;
import com.borsibaar.backend.entity.Category;
import com.borsibaar.backend.entity.User;
import com.borsibaar.backend.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll(User user) {
        return categoryRepository.findByOwner_Id(user.getId());
    }

    public Category save(CategoryDto dto, User user) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }

        categoryRepository.findByNameAndOwner_Id(dto.getName(), user.getId())
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category already exists");
                });

        Category category = Category.builder()
                .name(dto.getName().trim())
                .owner(user)
                .build();

        return categoryRepository.save(category);
    }

    public Category update(Long id, CategoryDto dto, User user) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!category.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify another user's category");
        }

        category.setName(dto.getName().trim());
        return categoryRepository.save(category);
    }

    public void delete(Long id, User user) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!category.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another user's category");
        }

        categoryRepository.delete(category);
    }
}
