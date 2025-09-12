package com.finale.amazon.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDto {
    // Address
    private String fullName;
    private String address;
    private String city;
    private String postalCode;

    // Contacts
    private String email;
    private String phone;

    // Payment
    private String paymentMethod;

    // Items
    private List<OrderItemDto> items;
}
