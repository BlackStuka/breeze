# Breeze 轻量后台管理系统

轻量、无黑盒、可扩展的后台管理系统骨架。**用组件代替框架**——只选不绑架项目结构的库,自己攒最小骨架,每一行代码都是你的。

## 技术栈

| 层 | 选型 |
|---|---|
| 后端 | JDK 25 · Spring Boot 4.1 · Spring Security(JWT 无状态)· MyBatis-Flex · MySQL 8.4 · Flyway |
| 前端 | React 19 · Vite · TypeScript strict · Tailwind v4 · shadcn/ui · TanStack Table + Query · zustand |

## 架构纪律

- 雪花 ID,后端 Long 序列化为 String(防 JS 精度丢失)
- 统一审计字段(create_by/create_time/update_by/update_time/deleted)
- 模块边界: common / security / system(核心 RBAC)/ business(业务),依赖单向
- JWT 只放 userId,权限每次请求实时读,改权限立即生效
- 粗粒度权限在 SecurityConfig URL 规则,细粒度 `@PreAuthorize` 引用统一 Permissions 常量
- Flyway 管理 schema,已提交的 migration 永不修改
- 不为不存在的功能预造接口(YAGNI)

## 目录

```
breeze/
├── breeze-server/  # 后端
└── breeze-ui/      # 前端
```

## 快速开始

### 后端

启动(需已建 `breeze` 库):

```bash
cd breeze-server
mvn spring-boot:run
```

Flyway 会自动建表并写入种子数据,默认管理员 `admin / admin123`。

### 前端

```bash
cd breeze-ui
pnpm install
pnpm dev
```

访问 `http://localhost:5173`,Vite 已代理 `/api` 到后端 8080。

## RBAC 验证

后端集成测试使用 Testcontainers 启动独立的 MySQL 8.4 容器，不会修改本地 `breeze` 数据库。单元测试由 Surefire 执行，`*IT` 集成测试由 Failsafe 在 `verify` 阶段执行，运行完整门禁：

```bash
cd breeze-server
mvn verify
```

测试覆盖完整授权链路：管理员登录、角色菜单查询与全量分配、用户角色绑定、低权限用户的 200/403、旧 JWT 的权限即时变化，以及用户和角色删除后的关联清理。运行需要本机 Docker Desktop 或其他兼容 Docker API 的容器运行时。

项目还包含一个最小 `business/product` 业务示例，用于演示从迁移、权限菜单、后端 CRUD 到前端页面的扩展路径。产品接口为 `GET/POST /api/products`、`PUT/DELETE /api/products/{id}`，权限码为 `business:product:list/add/edit/remove`。

也可以通过浏览器手工验证：管理员登录后创建测试角色，给它分配实际启用的用户列表菜单，再创建用户并在用户表单中选择该角色。使用新用户登录，确认 `/api/auth/me` 只有授权权限，用户列表可访问而角色管理返回 403；随后管理员清空角色菜单，复用普通用户的旧会话确认权限立即失效。测试角色和用户应在验证后删除。

不要在脚本或文档中写入真实凭据；本地默认管理员仅用于开发环境，ID 应从当前接口响应中读取并按字符串传递。
