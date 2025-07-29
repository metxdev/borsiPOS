package com.borsibaar.backend.service;

import com.borsibaar.backend.dtos.CategoryDto;
import com.borsibaar.backend.entity.Category;
import com.borsibaar.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category save(Category body) {
        if (body == null) return null;

        if (categoryRepository.findByName(body.getName()).isPresent()) {
            throw new IllegalArgumentException("Category already exists");
        }
        return categoryRepository.save(body);
    }

    public Category update(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow();

        category.setName(dto.getName());
        return category;
    }

    public Category delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow();
        categoryRepository.findById(id);
        return category;
    }
}
