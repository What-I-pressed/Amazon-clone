package com.finale.amazon.dto;


import com.finale.amazon.entity.Order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusRequestDto {
    private Long id;
    
    public OrderStatusRequestDto(Order order) {
        this.id = order.getId();
        
    }
}
