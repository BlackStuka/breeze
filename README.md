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
