package com.finale.amazon.controller;

import com.finale.amazon.entity.Subscription;
import com.finale.amazon.entity.User;
import com.finale.amazon.service.SubscriptionService;
import com.finale.amazon.service.UserService;
import com.finale.amazon.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return jwtUtil.extractSubject(token);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Subscription>> getMySubscriptions(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        User subscriber = userOpt.get();
        List<Subscription> subscriptions = subscriptionService.getSubscriptionsBySubscriber(subscriber);

        if (subscriptions.isEmpty()) return ResponseEntity.noContent().build();

        return ResponseEntity.ok(subscriptions);
    }

    @PostMapping("/{subscribedToId}")
    public ResponseEntity<?> subscribe(@RequestHeader("Authorization") String authHeader,
                                       @PathVariable Long subscribedToId) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        User subscriber = userOpt.get();

        try {
            subscriptionService.subscribe(subscriber.getId(), subscribedToId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{subscribedToId}")
    public ResponseEntity<?> unsubscribe(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable Long subscribedToId) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        User subscriber = userOpt.get();

        try {
            subscriptionService.unsubscribe(subscriber.getId(), subscribedToId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
