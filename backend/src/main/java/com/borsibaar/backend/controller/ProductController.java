package com.borsibaar.backend.controller;

import com.borsibaar.backend.dtos.CreateProductDto;
import com.borsibaar.backend.dtos.ProductDTO;
import com.borsibaar.backend.dtos.UpdateProductDto;
import com.borsibaar.backend.entity.User;
import com.borsibaar.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/my")
    public List<ProductDTO> myProducts(@AuthenticationPrincipal User principal) {
        return productService.findForUser(principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDTO create(@RequestBody CreateProductDto body,
                             @AuthenticationPrincipal User principal) {
        return productService.create(body, principal);
    }

    @PutMapping("/{id}")
    public ProductDTO update(@PathVariable Long id,
                             @RequestBody UpdateProductDto dto,
                             @AuthenticationPrincipal User principal) {
        return productService.update(id, dto, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal User principal) {
        productService.delete(id, principal);
    }
}
