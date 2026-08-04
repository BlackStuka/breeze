package com.breeze.system.service;

import com.breeze.common.exception.BusinessException;
import com.breeze.common.response.PageResult;
import com.breeze.system.dto.PageQuery;
import com.breeze.system.dto.RoleSaveRequest;
import com.breeze.system.entity.SysMenu;
import com.breeze.system.entity.SysRole;
import com.breeze.system.mapper.SysMenuMapper;
import com.breeze.system.mapper.SysRoleMapper;
import com.breeze.system.mapper.SysRoleMenuMapper;
import com.breeze.system.mapper.SysUserRoleMapper;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

	private final SysRoleMapper roleMapper;
	private final SysRoleMenuMapper roleMenuMapper;
	private final SysUserRoleMapper userRoleMapper;
	private final SysMenuMapper menuMapper;

	public PageResult<SysRole> page(PageQuery pq, String roleName) {
		QueryWrapper qw = QueryWrapper.create();
		if (roleName != null && !roleName.isBlank()) {
			qw.and(SysRole::getRoleName).like(roleName);
		}
		qw.orderBy(SysRole::getSort, true);
		Page<SysRole> p = roleMapper.paginate(pq.effectivePageNum(), pq.effectivePageSize(), qw);
		return PageResult.of(p.getRecords(), p.getTotalRow(), (int) p.getPageNumber(), (int) p.getPageSize());
	}

	public List<SysRole> options() {
		return roleMapper.selectListByQuery(
				QueryWrapper.create().where(SysRole::getStatus).eq(1).orderBy(SysRole::getSort, true));
	}

	public Long create(RoleSaveRequest req) {
		SysRole r = new SysRole();
		r.setRoleName(req.roleName());
		r.setRoleCode(req.roleCode());
		r.setSort(req.sort() == null ? 0 : req.sort());
		r.setStatus(req.status() == null ? 1 : req.status());
		roleMapper.insert(r);
		return r.getId();
	}

	public void update(Long id, RoleSaveRequest req) {
		SysRole r = requireRole(id);
		r.setRoleName(req.roleName());
		r.setRoleCode(req.roleCode());
		r.setSort(req.sort());
		r.setStatus(req.status());
		roleMapper.update(r);
	}

	@Transactional
	public void delete(Long id) {
		requireRole(id);
		roleMapper.logicDelete(id);
		roleMenuMapper.deleteByRoleId(id);
		userRoleMapper.deleteByRoleId(id);
	}

	public List<Long> menuIds(Long roleId) {
		requireRole(roleId);
		return roleMenuMapper.selectMenuIdsByRoleId(roleId);
	}

	/** 全量覆盖角色菜单授权(校验通过后删旧 + 插新)。 */
	@Transactional
	public void assignMenus(Long roleId, List<Long> menuIds) {
		SysRole role = requireRole(roleId);
		if (role.getStatus() == null || role.getStatus() != 1) {
			throw new BusinessException(400, "角色已停用");
		}
		List<Long> ids = validateMenuIds(menuIds);
		roleMenuMapper.deleteByRoleId(roleId);
		if (!ids.isEmpty()) {
			roleMenuMapper.insertBatch(roleId, ids);
		}
	}

	private SysRole requireRole(Long id) {
		SysRole role = roleMapper.selectOneById(id);
		if (role == null) {
			throw new BusinessException(404, "角色不存在");
		}
		return role;
	}

	private List<Long> validateMenuIds(List<Long> requested) {
		if (requested == null || requested.isEmpty()) {
			return List.of();
		}
		List<Long> ids = new ArrayList<>(new LinkedHashSet<>(requested));
		if (ids.stream().anyMatch(id -> id == null || id <= 0)) {
			throw new BusinessException(400, "菜单 ID 无效");
		}
		long validCount = menuMapper.selectListByQuery(
				QueryWrapper.create().where(SysMenu::getId).in(ids)
					.and(SysMenu::getStatus).eq(1)).stream().count();
		if (validCount != ids.size()) {
			throw new BusinessException(400, "菜单不存在或已停用");
		}
		return ids;
	}
}
