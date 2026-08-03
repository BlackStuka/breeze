package com.breeze.security.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * JWT 只放 userId(subject)。权限不进 token,每次请求实时从 DB 读。
 * 复用 echonote 已在 SB4.1 验证的 jjwt 0.12.6 写法。
 */
@Service
public class JwtService {

	private final SecretKey key;
	private final long ttlHours;

	public JwtService(@Value("${breeze.jwt.secret}") String secret,
			@Value("${breeze.jwt.ttl-hours}") long ttlHours) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.ttlHours = ttlHours;
	}

	public String issue(Long userId) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(String.valueOf(userId))
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plus(ttlHours, ChronoUnit.HOURS)))
				.signWith(key)
				.compact();
	}

	public Long parseUserId(String token) {
		String subject = Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject();
		return Long.valueOf(subject);
	}
}
