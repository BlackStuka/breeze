package com.breeze.system.dto;

import com.breeze.system.entity.SysMenu;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/** 菜单树节点(继承 SysMenu 字段 + children)。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MenuTreeNode extends SysMenu {

	private List<MenuTreeNode> children;
}
