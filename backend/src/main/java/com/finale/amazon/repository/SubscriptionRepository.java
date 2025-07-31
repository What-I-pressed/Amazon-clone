package com.finale.amazon.repository;

import com.finale.amazon.entity.Subscription;
import com.finale.amazon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findBySubscriber(User subscriber);

    List<Subscription> findBySubscribedTo(User subscribedTo);

    Optional<Subscription> findBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);

    void deleteBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
}
