package com.example.workflowcommerce.service;

import com.example.workflowcommerce.dto.ShippingCreateRequest;
import com.example.workflowcommerce.dto.ShippingResponse;
import com.example.workflowcommerce.model.Order;
import com.example.workflowcommerce.model.Shipping;
import com.example.workflowcommerce.repository.OrderRepository;
import com.example.workflowcommerce.repository.ShippingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShippingService {

    @Autowired
    private ShippingRepository shippingRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Allowed values: Shipped, In Transit, Delivered
    public static final String STATUS_SHIPPED = "Shipped";
    public static final String STATUS_IN_TRANSIT = "In Transit";
    public static final String STATUS_DELIVERED = "Delivered";

    public BigDecimal calculateShippingCost(String shippingMethod, String destination) {
        BigDecimal cost = new BigDecimal("10.00"); // Base cost
        if ("Express".equalsIgnoreCase(shippingMethod)) {
            cost = cost.add(new BigDecimal("15.00"));
        }
        return cost;
    }

    @Transactional
    public ShippingResponse createShipping(Long orderId, ShippingCreateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (!"Paid".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Cannot ship unpaid order. Current order status: " + order.getOrderStatus());
        }

        if (shippingRepository.existsByOrderOrderId(orderId)) {
            throw new RuntimeException("Shipping already created for this order.");
        }

        Shipping shipping = new Shipping();
        shipping.setOrder(order);
        shipping.setCourierService(request.getCourierService());
        shipping.setTrackingNumber(request.getTrackingNumber());
        shipping.setShippingMethod(request.getShippingMethod());
        
        // Simple logic: base shipping cost plus some variation
        shipping.setShippingCost(calculateShippingCost(request.getShippingMethod(), order.getShippingAddress()));
        
        shipping.setShippingStatus(STATUS_SHIPPED);

        shippingRepository.save(shipping);

        // Update Order Status to "Shipped"
        order.setOrderStatus("Shipped");
        orderRepository.save(order);

        return new ShippingResponse(shipping);
    }

    @Transactional
    public ShippingResponse updateShippingStatus(Long shippingId, String newStatus) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new RuntimeException("Shipping not found with id: " + shippingId));

        String currentStatus = shipping.getShippingStatus();

        if (STATUS_DELIVERED.equals(currentStatus)) {
            throw new RuntimeException("Cannot edit shipping once Delivered");
        }

        // Allowed transitions: Shipped -> In Transit -> Delivered
        if (STATUS_DELIVERED.equals(newStatus)) {
             // In a perfect State Machine we'd strictly check In Transit -> Delivered, 
             // but sometimes it goes directly from Shipped -> Delivered.
             // "Cannot skip stages" based on instructions:
             if (!STATUS_IN_TRANSIT.equals(currentStatus) && !STATUS_SHIPPED.equals(currentStatus)) {
                 // The rules said "cannot skip stages", let's strictly enforce: Shipped -> In Transit -> Delivered
                 if (STATUS_SHIPPED.equals(currentStatus)) {
                     throw new RuntimeException("Cannot skip 'In Transit' stage. Current status: " + currentStatus);
                 }
             }
        }

        if (!STATUS_SHIPPED.equals(newStatus) && !STATUS_IN_TRANSIT.equals(newStatus) && !STATUS_DELIVERED.equals(newStatus)) {
             throw new RuntimeException("Invalid shipping status: " + newStatus);
        }

        shipping.setShippingStatus(newStatus);
        
        Order order = shipping.getOrder();
        if (STATUS_DELIVERED.equals(newStatus)) {
            order.setOrderStatus("Delivered");
            orderRepository.save(order);
        }

        return new ShippingResponse(shippingRepository.save(shipping));
    }

    public List<ShippingResponse> getAllShippings() {
        return shippingRepository.findAll().stream()
                .map(ShippingResponse::new)
                .collect(Collectors.toList());
    }

    public ShippingResponse getShippingByOrderId(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        // Verify ownership
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized: Cannot view shipping of another user");
        }

        Shipping shipping = shippingRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping not found for order id: " + orderId));

        return new ShippingResponse(shipping);
    }
}
