package com.borsibaar.backend.service;

import com.borsibaar.backend.dtos.OrderDto;
import com.borsibaar.backend.entity.Order;
import com.borsibaar.backend.entity.OrderItem;
import com.borsibaar.backend.entity.Product;
import com.borsibaar.backend.repository.OrderRepository;
import com.borsibaar.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    public OrderService(OrderRepository orderRepo, ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    public List<Order> findAll() {
        return orderRepo.findAll();
    }

    @Transactional
    public Order save(OrderDto dto) {
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        LocalDateTime now = LocalDateTime.now();

        Order order = Order.builder()
                .createdAt(now)
                .build();

        List<OrderItem> items = dto.getItems().stream().map(itemDto -> {
            Product product = productRepo.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

            // Update product stats
            long oldCount = product.getSalesCount() == null ? 0L : product.getSalesCount();
            product.setSalesCount(oldCount + itemDto.getQuantity());

            if (isCocktailOrShot(product.getCategoryName())) {
                BigDecimal bumped = product.getPrice().add(BigDecimal.valueOf(0.05));
                product.setPrice(bumped.min(BigDecimal.valueOf(9.00)));
            }

            product.setLastSaleAt(now);
            productRepo.save(product);

            return OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .order(order)
                    .build();
        }).toList();

        BigDecimal total = items.stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setItems(items);
        order.setTotal(total.doubleValue());

        return orderRepo.save(order);
    }

    @Transactional
    public Order update(Long id, OrderDto dto) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        order.getItems().clear();

        List<OrderItem> items = dto.getItems().stream().map(itemDto -> {
            Product product = productRepo.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

            return OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .order(order)
                    .build();
        }).toList();

        BigDecimal total = items.stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setItems(items);
        order.setTotal(total.doubleValue());

        return orderRepo.save(order);
    }

    public void delete(Long id) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        orderRepo.delete(order);
    }

    private boolean isCocktailOrShot(String categoryName) {
        return categoryName != null &&
                (categoryName.equalsIgnoreCase("cocktails") || categoryName.equalsIgnoreCase("shots"));
    }

}
