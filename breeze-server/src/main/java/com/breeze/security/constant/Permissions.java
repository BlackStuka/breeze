package com.breeze.security.constant;

/**
 * 权限字符串统一常量。@PreAuthorize 引用这些常量,避免散落的魔法字符串。
 * 与 Flyway V1/V2 菜单种子的 perms 字段一一对应。
 */
public final class Permissions {

	private Permissions() {
	}

	// 用户
	public static final String USER_LIST = "system:user:list";
	public static final String USER_ADD = "system:user:add";
	public static final String USER_EDIT = "system:user:edit";
	public static final String USER_REMOVE = "system:user:remove";
	public static final String USER_RESET_PASSWORD = "system:user:reset-password";

	// 角色
	public static final String ROLE_LIST = "system:role:list";
	public static final String ROLE_ADD = "system:role:add";
	public static final String ROLE_EDIT = "system:role:edit";
	public static final String ROLE_REMOVE = "system:role:remove";
	public static final String ROLE_ASSIGN_MENU = "system:role:assign-menu";

	// 菜单
	public static final String MENU_LIST = "system:menu:list";
	public static final String MENU_ADD = "system:menu:add";
	public static final String MENU_EDIT = "system:menu:edit";
	public static final String MENU_REMOVE = "system:menu:remove";

	// 产品示例
	public static final String PRODUCT_LIST = "business:product:list";
	public static final String PRODUCT_ADD = "business:product:add";
	public static final String PRODUCT_EDIT = "business:product:edit";
	public static final String PRODUCT_REMOVE = "business:product:remove";
}
