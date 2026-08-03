-- ============================================================
-- Breeze V1 初始化:五表 RBAC + 种子数据
-- 架构:雪花ID(BIGINT) · 审计字段 · 逻辑删除 deleted=id(避唯一索引冲突)
-- ============================================================

-- ---------- 用户 ----------
CREATE TABLE sys_user (
    id          BIGINT       NOT NULL                COMMENT '主键(雪花ID)',
    username    VARCHAR(64)  NOT NULL                COMMENT '登录名',
    password    VARCHAR(128) NOT NULL                COMMENT '密码(bcrypt)',
    nickname    VARCHAR(64)                          COMMENT '昵称',
    avatar      VARCHAR(255)                         COMMENT '头像(URL)',
    email       VARCHAR(128)                         COMMENT '邮箱',
    phone       VARCHAR(32)                          COMMENT '手机号',
    status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态:1启用 0禁用',
    create_by   BIGINT                               COMMENT '创建人ID',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP                              COMMENT '创建时间',
    update_by   BIGINT                               COMMENT '更新人ID',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP      COMMENT '更新时间',
    deleted     BIGINT       NOT NULL DEFAULT 0      COMMENT '逻辑删除:0未删,删除时置为本行主键',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username_deleted (username, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户';

-- ---------- 角色 ----------
CREATE TABLE sys_role (
    id          BIGINT       NOT NULL,
    role_name   VARCHAR(64)  NOT NULL                COMMENT '角色名',
    role_code   VARCHAR(64)  NOT NULL                COMMENT '角色编码',
    sort        INT          NOT NULL DEFAULT 0      COMMENT '排序',
    status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态:1启用 0禁用',
    create_by   BIGINT,
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_by   BIGINT,
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_code_deleted (role_code, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色';

-- ---------- 菜单/权限 ----------
CREATE TABLE sys_menu (
    id          BIGINT       NOT NULL,
    parent_id   BIGINT       NOT NULL DEFAULT 0      COMMENT '父菜单ID,0为根',
    menu_name   VARCHAR(64)  NOT NULL                COMMENT '菜单/权限名',
    menu_type   CHAR(1)      NOT NULL                COMMENT 'M目录 C菜单 F按钮',
    path        VARCHAR(255)                         COMMENT '路由路径',
    component   VARCHAR(255)                         COMMENT '前端组件路径',
    perms       VARCHAR(128)                         COMMENT '权限标识(system:user:list)',
    icon        VARCHAR(64)                          COMMENT '图标(lucide名)',
    sort        INT          NOT NULL DEFAULT 0,
    visible     TINYINT      NOT NULL DEFAULT 1      COMMENT '是否可见:1是 0否',
    status      TINYINT      NOT NULL DEFAULT 1,
    create_by   BIGINT,
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_by   BIGINT,
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted     BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='菜单/权限';

-- ---------- 用户-角色 ----------
CREATE TABLE sys_user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户-角色';

-- ---------- 角色-菜单 ----------
CREATE TABLE sys_role_menu (
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色-菜单';


-- ============================================================
-- 种子数据
-- ID 用固定大数(>2^53):既不与运行时雪花ID冲突,又让 Long->String
-- 从种子数据起即可被验证。
-- ============================================================

SET @admin_user_id = 1000000000000000001;
SET @admin_role_id = 1000000000000000001;

-- 管理员用户(密码 admin123,bcrypt)
INSERT INTO sys_user (id, username, password, nickname, status, create_by)
VALUES (@admin_user_id, 'admin',
        '$2a$10$X/D5JYkOlBzjDhNt8AQPYeIXMagovappVguDza5eMDHz4KYFzsUs2',
        '管理员', 1, @admin_user_id);

-- 管理员角色
INSERT INTO sys_role (id, role_name, role_code, sort, status, create_by)
VALUES (@admin_role_id, '管理员', 'admin', 1, 1, @admin_user_id);

-- 菜单树(M目录/C菜单/F按钮) + 权限标识
INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, perms, icon, sort, visible, status, create_by) VALUES
-- 首页
(1000000000000000001, 0,                   '首页',     'C', '/dashboard', 'dashboard/index',   NULL,                        'Home',     1, 1, 1, @admin_user_id),
-- 系统管理(目录)
(1000000000000000002, 0,                   '系统管理', 'M', '/system',    NULL,                NULL,                        'Settings', 2, 1, 1, @admin_user_id),
-- 用户管理 + 按钮
(1000000000000000003, 1000000000000000002, '用户管理', 'C', 'user',       'system/user/index', 'system:user:list',          'Users',    1, 1, 1, @admin_user_id),
(1000000000000000006, 1000000000000000003, '用户新增', 'F', NULL,         NULL,                'system:user:add',           NULL,       1, 1, 1, @admin_user_id),
(1000000000000000007, 1000000000000000003, '用户编辑', 'F', NULL,         NULL,                'system:user:edit',          NULL,       2, 1, 1, @admin_user_id),
(1000000000000000008, 1000000000000000003, '用户删除', 'F', NULL,         NULL,                'system:user:remove',        NULL,       3, 1, 1, @admin_user_id),
(1000000000000000009, 1000000000000000003, '重置密码', 'F', NULL,         NULL,                'system:user:reset-password',NULL,       4, 1, 1, @admin_user_id),
-- 角色管理 + 按钮
(1000000000000000004, 1000000000000000002, '角色管理', 'C', 'role',       'system/role/index', 'system:role:list',          'Shield',   2, 1, 1, @admin_user_id),
(1000000000000000010, 1000000000000000004, '角色新增', 'F', NULL,         NULL,                'system:role:add',           NULL,       1, 1, 1, @admin_user_id),
(1000000000000000011, 1000000000000000004, '角色编辑', 'F', NULL,         NULL,                'system:role:edit',          NULL,       2, 1, 1, @admin_user_id),
(1000000000000000012, 1000000000000000004, '角色删除', 'F', NULL,         NULL,                'system:role:remove',        NULL,       3, 1, 1, @admin_user_id),
-- 菜单管理 + 按钮
(1000000000000000005, 1000000000000000002, '菜单管理', 'C', 'menu',       'system/menu/index', 'system:menu:list',          'Menu',     3, 1, 1, @admin_user_id),
(1000000000000000013, 1000000000000000005, '菜单新增', 'F', NULL,         NULL,                'system:menu:add',           NULL,       1, 1, 1, @admin_user_id),
(1000000000000000014, 1000000000000000005, '菜单编辑', 'F', NULL,         NULL,                'system:menu:edit',          NULL,       2, 1, 1, @admin_user_id),
(1000000000000000015, 1000000000000000005, '菜单删除', 'F', NULL,         NULL,                'system:menu:remove',        NULL,       3, 1, 1, @admin_user_id);

-- admin 用户 → admin 角色
INSERT INTO sys_user_role (user_id, role_id) VALUES (@admin_user_id, @admin_role_id);

-- admin 角色 → 全部菜单(含按钮权限)
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT @admin_role_id, id FROM sys_menu;
