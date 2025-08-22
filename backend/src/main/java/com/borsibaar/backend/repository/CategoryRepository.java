package com.borsibaar.backend.repository;

import com.borsibaar.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByOwner_Id(Integer ownerId);
    Optional<Category> findByNameAndOwner_Id(String name, Integer ownerId);
}
