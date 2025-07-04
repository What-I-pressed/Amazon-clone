package com.finale.amazon.security;

import java.sql.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import com.finale.amazon.entity.User;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String key;

    @Value("${jwt.expiration:86400000}")
    private long expirationTime;

    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getEmail())
            .claim("userId", user.getId())
            .claim("username", user.getUsername())
            .claim("description", user.getDescription())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
            .signWith(SignatureAlgorithm.HS256, key)
            .compact();
    }

    public String generateShortToken(User user) {
        return Jwts.builder()
            .setSubject(user.getEmail())
            .claim("userId", user.getId())
            .claim("type", "short")
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
            .signWith(SignatureAlgorithm.HS256, key)
            .compact();
    }

    public String generateLongToken(User user) {
        return Jwts.builder()
            .setSubject(user.getEmail())
            .claim("userId", user.getId())
            .claim("username", user.getUsername())
            .claim("description", user.getDescription())
            .claim("type", "long")
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + 604800000)) // 7 days
            .signWith(SignatureAlgorithm.HS256, key)
            .compact();
    }

    private io.jsonwebtoken.Claims extractAllClaims(String token) {
        return Jwts.parser()
            .setSigningKey(key)
            .parseClaimsJws(token)
            .getBody();
    }

    public Long extractUserId(String token) {
        return extractAllClaims(token).get("userId", Long.class);
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).get("username", String.class);
    }

    public String extractDescription(String token) {
        return extractAllClaims(token).get("description", String.class);
    }

    public String extractSubject(String token) {
        return extractAllClaims(token).getSubject();
    }

    public java.util.Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public boolean isTokenValid(String token, String userName) {
        final String username = extractUsername(token);
        return (username.equals(userName) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new java.util.Date());
    }
    
    public long getRemainingTime(String token) {
        java.util.Date expiration = extractExpiration(token);
        java.util.Date now = new java.util.Date();
        return expiration.getTime() - now.getTime();
    }
    

    public boolean isTokenExpiringSoon(String token, long withinMillis) {
        long remaining = getRemainingTime(token);
        return remaining > 0 && remaining < withinMillis;
    }
    
    public String getTokenType(String token) {
        return extractAllClaims(token).get("type", String.class);
    }
}
