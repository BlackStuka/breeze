package com.breeze.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * 登录用户(作为 Authentication 的 principal)。
 * 装载 userId/username/password/authorities(权限字符串集合)。
 */
@Getter
public class LoginUser implements UserDetails {

	private final Long userId;
	private final String username;
	private final String password;
	private final Collection<? extends GrantedAuthority> authorities;

	public LoginUser(Long userId, String username, String password,
			Collection<? extends GrantedAuthority> authorities) {
		this.userId = userId;
		this.username = username;
		this.password = password;
		this.authorities = authorities == null ? List.of() : authorities;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
