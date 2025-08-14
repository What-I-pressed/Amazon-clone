package com.finale.amazon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResponseDto {
    private String clientSecret;
    private String paymentIntentId;
    private String status;
} 