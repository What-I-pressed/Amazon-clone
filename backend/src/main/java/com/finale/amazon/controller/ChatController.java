package com.finale.amazon.controller;

import com.finale.amazon.dto.EditMessageRequest;
import com.finale.amazon.dto.MessageDto;
import com.finale.amazon.dto.SendMessageRequest;
import com.finale.amazon.dto.UserDto;
import com.finale.amazon.service.ChatService;
import com.finale.amazon.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@Tag(name = "Chat Controller", description = "Контролер для роботи з чатами")
public class ChatController {

    @Autowired
    private ChatService chatService;
    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "Позначити повідомлення прочитаним", description = "Оновлює статус повідомлення на 'прочитане'")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Повідомлення позначене як прочитане"),
            @ApiResponse(responseCode = "400", description = "Токен протермінований або некоректний"),
            @ApiResponse(responseCode = "403", description = "Користувач не має доступу до цього повідомлення"),
            @ApiResponse(responseCode = "404", description = "Повідомлення не знайдено")
    })
    @PutMapping("/read/{messageId}")
    public ResponseEntity<MessageDto> markMessageAsRead(
            @RequestParam String token,
            @PathVariable Long messageId) {

        if (jwtUtil.isTokenExpired(token))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired");

        Long userId = jwtUtil.extractUserId(token);
        MessageDto updatedMessage = chatService.markMessageAsRead(messageId, userId);
        return ResponseEntity.ok(updatedMessage);
    }


    @Operation(summary = "Відправити повідомлення", description = "Створює нове повідомлення від поточного користувача до іншого користувача")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Повідомлення успішно відправлено"),
            @ApiResponse(responseCode = "400", description = "Токен протермінований або некоректний"),
            @ApiResponse(responseCode = "403", description = "Не можна надіслати повідомлення самому собі"),
            @ApiResponse(responseCode = "404", description = "Отримувач не знайдений")
    })
    @PostMapping("/send")
    public ResponseEntity<MessageDto> sendMessage(
            @RequestParam String token,
            @RequestBody SendMessageRequest request) {

        if (jwtUtil.isTokenExpired(token))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired");

        Long senderId = jwtUtil.extractUserId(token);
        if (senderId.equals(request.getReceiverId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot send message to yourself");
        }
        MessageDto sentMessage = chatService.sendMessage(senderId, request.getReceiverId(), request.getContent());
        return ResponseEntity.ok(sentMessage);
    }


    @Operation(summary = "Редагувати повідомлення", description = "Редагує повідомлення, створене поточним користувачем")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Повідомлення успішно відредаговано"),
            @ApiResponse(responseCode = "400", description = "Токен протермінований або некоректний"),
            @ApiResponse(responseCode = "403", description = "Користувач не авторизований редагувати повідомлення"),
            @ApiResponse(responseCode = "404", description = "Повідомлення не знайдено")
    })
   @PutMapping("/edit/{messageId}")
    public ResponseEntity<MessageDto> editMessage(@RequestParam String token,@PathVariable Long messageId,@RequestBody EditMessageRequest request) {
        if (jwtUtil.isTokenExpired(token))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired");

        Long userId = jwtUtil.extractUserId(token);
        MessageDto updatedMessage = chatService.editMessage(messageId, userId, request.getContent());
        return ResponseEntity.ok(updatedMessage);
    }


    @Operation(summary = "Видалити повідомлення", description = "Видаляє повідомлення, створене поточним користувачем")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Повідомлення успішно видалено"),
            @ApiResponse(responseCode = "400", description = "Токен протермінований або некоректний"),
            @ApiResponse(responseCode = "403", description = "Користувач не авторизований видаляти повідомлення"),
            @ApiResponse(responseCode = "404", description = "Повідомлення не знайдено")
    })
    @DeleteMapping("/delete/{messageId}")
    public ResponseEntity<String> deleteMessage(
            @RequestParam String token,
            @Parameter(description = "ID повідомлення") @PathVariable Long messageId) {

        if (jwtUtil.isTokenExpired(token))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired");

        Long userId = jwtUtil.extractUserId(token);
        chatService.deleteMessage(messageId, userId);
        return ResponseEntity.ok("Message deleted successfully");
    }

    @Operation(summary = "Отримати повідомлення між двома користувачами", description = "Повертає список повідомлень між поточним користувачем та іншим користувачем")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Повідомлення отримано"),
            @ApiResponse(responseCode = "400", description = "Токен протермінований або некоректний")
    })
    @GetMapping("/between/{userId}")
    public ResponseEntity<List<MessageDto>> getMessagesWithUser(
            @RequestParam String token,
            @Parameter(description = "ID іншого користувача") @PathVariable Long userId) {

        if (jwtUtil.isTokenExpired(token)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        Long currentUserId = jwtUtil.extractUserId(token);
        List<MessageDto> messages = chatService.getMessagesBetweenUsers(currentUserId, userId);
        return ResponseEntity.ok(messages);
    }

    @Operation(summary = "Отримати всі повідомлення користувача", description = "Повертає всі повідомлення, де поточний користувач є отримувачем")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Повідомлення отримано"),
            @ApiResponse(responseCode = "400", description = "Токен протермінований або некоректний")
    })
    @GetMapping("/all")
    public ResponseEntity<List<MessageDto>> getAllMessages(
            @RequestParam String token) {

        if (jwtUtil.isTokenExpired(token)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        Long currentUserId = jwtUtil.extractUserId(token);
        List<MessageDto> messages = chatService.getAllMessagesForUser(currentUserId);
        return ResponseEntity.ok(messages);
    }

    @Operation(summary = "Отримати всіх чат-партнерів користувача", 
           description = "Повертає список всіх користувачів, з якими спілкувався поточний користувач")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список чат-партнерів успішно отримано"),
            @ApiResponse(responseCode = "400", description = "Токен протермінований або некоректний")
    })
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getChatUsers(@RequestParam String token) {
        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Long currentUserId = jwtUtil.extractUserId(token);
        List<UserDto> chatUsers = chatService.getChatUsersForUser(currentUserId);

        return ResponseEntity.ok(chatUsers);
    }


}
