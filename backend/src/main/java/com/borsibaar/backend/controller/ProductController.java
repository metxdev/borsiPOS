package com.borsibaar.backend.controller;

import com.borsibaar.backend.dtos.CreateProductDto;
import com.borsibaar.backend.dtos.ProductDTO;
import com.borsibaar.backend.dtos.UpdateProductDto;
import com.borsibaar.backend.service.ProductService;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDTO> list() {
        return productService.findAll();
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDTO create(@RequestBody CreateProductDto body) {
        return productService.save(body);
    }

    @PutMapping("/{id}")
    public ProductDTO update(@PathVariable Long id,
                             @RequestBody UpdateProductDto dto) {
        return productService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

}
