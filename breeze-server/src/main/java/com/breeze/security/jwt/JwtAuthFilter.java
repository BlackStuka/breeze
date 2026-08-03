package com.breeze.security.jwt;

import com.breeze.security.LoginUser;
import com.breeze.system.entity.SysUser;
import com.breeze.system.mapper.SysUserMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 每次请求:解析 JWT 拿 userId → 实时查 DB 用户 + 权限 → 构建 Authentication。
 * 权限不入 token,改权限/禁用用户即时生效(代价:每请求一次 DB 查询)。
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final SysUserMapper sysUserMapper;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith("Bearer ")) {
			try {
				Long userId = jwtService.parseUserId(header.substring(7));
				SysUser user = sysUserMapper.selectOneById(userId);
				if (user != null && user.getStatus() != null && user.getStatus() == 1) {
					List<SimpleGrantedAuthority> authorities = sysUserMapper.selectPermsByUserId(userId).stream()
							.map(SimpleGrantedAuthority::new)
							.toList();
					LoginUser loginUser = new LoginUser(userId, user.getUsername(), user.getPassword(), authorities);
					UsernamePasswordAuthenticationToken auth =
							new UsernamePasswordAuthenticationToken(loginUser, null, authorities);
					SecurityContextHolder.getContext().setAuthentication(auth);
				}
			} catch (JwtException | IllegalArgumentException ignored) {
				// 无效/过期 token:不设上下文,由授权规则拒绝(401)
			}
		}
		chain.doFilter(request, response);
	}
}
