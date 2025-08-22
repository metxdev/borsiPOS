package com.borsibaar.backend.service;

import com.borsibaar.backend.dtos.OrderDto;
import com.borsibaar.backend.dtos.OrderItemDto;
import com.borsibaar.backend.entity.*;
import com.borsibaar.backend.repository.OrderRepository;
import com.borsibaar.backend.repository.PriceHistoryRepository;
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
    private final PriceHistoryRepository priceHistoryRepo;
    private final ProductService productService;

    public OrderService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        PriceHistoryRepository priceHistoryRepo,
                        ProductService productService) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.priceHistoryRepo = priceHistoryRepo;
        this.productService = productService;
    }

    public List<Order> findAll() {
        return orderRepo.findAll();
    }

    public List<OrderDto> getMyOrders(User user) {
        return orderRepo.findByUser(user).stream().map(order -> {
            List<OrderItemDto> itemDtos = order.getItems().stream()
                    .map(item -> OrderItemDto.builder()
                            .quantity(item.getQuantity())
                            .product(productService.buildDto(item.getProduct()))
                            .build())
                    .toList();

            return OrderDto.builder()
                    .id(order.getId())
                    .createdAt(order.getCreatedAt().toString())
                    .total(order.getTotal())
                    .items(itemDtos)
                    .build();
        }).toList();
    }

    @Transactional
    public Order save(OrderDto dto, User user) {
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        LocalDateTime now = LocalDateTime.now();

        Order order = Order.builder()
                .createdAt(now)
                .user(user)
                .build();

        List<OrderItem> items = dto.getItems().stream().map(itemDto -> {
            Product product = productRepo.findById(itemDto.getProduct().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

            long oldCount = product.getSalesCount() == null ? 0L : product.getSalesCount();
            product.setSalesCount(oldCount + itemDto.getQuantity());

            // Adjust price dynamically
            adjustPrice(product, isCocktailOrShot(product.getCategoryName()), now);

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
    public Order update(Long id, OrderDto dto, User user) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify another user's order");
        }

        order.getItems().clear();

        List<OrderItem> items = dto.getItems().stream().map(itemDto -> {
            Product product = productRepo.findById(itemDto.getProduct().getId())
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

    public void delete(Long id, User user) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another user's order");
        }

        orderRepo.delete(order);
    }

    private boolean isCocktailOrShot(String categoryName) {
        return categoryName != null &&
                (categoryName.equalsIgnoreCase("cocktails") || categoryName.equalsIgnoreCase("shots"));
    }

    /**
     * Adjusts the price: cocktails/shots go up by 10%, others go down by 6%.
     */
    private void adjustPrice(Product product, boolean highDemand, LocalDateTime now) {
        final BigDecimal UP_PCT   = new BigDecimal("0.10"); // 10% up
        final BigDecimal DOWN_PCT = new BigDecimal("0.06"); // 6% down

        BigDecimal oldPrice = product.getPrice();
        BigDecimal newPrice = highDemand
                ? oldPrice.multiply(BigDecimal.ONE.add(UP_PCT))
                : oldPrice.multiply(BigDecimal.ONE.subtract(DOWN_PCT));

        // Clamp between min and max price
        newPrice = newPrice.max(product.getMinPrice()).min(product.getMaxPrice());

        if (oldPrice.compareTo(newPrice) == 0) return; // no change

        product.setPrice(newPrice);

        priceHistoryRepo.save(PriceHistory.builder()
                .product(product)
                .oldPrice(oldPrice)
                .newPrice(newPrice)
                .changedAt(now)
                .reason(highDemand ? "Auto price bump from order" : "Auto price drop due to lower demand")
                .build());
    }
}
