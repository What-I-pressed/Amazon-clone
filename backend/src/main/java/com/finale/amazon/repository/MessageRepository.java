package com.finale.amazon.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.finale.amazon.entity.Message;
import com.finale.amazon.entity.User;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiverOrderByCreatedAtAsc(User sender, User receiver);
    List<Message> findBySenderOrReceiverOrderByCreatedAtAsc(User sender, User receiver);

}
 