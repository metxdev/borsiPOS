package com.borsibaar.backend.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    @Test
    void getCategoryId_shouldReturnCategoryIdIfCategoryIsSet() {
        Category category = Category.builder().id(42L).name("Cocktails").build();
        Product product = Product.builder().category(category).build();
        assertEquals(42L, product.getCategoryId());
    }

    @Test
    void getCategoryName_shouldReturnNameIfCategoryIsSet() {
        Category category = Category.builder().name("Cocktails").build();
        Product product = Product.builder().category(category).build();
        assertEquals("Cocktails", product.getCategoryName());
    }

    @Test
    void getId() {
        Product product = Product.builder().id(12L).build();
        assertEquals(12L, product.getId());
    }

    @Test
    void getName() {
        Product product = Product.builder().name("Jhon").build();
        assertEquals("Jhon", product.getName());
    }

    @Test
    void getDescription() {
        Product product = Product.builder().description("Some description").build();
        assertEquals("Some description", product.getDescription());
    }

    @Test
    void getPrice() {
        Product product = Product.builder().price(BigDecimal.valueOf(23)).build();
        assertEquals(BigDecimal.valueOf(23), product.getPrice());
    }

    @Test
    void getSalesCount() {
        Product product = Product.builder().salesCount(100L).build();
        assertEquals(100L, product.getSalesCount());
    }

    @Test
    void getCategory() {
        Category category = Category.builder().name("Beer").build();
        Product product = Product.builder().category(category).build();
        assertEquals(category, product.getCategory());
    }

    @Test
    void getLastSaleAt() {
        LocalDateTime now = LocalDateTime.now();
        Product product = Product.builder().lastSaleAt(now).build();
        assertEquals(now, product.getLastSaleAt());
    }

    @Test
    void jsonSerialization_includesCategoryIdAndName_butNotCategoryObject() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Category category = Category.builder().id(1L).name("Wine").build();
        Product product = Product.builder()
                .id(10L)
                .name("Merlot")
                .category(category)
                .build();

        String json = mapper.writeValueAsString(product);

        assertTrue(json.contains("\"categoryId\":1"));
        assertTrue(json.contains("\"categoryName\":\"Wine\""));
        assertFalse(json.contains("\"category\""));
    }
}
