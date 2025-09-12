package com.finale.amazon.specification;

import org.springframework.data.jpa.domain.Specification;

import com.finale.amazon.entity.CharacteristicValue;
import com.finale.amazon.entity.Product;
import com.finale.amazon.entity.Subcategory;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public class CharacteristicSpecification {
    public static Specification<CharacteristicValue> belongToSubcategory(Long subcategoryId){
        return (root, query, cb) -> {
            root.join("characteristicType", JoinType.LEFT);
            query.distinct(true);
            
            Join<CharacteristicValue, Product> prods = root.join("product", JoinType.INNER);
            Join<Product, Subcategory> subs = prods.join("subcategory", JoinType.INNER);

            //query.groupBy(root.get("characteristicType").get("id"));
            

            return cb.equal(subs.get("id"), subcategoryId);
        };
    }
}
