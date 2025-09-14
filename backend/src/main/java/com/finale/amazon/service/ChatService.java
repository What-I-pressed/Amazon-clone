package com.finale.amazon.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finale.amazon.dto.MessageDto;
import com.finale.amazon.entity.Message;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.MessageRepository;
import com.finale.amazon.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public MessageDto sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());

        Message saved = messageRepository.save(message);
        return new MessageDto(saved);
    }

    public List<MessageDto> getMessagesBetweenUsers(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1).orElseThrow();
        User user2 = userRepository.findById(userId2).orElseThrow();

        List<Message> messages = messageRepository.findBySenderAndReceiverOrderByCreatedAtAsc(user1, user2);
        messages.addAll(messageRepository.findBySenderAndReceiverOrderByCreatedAtAsc(user2, user1));

        messages.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));

        return messages.stream()
                .map(MessageDto::new)
                .collect(Collectors.toList());
    }

    public List<MessageDto> getAllMessagesForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Message> messages = messageRepository.findByReceiverOrderByCreatedAtAsc(user);
        return messages.stream()
                .map(MessageDto::new)
                .collect(Collectors.toList());
    }
    @Transactional
    public MessageDto editMessage(Long messageId, Long userId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (message.getSender().getId() != userId)  {
            throw new RuntimeException("You are not authorized to edit this message");
        }

        message.setContent(newContent);
        message.setEditedAt(LocalDateTime.now());
        Message updated = messageRepository.save(message);
        return new MessageDto(updated);
    }
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));

         if (message.getSender().getId() != userId) {
            throw new RuntimeException("You are not authorized to delete this message");
        }

        messageRepository.delete(message);
    }
}
