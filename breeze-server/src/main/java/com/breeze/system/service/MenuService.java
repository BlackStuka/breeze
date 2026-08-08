package com.breeze.system.service;

import com.breeze.common.exception.BusinessException;
import com.breeze.system.dto.MenuSaveRequest;
import com.breeze.system.dto.MenuTreeNode;
import com.breeze.system.entity.SysMenu;
import com.breeze.system.mapper.SysMenuMapper;
import com.breeze.system.mapper.SysRoleMenuMapper;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MenuService {

	private final SysMenuMapper menuMapper;
	private final SysRoleMenuMapper roleMenuMapper;

	/** 当前登录用户的动态菜单树(目录+菜单,按权限过滤)。 */
	public List<MenuTreeNode> currentUserMenuTree(Long userId) {
		return buildTree(menuMapper.selectMenusByUserId(userId));
	}

	/** 全部菜单树(管理用)。 */
	public List<MenuTreeNode> tree() {
		List<SysMenu> menus = menuMapper.selectListByQuery(
				QueryWrapper.create().orderBy(SysMenu::getSort, true));
		return buildTree(menus);
	}

	/** 全部菜单平铺(管理用)。 */
	public List<SysMenu> list() {
		return menuMapper.selectListByQuery(QueryWrapper.create().orderBy(SysMenu::getSort, true));
	}

	public Long create(MenuSaveRequest req) {
		SysMenu m = new SysMenu();
		validateParent(req.parentId(), null);
		apply(req, m);
		menuMapper.insert(m);
		return m.getId();
	}

	public void update(Long id, MenuSaveRequest req) {
		SysMenu m = requireMenu(id);
		validateParent(req.parentId(), id);
		apply(req, m);
		menuMapper.update(m);
	}

	@Transactional
	public void delete(Long id) {
		requireMenu(id);
		if (menuMapper.countActiveChildren(id) > 0) {
			throw new BusinessException(400, "请先删除子菜单");
		}
		menuMapper.logicDelete(id);
		roleMenuMapper.deleteByMenuId(id);
	}

	private SysMenu requireMenu(Long id) {
		SysMenu menu = menuMapper.selectOneById(id);
		if (menu == null) {
			throw new BusinessException(404, "菜单不存在");
		}
		return menu;
	}

	private void apply(MenuSaveRequest req, SysMenu m) {
		m.setParentId(req.parentId() == null ? 0 : req.parentId());
		m.setMenuName(req.menuName());
		m.setMenuType(req.menuType());
		m.setPath(req.path());
		m.setComponent(req.component());
		m.setPerms(req.perms());
		m.setIcon(req.icon());
		m.setSort(req.sort() == null ? 0 : req.sort());
		m.setVisible(req.visible() == null ? 1 : req.visible());
		m.setStatus(req.status() == null ? 1 : req.status());
	}

	private void validateParent(Long requestedParentId, Long currentId) {
		long parentId = requestedParentId == null ? 0 : requestedParentId;
		if (parentId == 0) {
			return;
		}
		if (currentId != null && parentId == currentId) {
			throw new BusinessException(400, "菜单不能指向自身");
		}
		SysMenu parent = requireMenu(parentId);
		if ("F".equals(parent.getMenuType())) {
			throw new BusinessException(400, "按钮不能作为父菜单");
		}

		Set<Long> visited = new HashSet<>();
		Long cursor = parent.getId();
		while (cursor != null && cursor != 0 && visited.add(cursor)) {
			if (currentId != null && cursor.equals(currentId)) {
				throw new BusinessException(400, "菜单层级不能形成循环");
			}
			SysMenu ancestor = menuMapper.selectOneById(cursor);
			cursor = ancestor == null ? 0 : ancestor.getParentId();
		}
	}

	private List<MenuTreeNode> buildTree(List<SysMenu> menus) {
		Map<Long, MenuTreeNode> nodeMap = new LinkedHashMap<>();
		for (SysMenu m : menus) {
			MenuTreeNode node = new MenuTreeNode();
			BeanUtils.copyProperties(m, node);
			node.setChildren(new ArrayList<>());
			nodeMap.put(node.getId(), node);
		}
		List<MenuTreeNode> roots = new ArrayList<>();
		for (MenuTreeNode node : nodeMap.values()) {
			Long pid = node.getParentId();
			if (pid == null || pid == 0 || !nodeMap.containsKey(pid)) {
				roots.add(node);
			} else {
				nodeMap.get(pid).getChildren().add(node);
			}
		}
		return roots;
	}
}
