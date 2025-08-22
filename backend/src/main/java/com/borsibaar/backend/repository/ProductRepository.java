package com.borsibaar.backend.repository;

import com.borsibaar.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByNameAndCategory_IdAndOwner_Id(String name, Long categoryId, Integer ownerId);
    List<Product> findByOwner_Id(Integer ownerId);

}
