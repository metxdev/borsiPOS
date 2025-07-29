package com.borsibaar.backend.repository;

import com.borsibaar.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByNameAndCategory_Id(String name, Long categoryId);
}
