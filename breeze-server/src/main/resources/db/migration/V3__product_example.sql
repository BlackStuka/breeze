-- 最小业务示例:产品 CRUD
SET @admin_user_id = 1000000000000000001;
SET @admin_role_id = 1000000000000000001;

CREATE TABLE biz_product (
    id          BIGINT       NOT NULL,
    name        VARCHAR(128) NOT NULL COMMENT '产品名称',
    code        VARCHAR(64)  NOT NULL COMMENT '产品编码',
    price       DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '价格',
    status      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态:1启用 0停用',
    remark      VARCHAR(500) COMMENT '备注',
    create_by   BIGINT,
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_by   BIGINT,
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_biz_product_code_deleted (code, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='产品示例';

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, perms, icon, sort, visible, status, create_by)
SELECT 1000000000000000020, 0, '业务示例', 'M', '/business', NULL, NULL, 'Package', 3, 1, 1, @admin_user_id
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE id = 1000000000000000020);

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, perms, icon, sort, visible, status, create_by)
SELECT 1000000000000000021, 1000000000000000020, '产品管理', 'C', 'product', 'business/product/index', 'business:product:list', 'Package', 1, 1, 1, @admin_user_id
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE id = 1000000000000000021);

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, perms, icon, sort, visible, status, create_by)
SELECT 1000000000000000022, 1000000000000000021, '产品新增', 'F', NULL, NULL, 'business:product:add', NULL, 1, 1, 1, @admin_user_id
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE id = 1000000000000000022);

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, perms, icon, sort, visible, status, create_by)
SELECT 1000000000000000023, 1000000000000000021, '产品编辑', 'F', NULL, NULL, 'business:product:edit', NULL, 2, 1, 1, @admin_user_id
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE id = 1000000000000000023);

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, perms, icon, sort, visible, status, create_by)
SELECT 1000000000000000024, 1000000000000000021, '产品删除', 'F', NULL, NULL, 'business:product:remove', NULL, 3, 1, 1, @admin_user_id
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE id = 1000000000000000024);

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT @admin_role_id, m.id
FROM sys_menu m
WHERE m.id IN (1000000000000000020, 1000000000000000021, 1000000000000000022, 1000000000000000023, 1000000000000000024)
  AND NOT EXISTS (
      SELECT 1 FROM sys_role_menu rm
      WHERE rm.role_id = @admin_role_id AND rm.menu_id = m.id
  );
