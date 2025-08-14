package com.finale.amazon.dto;

import lombok.Data;

@Data
public class PaymentRequestDto {
    private long amount;
    private String currency;
    private Long orderId;
} 