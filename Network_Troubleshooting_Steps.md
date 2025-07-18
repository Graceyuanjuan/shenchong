# 神宠系统网络故障排除步骤

## 🔍 当前错误分析

```text
RequestError: connect ETIMEDOUT 140.82.121.3:443
```text

**IP地址**: `140.82.121.3` (这是GitHub的服务器IP)
**端口**: `443` (HTTPS端口)
**错误类型**: 连接超时

## 🛠️ 立即执行的解决步骤

### 第1步: 配置npm国内镜像源 (必须执行)

```bash
# 切换到淘宝镜像源
npm config set registry https://registry.npmmirror.com

# 配置electron下载镜像
npm config set electron_mirror https://cdn.npmmirror.com/binaries/electron/

# 验证配置是否生效
npm config get registry
npm config get electron_mirror
```text

### 第2步: 清理并重新安装

```bash
# 清理npm缓存
npm cache clean --force

# 删除旧的依赖文件
rm -rf node_modules
rm -f package-lock.json

# 重新安装依赖
npm install
```text

### 第3步: 如果第2步仍失败，使用cnpm

```bash
# 安装cnpm (中国npm客户端)
npm install -g cnpm --registry=https://registry.npmmirror.com

# 使用cnpm安装项目依赖
cnpm install
```text

### 第4步: 验证安装结果

```bash
# 测试TypeScript编译
npm run build

# 测试UI构建
npm run ui:build

# 启动开发模式
npm run dev:full
```text

## 🌐 网络测试命令

如果以上步骤仍有问题，请执行以下测试：

```bash
# 测试能否访问淘宝镜像
ping registry.npmmirror.com

# 测试HTTP连接
curl -I https://registry.npmmirror.com

# 检查当前npm配置
npm config list
```text

## 🔧 高级解决方案

### 方案A: 使用yarn包管理器

```bash
# 安装yarn
npm install -g yarn --registry=https://registry.npmmirror.com

# 配置yarn镜像
yarn config set registry https://registry.npmmirror.com

# 使用yarn安装依赖
yarn install
```text

### 方案B: 如果有VPN/代理

```bash
# 假设代理端口为7890 (根据实际情况调整)
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890

# 安装依赖
npm install

# 安装完成后清除代理设置
npm config delete proxy
npm config delete https-proxy
```text

## 📋 执行清单

请按顺序执行以下步骤，每步完成后报告结果：

- [ ] 执行第1步：配置镜像源
- [ ] 执行第2步：清理重装
- [ ] 如果失败，执行第3步：使用cnpm
- [ ] 执行第4步：验证安装
- [ ] 如果仍有问题，执行网络测试
- [ ] 最后选择高级解决方案

## 💡 预期结果

执行完成后，应该看到：

1. `npm install` 成功完成，无ETIMEDOUT错误
2. `npm run build` 成功编译TypeScript
3. `npm run ui:build` 成功构建UI
4. `npm run dev:full` 成功启动开发服务器

## 📞 如果仍有问题

如果以上所有步骤都无法解决，请提供：

1. 执行步骤1后 `npm config list` 的输出
2. 执行步骤2后 `npm install` 的完整错误信息
3. 网络测试命令的结果

我们将提供离线安装包或Docker容器解决方案。
