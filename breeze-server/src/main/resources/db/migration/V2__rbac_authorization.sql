-- RBAC 授权闭环:为角色菜单分配增加独立权限
SET @admin_user_id = 1000000000000000001;
SET @admin_role_id = 1000000000000000001;

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, perms, icon, sort, visible, status, create_by)
SELECT 1000000000000000016, 1000000000000000004, '角色菜单分配', 'F', NULL, NULL,
       'system:role:assign-menu', NULL, 4, 1, 1, @admin_user_id
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE id = 1000000000000000016);

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT @admin_role_id, 1000000000000000016
WHERE NOT EXISTS (
    SELECT 1 FROM sys_role_menu
    WHERE role_id = @admin_role_id AND menu_id = 1000000000000000016
);
