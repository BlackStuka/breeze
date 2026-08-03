package com.breeze.system.service;

import com.breeze.common.exception.BusinessException;
import com.breeze.common.response.PageResult;
import com.breeze.system.dto.PageQuery;
import com.breeze.system.dto.RoleSaveRequest;
import com.breeze.system.entity.SysRole;
import com.breeze.system.mapper.SysRoleMapper;
import com.breeze.system.mapper.SysRoleMenuMapper;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

	private final SysRoleMapper roleMapper;
	private final SysRoleMenuMapper roleMenuMapper;

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
		SysRole r = roleMapper.selectOneById(id);
		if (r == null) {
			throw new BusinessException(404, "角色不存在");
		}
		r.setRoleName(req.roleName());
		r.setRoleCode(req.roleCode());
		r.setSort(req.sort());
		r.setStatus(req.status());
		roleMapper.update(r);
	}

	public void delete(Long id) {
		roleMapper.logicDelete(id);
		roleMenuMapper.deleteByRoleId(id);
	}

	/** 全量覆盖角色菜单授权(删旧 + 插新)。 */
	@Transactional
	public void assignMenus(Long roleId, List<Long> menuIds) {
		roleMenuMapper.deleteByRoleId(roleId);
		if (menuIds != null && !menuIds.isEmpty()) {
			roleMenuMapper.insertBatch(roleId, menuIds);
		}
	}
}
