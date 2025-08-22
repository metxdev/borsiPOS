package com.borsibaar.backend.controller;

import com.borsibaar.backend.dtos.OrderDto;
import com.borsibaar.backend.dtos.OrderItemDto;
import com.borsibaar.backend.entity.Order;
import com.borsibaar.backend.entity.User;
import com.borsibaar.backend.service.OrderService;
import com.borsibaar.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api")
public class OrderController {
    private final OrderService orderService;
    private final ProductService productService;

    public OrderController(OrderService orderService, ProductService productService) {
        this.orderService = orderService;
        this.productService = productService;
    }

    @GetMapping("orders")
    public List<OrderDto> list(@AuthenticationPrincipal User principal) {
        return mapOrdersToDto(orderService.findAll());
    }

    @PostMapping("orders")
    @ResponseStatus(HttpStatus.CREATED)
    public Order create(@RequestBody OrderDto orderDto,
                        @AuthenticationPrincipal User principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthenticated");
        }
        return orderService.save(orderDto, principal);
    }

    @PutMapping("orders/{id}")
    public Order update(@PathVariable Long id,
                        @RequestBody OrderDto dto,
                        @AuthenticationPrincipal User principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthenticated");
        }
        return orderService.update(id, dto, principal);
    }

    @DeleteMapping("orders/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal User principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthenticated");
        }
        orderService.delete(id, principal);
    }

    @GetMapping("orders/my")
    public List<OrderDto> getMyOrders(@AuthenticationPrincipal User principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthenticated");
        }
        return orderService.getMyOrders(principal); // Already DTOs
    }

    private List<OrderDto> mapOrdersToDto(List<Order> orders) {
        return orders.stream().map(order -> {
            List<OrderItemDto> items = order.getItems().stream()
                    .map(i -> OrderItemDto.builder()
                            .quantity(i.getQuantity())
                            .product(productService.buildDto(i.getProduct())) // includes priceChange & priceUp
                            .build())
                    .toList();

            return OrderDto.builder()
                    .id(order.getId())
                    .createdAt(order.getCreatedAt().toString())
                    .total(order.getTotal())
                    .items(items)
                    .build();
        }).toList();
    }
}
