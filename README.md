# 电竞点单系统

基于 NestJS + React + PostgreSQL 构建的全栈电竞代练/陪玩点单系统，Apple 电竞风格（深色 + 电竞紫 + 玻璃态 + 发光），支持免费云平台部署（Render / Railway + Neon / Supabase）。

## 功能特性

### 前台（手机端）
- 进站弹窗：欢迎弹窗，后台可配置开关/标题/内容/按钮文字
- 商品列表：按分类筛选，展示名称/价格/描述/图片
- 下单流程：填写联系方式 + 区服 → 支付页
- 支付页：支付二维码 + 5 分钟倒计时 + 支付确认
- 我的订单：输入订单号查询，时间线展示状态流转
- 客服弹窗：顶栏客服按钮展示客服二维码

### 后台管理（密码：18131138682）
- 订单管理：查看/确认接单/拒绝/完成订单
- 商品管理：新增/编辑/删除/上下架商品
- 分类管理：管理商品分类
- 系统设置：网站信息 / 二维码 / 图片 / 进站弹窗

### 通用
- 悬浮音乐播放器（8 首歌，支持播放/暂停/切歌/进度/音量）
- Apple 电竞风格（深色 + 电竞紫 + 玻璃态 + 发光 + 动画）
- 手机端适配

## 技术栈

- 后端：NestJS 10 + Drizzle ORM + PostgreSQL
- 前端：React 19 + TypeScript + Tailwind CSS + Framer Motion
- 构建：Vite
- 部署：Render / Railway + Neon / Supabase

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动数据库（需本地 PostgreSQL）
# 执行 database/schema.sql 建表

# 启动开发服务
npm run dev
```

## 部署

### Render 一键部署

1. Fork 本仓库到 GitHub
2. 在 Render 创建 Web Service，选择本仓库
3. 配置环境变量（见 .env.example）
4. 关联 PostgreSQL（Neon / Supabase 或 Render 自带）
5. 部署完成后访问分配的域名

### 手动部署

```bash
# 构建
npm run build:prod

# 启动
./start.sh
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development |
| SERVER_HOST | 监听地址 | localhost |
| SERVER_PORT | 监听端口 | 3000 |
| DATABASE_URL | PostgreSQL 连接串 | - |
| ADMIN_PASSWORD | 后台管理密码 | 18131138682 |

## 数据库

建表脚本：`database/schema.sql`

表结构：
- `categories` - 商品分类
- `products` - 商品
- `orders` - 订单
- `system_settings` - 系统设置（key-value）

订单状态：
- `pending` - 待支付
- `confirm` - 待确认
- `playing` - 代打中
- `done` - 已完成
- `reject` - 已拒绝

## 项目结构

```
├── client/              # 前端 React
│   └── src/
│       ├── api/         # API 请求
│       ├── components/  # 组件
│       ├── contexts/    # 全局 Context
│       ├── hooks/       # 自定义 Hooks
│       ├── pages/       # 页面
│       └── utils/       # 工具函数
├── server/              # 后端 NestJS
│   ├── common/          # 公共模块
│   ├── database/        # 数据库 schema
│   └── modules/         # 业务模块
├── shared/              # 共享类型
├── database/            # 建表 SQL
├── render.yaml          # Render 部署配置
└── start.sh             # 启动脚本
```

## 许可证

MIT

=====================================================================
二、shared 共享类型
=====================================================================
