package com.finale.amazon.specification;

import org.springframework.data.jpa.domain.Specification;

import com.finale.amazon.entity.Product;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {
    public static Specification<Product> hasName(String name) {
        return (root, query, cb) ->
                name == null ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Product> hasCategory(Long categoryId) {
        return (root, query, cb) ->
                categoryId == null ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Product> priceBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) return null;
            if (minPrice == null) return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
            if (maxPrice == null) return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            return cb.between(root.get("price"), minPrice, maxPrice);
        };
    }

    public static Specification<Product> matchCharacteristic(String typeName, String value) {
        return (root, query, cb) -> {

            Join<Object, Object> values = root.join("characteristics", JoinType.LEFT);
            Join<Object, Object> names = values.join("characteristicType", JoinType.LEFT);

            Predicate predicate = cb.conjunction();
            
            predicate = cb.and(predicate, cb.equal(names.get("name"), typeName));
            predicate = cb.and(predicate, cb.equal(values.get("value"), value));

            return predicate;
        };
    }
}
