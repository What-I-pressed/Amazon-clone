package com.finale.amazon.service;

import com.finale.amazon.entity.Subscription;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.SubscriptionRepository;
import com.finale.amazon.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Subscription> getSubscriptionsBySubscriber(User subscriber) {
        return subscriptionRepository.findBySubscriber(subscriber);
    }

    public List<Subscription> getSubscribersOfUser(User subscribedTo) {
        return subscriptionRepository.findBySubscribedTo(subscribedTo);
    }

    public void subscribe(Long subscriberId, Long subscribedToId) {
        if (subscriberId.equals(subscribedToId)) {
            throw new RuntimeException("You cannot subscribe to yourself");
        }

        User subscriber = userRepository.findById(subscriberId)
                .orElseThrow(() -> new EntityNotFoundException("Subscriber not found"));

        User subscribedTo = userRepository.findById(subscribedToId)
                .orElseThrow(() -> new EntityNotFoundException("User to subscribe to not found"));

        boolean alreadySubscribed = subscriptionRepository.findBySubscriberAndSubscribedTo(subscriber, subscribedTo).isPresent();
        if (alreadySubscribed) {
            throw new RuntimeException("Already subscribed to this user");
        }

        Subscription subscription = new Subscription();
        subscription.setSubscriber(subscriber);
        subscription.setSubscribedTo(subscribedTo);
        subscription.setSubscribedAt(LocalDateTime.now());

        subscriptionRepository.save(subscription);
    }

    public void unsubscribe(Long subscriberId, Long subscribedToId) {
        User subscriber = userRepository.findById(subscriberId)
                .orElseThrow(() -> new EntityNotFoundException("Subscriber not found"));

        User subscribedTo = userRepository.findById(subscribedToId)
                .orElseThrow(() -> new EntityNotFoundException("User to unsubscribe from not found"));

        subscriptionRepository.deleteBySubscriberAndSubscribedTo(subscriber, subscribedTo);
    }
}
