# 🪦 创业墓地 - 部署上线指南

## 项目概览

- **前端**：React 18 + Vite + TypeScript + ECharts
- **后端**：Express API（CRUD）+ JSON 文件持久化
- **数据**：82 条中国失败创业案例
- **管理后台**：`/admin` 路径，支持增删改查

---

## 🚀 方案一：Railway 部署（推荐，5 分钟上线）

### 第 1 步：推送代码到 GitHub

```bash
cd startup-cemetery

# 如果还没有 GitHub 仓库，先去 github.com 新建一个
# 然后执行：
git remote add origin https://github.com/你的用户名/startup-cemetery.git
git push -u origin main
```

### 第 2 步：在 Railway 部署

1. 打开 [railway.app](https://railway.app)，用 GitHub 登录
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择 `startup-cemetery` 仓库
4. Railway 会自动识别并构建（已配置 `nixpacks.toml`）

### 第 3 步：配置环境变量

在 Railway 项目的 **Variables** 标签中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ADMIN_PASSWORD` | `你的密码` | 管理后台写操作密码（**必设**） |

### 第 4 步：配置数据持久化（重要！）

1. 在 Railway 项目中点击 **New → Volume**
2. 挂载路径设为 `/data`
3. 设置环境变量 `DATA_DIR=/data`

这样你的数据在重新部署后不会丢失。

### 第 5 步：生成域名

1. 在 Railway 项目中点击 **Settings → Networking**
2. 点击 **Generate Domain**
3. 获得公网地址，如 `startup-cemetery-production.up.railway.app`

🎉 完成！所有人都可以通过这个地址访问了。

---

## 🐳 方案二：Docker 部署

```bash
# 构建镜像
docker build -t startup-cemetery .

# 运行容器（挂载数据目录持久化）
docker run -d \
  -p 8000:8000 \
  -v cemetery-data:/data \
  -e DATA_DIR=/data \
  -e ADMIN_PASSWORD=你的密码 \
  --name cemetery \
  startup-cemetery
```

---

## 📋 方案三：传统服务器部署

```bash
# 1. 在服务器上克隆代码
git clone https://github.com/你的用户名/startup-cemetery.git
cd startup-cemetery

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 启动服务
ADMIN_PASSWORD=你的密码 PORT=8000 node server.cjs

# 5. 用 PM2 保持运行（可选）
npm install -g pm2
pm2 start server.cjs --name cemetery -- --env production
pm2 startup
pm2 save
```

---

## 🔐 安全提醒

- **务必设置 `ADMIN_PASSWORD`**：不设则管理接口可被任何人访问
- 管理后台地址：`你的域名/#/admin`
- 公开 API（浏览数据）不需要密码，写入操作需要密码

---

## 📁 项目结构

```
startup-cemetery/
├── server.cjs          # Express 后端服务器
├── src/                # React 前端源码
│   ├── data/companies.json  # 案例数据
│   ├── pages/          # 5个页面 + 管理后台
│   └── components/     # 10+ 组件
├── Dockerfile          # Docker 部署
├── railway.json        # Railway 配置
├── nixpacks.toml       # Railway 构建配置
├── Procfile            # Heroku/通用部署
└── .env.example        # 环境变量示例
```

---

## 🛠️ 本地开发

```bash
npm install
npm run dev       # 启动前端开发服务器
npm run build     # 构建生产版本
npm start         # 启动生产服务器
```
