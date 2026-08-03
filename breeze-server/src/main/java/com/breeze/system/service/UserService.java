package com.breeze.system.service;

import com.breeze.common.exception.BusinessException;
import com.breeze.common.response.PageResult;
import com.breeze.system.dto.PageQuery;
import com.breeze.system.dto.UserResp;
import com.breeze.system.dto.UserSaveRequest;
import com.breeze.system.entity.SysUser;
import com.breeze.system.mapper.SysUserMapper;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

	private final SysUserMapper userMapper;
	private final PasswordEncoder passwordEncoder;

	public PageResult<UserResp> page(PageQuery pq, String username) {
		QueryWrapper qw = QueryWrapper.create();
		if (username != null && !username.isBlank()) {
			qw.and(SysUser::getUsername).like(username);
		}
		qw.orderBy(SysUser::getCreateTime, false);
		Page<SysUser> p = userMapper.paginate(pq.effectivePageNum(), pq.effectivePageSize(), qw);
		List<UserResp> records = p.getRecords().stream()
				.map(u -> UserResp.of(u.getId(), u.getUsername(), u.getNickname(), u.getAvatar(),
						u.getEmail(), u.getPhone(), u.getStatus(), u.getCreateTime()))
				.toList();
		return PageResult.of(records, p.getTotalRow(), (int) p.getPageNumber(), (int) p.getPageSize());
	}

	public Long create(UserSaveRequest req) {
		if (req.password() == null || req.password().isBlank()) {
			throw new BusinessException(400, "密码不能为空");
		}
		if (userMapper.selectByUsername(req.username()) != null) {
			throw new BusinessException(400, "用户名已存在");
		}
		SysUser u = new SysUser();
		u.setUsername(req.username());
		u.setPassword(passwordEncoder.encode(req.password()));
		u.setNickname(req.nickname());
		u.setEmail(req.email());
		u.setPhone(req.phone());
		u.setStatus(req.status() == null ? 1 : req.status());
		userMapper.insert(u);
		return u.getId();
	}

	public void update(Long id, UserSaveRequest req) {
		SysUser u = userMapper.selectOneById(id);
		if (u == null) {
			throw new BusinessException(404, "用户不存在");
		}
		u.setNickname(req.nickname());
		u.setEmail(req.email());
		u.setPhone(req.phone());
		u.setStatus(req.status());
		userMapper.update(u);
	}

	public void delete(Long id) {
		userMapper.logicDelete(id);
	}

	public void resetPassword(Long id, String password) {
		if (password == null || password.isBlank()) {
			throw new BusinessException(400, "密码不能为空");
		}
		SysUser u = new SysUser();
		u.setId(id);
		u.setPassword(passwordEncoder.encode(password));
		userMapper.update(u);
	}
}
