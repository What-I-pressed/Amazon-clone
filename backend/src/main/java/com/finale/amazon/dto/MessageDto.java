package com.finale.amazon.dto;

import java.time.LocalDateTime;

import com.finale.amazon.entity.Message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {

    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;
    private boolean read;

    public MessageDto(Message message) {
        this.id = message.getId();
        if (message.getSender() != null) {
            this.senderId = message.getSender().getId();
        }
        if (message.getReceiver() != null) {
            this.receiverId = message.getReceiver().getId();
        }
        this.content = message.getContent();
        this.createdAt = message.getCreatedAt();
        this.read = message.isRead();
    }
}
