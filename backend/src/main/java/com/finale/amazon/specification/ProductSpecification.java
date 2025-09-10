package com.finale.amazon.specification;

import org.springframework.data.jpa.domain.Specification;

import com.finale.amazon.entity.CharacteristicType;
import com.finale.amazon.entity.CharacteristicValue;
import com.finale.amazon.entity.Product;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {
    public static Specification<Product> hasName(String name) {
        return (root, query, cb) -> name == null ? null
                : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Product> hasCategory(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Product> priceBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null)
                return null;
            if (minPrice == null)
                return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
            if (maxPrice == null)
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            return cb.between(root.get("price"), minPrice, maxPrice);
        };
    }

    public static Specification<Product> matchCharacteristic(String typeName, String value) {
        return (root, query, cb) -> {
            Join<Product, CharacteristicValue> values = root.join("characteristics", JoinType.LEFT);
            Join<CharacteristicValue, CharacteristicType> names = values.join("characteristicType", JoinType.LEFT);

            return cb.and(
                    cb.equal(cb.lower(names.get("name")), typeName.toLowerCase()),
                    cb.like(cb.lower(values.get("value")), "%" + value.toLowerCase() + "%"));
        };
    }
}
