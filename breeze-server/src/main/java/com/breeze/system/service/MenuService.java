package com.breeze.system.service;

import com.breeze.common.exception.BusinessException;
import com.breeze.system.dto.MenuSaveRequest;
import com.breeze.system.dto.MenuTreeNode;
import com.breeze.system.entity.SysMenu;
import com.breeze.system.mapper.SysMenuMapper;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MenuService {

	private final SysMenuMapper menuMapper;

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
		apply(req, m);
		menuMapper.insert(m);
		return m.getId();
	}

	public void update(Long id, MenuSaveRequest req) {
		SysMenu m = menuMapper.selectOneById(id);
		if (m == null) {
			throw new BusinessException(404, "菜单不存在");
		}
		apply(req, m);
		menuMapper.update(m);
	}

	public void delete(Long id) {
		menuMapper.logicDelete(id);
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
