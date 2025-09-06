package com.finale.amazon.dto;

import com.finale.amazon.entity.CharacteristicValue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CharacteristicDto {
    private String characteristic;
    private String value;

    public CharacteristicDto(CharacteristicValue val){
        characteristic = val.getCharacteristicType().getName();
        value = val.getValue();
    }
}
