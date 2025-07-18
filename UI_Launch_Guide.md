# 神宠系统 - 完整UI启动指南

## 🎯 重要说明

如果你看到的是简单的状态显示界面（只显示"神宠系统启动成功"），而不是完整的开发者界面，请按照以下步骤操作：

## 🚀 正确的启动方式

### 方式1: 一键启动完整UI (推荐)

```bash
npm run dev:full
```text

这个命令会同时启动：
- TypeScript编译监视
- UI开发服务器 (Vite)
- 完整的React界面

### 方式2: 分步启动 (高级用法)

**终端1**: 启动TypeScript编译
```bash
npm run dev
```text

**终端2**: 启动UI服务器
```bash
npm run ui:dev
```text

## 🖥️ 预期界面

正确启动后，你应该看到：
- 🎯 圆形彩色界面
- 😊 可爱的表情符号
- 📊 状态显示：awaken
- 💚 情绪显示：happy
- 🔧 开发者工具面板
- 🎛️ 可交互的控制按钮

## 🔍 如果仍然显示简单界面

### 检查端口访问

```bash
# 检查Vite服务器是否启动
curl<http://localhost:300>
# 或
curl<http://localhost:517>
```text

### 检查进程状态

```bash
# 查看是否有Vite进程运行
ps aux | grep vite
```text

### 重新启动

```bash
# 停止所有进程 (Ctrl+C)
# 清理端口
pkill -f vite
pkill -f tsc

# 重新启动
npm run dev:full
```text

## 🌐 浏览器访问 (备选)

如果Electron界面有问题，可以直接在浏览器中访问：

```text
http://localhost:3000
或
http://localhost:5173
```text

## 📞 故障排除

如果以上方法都无效：

1. **确认依赖安装完成**:
   ```bash
   ls node_modules  # 应该看到大量依赖包
   ```

2. **检查构建状态**:

   ```bash
   npm run build    # 应该无错误完成
   ```

3. **查看错误日志**:

   ```bash
   npm run dev:full 2>&1 | tee startup.log
   ```

4. **联系技术支持**，提供：
   - `startup.log` 文件内容
   - `npm config list` 输出
   - 当前看到的界面截图

## ✅ 成功标志

看到以下输出表示启动成功：

```text
> vite
Local:  <http://localhost:3000>
Network: use --host to expose
✅ SaintGrid Pet System UI Rendered
```text
