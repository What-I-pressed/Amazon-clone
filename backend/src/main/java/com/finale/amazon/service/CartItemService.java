package com.finale.amazon.service;

import com.finale.amazon.dto.CartItemDto;
import com.finale.amazon.entity.CartItem;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.User;
import com.finale.amazon.repository.CartItemRepository;
import com.finale.amazon.repository.ProductRepository;
import com.finale.amazon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;


    private void Authorize(Long userId, Long cartItemUserId){
        if(userId != cartItemUserId) throw new RuntimeException("Unauthorized");
    }

    @Transactional(readOnly = true)
    public List<CartItem> getCartItemsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<CartItem> items = cartItemRepository.findByUserWithMainPicture(user);
        return items;
    }

    public CartItem addCartItem(Long userId,CartItemDto cartItemDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(cartItemDto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByUser(user).stream()
                .filter(item -> item.getProduct().getId() == product.getId())
                .findFirst();
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartItemDto.getQuantity());
            return cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setProduct(product);
            newItem.setQuantity(cartItemDto.getQuantity());
            return cartItemRepository.save(newItem);
        }
    }

    public CartItem updateQuantity(Long userId, Long id, int quantity) {
        Optional<CartItem> itemOpt = cartItemRepository.findById(id);
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            Authorize(userId, item.getUser().getId());
            if (quantity <= 0) {
                cartItemRepository.delete(item);
                return null;
            }
            item.setQuantity(quantity);
            return cartItemRepository.save(item);
        }
        return null;
    }

    public boolean deleteCartItem(Long userId, Long id) {
        Optional<CartItem> itemOpt = cartItemRepository.findById(id);
        if (itemOpt.isPresent()) {
            Authorize(userId, itemOpt.get().getUser().getId());
            cartItemRepository.delete(itemOpt.get());
            return true;
        }
        return false;
    }

    @Transactional
    public void deleteAllItemsByUserId(Long userId){
        cartItemRepository.deleteByUser(userRepository.findById(userId).get());
    }
} 