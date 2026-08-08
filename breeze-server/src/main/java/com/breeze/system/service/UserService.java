package com.breeze.system.service;

import com.breeze.common.exception.BusinessException;
import com.breeze.common.response.PageResult;
import com.breeze.security.util.CurrentUser;
import com.breeze.system.dto.PageQuery;
import com.breeze.system.dto.UserResp;
import com.breeze.system.dto.UserSaveRequest;
import com.breeze.system.entity.SysRole;
import com.breeze.system.entity.SysUser;
import com.breeze.system.mapper.SysRoleMapper;
import com.breeze.system.mapper.SysUserMapper;
import com.breeze.system.mapper.SysUserRoleMapper;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

	private final SysUserMapper userMapper;
	private final SysRoleMapper roleMapper;
	private final SysUserRoleMapper userRoleMapper;
	private final PasswordEncoder passwordEncoder;

	public PageResult<UserResp> page(PageQuery pq, String username) {
		QueryWrapper qw = QueryWrapper.create();
		if (username != null && !username.isBlank()) {
			qw.and(SysUser::getUsername).like(username);
		}
		qw.orderBy(SysUser::getCreateTime, false);
		Page<SysUser> p = userMapper.paginate(pq.effectivePageNum(), pq.effectivePageSize(), qw);
		List<Long> userIds = p.getRecords().stream().map(SysUser::getId).toList();
		Map<Long, List<Long>> roleIdsByUser = new LinkedHashMap<>();
		if (!userIds.isEmpty()) {
			for (SysUserRoleMapper.UserRoleRow row : userRoleMapper.selectByUserIds(userIds)) {
				roleIdsByUser.computeIfAbsent(row.userId(), ignored -> new ArrayList<>()).add(row.roleId());
			}
		}
		List<UserResp> records = p.getRecords().stream()
				.map(u -> UserResp.of(u.getId(), u.getUsername(), u.getNickname(), u.getAvatar(),
						u.getEmail(), u.getPhone(), u.getStatus(), u.getCreateTime(),
						roleIdsByUser.getOrDefault(u.getId(), List.of())))
				.toList();
		return PageResult.of(records, p.getTotalRow(), (int) p.getPageNumber(), (int) p.getPageSize());
	}

	@Transactional
	public Long create(UserSaveRequest req) {
		validateUsername(req.username());
		validatePassword(req.password());
		if (userMapper.selectByUsername(req.username()) != null) {
			throw new BusinessException(409, "用户名已存在");
		}
		List<Long> roleIds = validateRoleIds(req.roleIds());
		SysUser u = new SysUser();
		u.setUsername(req.username());
		u.setPassword(passwordEncoder.encode(req.password()));
		u.setNickname(req.nickname());
		u.setEmail(req.email());
		u.setPhone(req.phone());
		u.setStatus(validateStatus(req.status(), 1));
		userMapper.insert(u);
		replaceRoles(u.getId(), roleIds);
		return u.getId();
	}

	@Transactional
	public void update(Long id, UserSaveRequest req) {
		SysUser u = userMapper.selectOneById(id);
		if (u == null) {
			throw new BusinessException(404, "用户不存在");
		}
		List<Long> roleIds = validateRoleIds(req.roleIds());
		u.setNickname(req.nickname());
		u.setEmail(req.email());
		u.setPhone(req.phone());
		u.setStatus(validateStatus(req.status(), u.getStatus()));
		userMapper.update(u);
		replaceRoles(id, roleIds);
	}

	@Transactional
	public void delete(Long id) {
		if (userMapper.selectOneById(id) == null) {
			throw new BusinessException(404, "用户不存在");
		}
		if (id.equals(CurrentUser.getUserId())) {
			throw new BusinessException(400, "不能删除当前登录用户");
		}
		userMapper.logicDelete(id);
		userRoleMapper.deleteByUserId(id);
	}

	public void resetPassword(Long id, String password) {
		validatePassword(password);
		if (userMapper.selectOneById(id) == null) {
			throw new BusinessException(404, "用户不存在");
		}
		SysUser u = new SysUser();
		u.setId(id);
		u.setPassword(passwordEncoder.encode(password));
		userMapper.update(u);
	}

	private void validateUsername(String username) {
		if (username == null || username.isBlank()) {
			throw new BusinessException(400, "用户名不能为空");
		}
	}

	private void validatePassword(String password) {
		if (password == null || password.isBlank()) {
			throw new BusinessException(400, "密码不能为空");
		}
		if (password.length() < 8 || password.length() > 72) {
			throw new BusinessException(400, "密码长度必须为 8-72 位");
		}
	}

	private Integer validateStatus(Integer status, Integer defaultValue) {
		Integer value = status == null ? defaultValue : status;
		if (value == null || (value != 0 && value != 1)) {
			throw new BusinessException(400, "用户状态无效");
		}
		return value;
	}

	private List<Long> validateRoleIds(List<Long> requested) {
		if (requested == null || requested.isEmpty()) {
			return List.of();
		}
		List<Long> roleIds = new ArrayList<>(new LinkedHashSet<>(requested));
		if (roleIds.stream().anyMatch(id -> id == null || id <= 0)) {
			throw new BusinessException(400, "角色 ID 无效");
		}
		long validCount = roleMapper.selectListByQuery(
				QueryWrapper.create().where(SysRole::getId).in(roleIds)
					.and(SysRole::getStatus).eq(1)).stream().count();
		if (validCount != roleIds.size()) {
			throw new BusinessException(400, "角色不存在或已停用");
		}
		return roleIds;
	}

	private void replaceRoles(Long userId, List<Long> roleIds) {
		userRoleMapper.deleteByUserId(userId);
		if (!roleIds.isEmpty()) {
			userRoleMapper.insertBatch(userId, roleIds);
		}
	}
}
