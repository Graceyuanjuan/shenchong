# 神宠系统 - 中国大陆网络环境配置指南

## ⚠️ 当前问题诊断

**错误现象**: `RequestError: connect ETIMEDOUT 140.82.121.3:443`

**问题原因**: 连接GitHub/npm官方源超时，典型的网络访问受限问题

**解决方案**: 配置国内镜像源，绕过网络限制

## 🚀 快速解决依赖下载问题

### 方法1: 配置淘宝镜像 (推荐)

```bash
# 设置npm镜像源
npm config set registry https://registry.npmmirror.com

# 设置electron镜像
npm config set electron_mirror https://cdn.npmmirror.com/binaries/electron/

# 设置node-sass镜像 (如果需要)
npm config set sass_binary_site https://cdn.npmmirror.com/binaries/node-sass/

# 验证配置
npm config get registry
```

### 方法2: 使用cnpm (备选方案)

```bash
# 安装cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com

# 使用cnpm安装依赖
cnpm install
```

### 方法3: 使用yarn (备选方案)

```bash
# 安装yarn
npm install -g yarn

# 配置yarn镜像
yarn config set registry https://registry.npmmirror.com

# 使用yarn安装
yarn install
```

## 📋 完整安装步骤

### 步骤1: 配置镜像源

```bash
npm config set registry https://registry.npmmirror.com
npm config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
```

### 步骤2: 清理缓存

```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
```

### 步骤3: 重新安装

```bash
npm install
```

### 步骤4: 验证安装并启动完整UI

```bash
# 编译TypeScript代码
npm run build

# 启动完整的UI界面 (推荐)
npm run dev:full

# 或者分别启动 (高级用法)
# npm run dev      # 启动TypeScript编译
# npm run ui:dev   # 启动UI开发服务器
```

**重要**: 要看到完整的UI界面，必须运行 `npm run dev:full` 命令！

## 🔧 如果仍有问题

### 临时使用代理 (如果有VPN)

```bash
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890
npm install
# 安装完成后清除代理
npm config delete proxy
npm config delete https-proxy
```

### 检查网络连接

```bash
# 测试连接
ping registry.npmmirror.com
curl -I https://registry.npmmirror.com
```

## 📞 联系信息

如果以上方法都不行，请联系我们，我们可以：

1. 提供离线安装包
2. 使用Docker容器方式
3. 提供已构建的dist文件

---

此文档专为中国大陆网络环境优化
