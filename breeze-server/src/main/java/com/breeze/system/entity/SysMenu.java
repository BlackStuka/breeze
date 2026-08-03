package com.breeze.system.entity;

import com.breeze.common.entity.BaseEntity;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Table(value = "sys_menu", camelToUnderline = true)
public class SysMenu extends BaseEntity {

	private Long parentId;

	private String menuName;

	/** M目录 C菜单 F按钮 */
	private String menuType;

	private String path;

	private String component;

	private String perms;

	private String icon;

	private Integer sort;

	private Integer visible;

	private Integer status;
}
