# VS Code 性能优化和稳定性指南

## 🔍 常见问题症状

✅ **你遇到的问题**:

- VS Code偶尔"死掉"或响应缓慢
- 问题面板显示大量假阳性错误（如12个问题）
- 重启后问题数量大幅减少（如变成1个）

## 🎯 根本原因

1. **TypeScript Language Server 内存泄漏**
2. **文件监视器溢出** (大项目常见)
3. **扩展冲突或资源占用**
4. **VS Code缓存损坏**

## 🚀 立即解决方案

### 方案1: 重载VS Code窗口 (推荐)

```text
Cmd+Shift+P (macOS) 或 Ctrl+Shift+P (Windows)
输入: "Developer: Reload Window"
```text

这比完全重启VS Code更快，通常能解决大部分问题。

### 方案2: 重启TypeScript服务器

```text
Cmd+Shift+P
输入: "TypeScript: Restart TS Server"
```text

专门重启TypeScript语言服务，解决类型检查问题。

### 方案3: 清理VS Code缓存

```bash
# 关闭VS Code后执行
rm -rf ~/Library/Caches/com.microsoft.VSCode*  # macOS
# 或
rm -rf ~/.cache/vscode  # Linux
```text

## ⚙️ VS Code性能优化配置

创建或编辑 `.vscode/settings.json`:

```json
{
  "typescript.disableAutomaticTypeAcquisition": true,
  "typescript.surveys.enabled": false,
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.git/**": true,
    "**/build/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.semanticTokenColorCustomizations": {
    "enabled": false
  }
}
```text

## 🔧 预防性维护

### 每日操作
- 定期使用 "Developer: Reload Window" 而不是完全重启
- 关闭不需要的标签页和文件

### 每周操作
- 重启VS Code完全退出
- 更新扩展到最新版本
- 清理工作区缓存

### 扩展管理
- 禁用不必要的扩展
- 检查扩展内存占用: `Cmd+Shift+P` → "Developer: Show Running Extensions"

## 📊 性能监控

### 检查VS Code性能
```text
Cmd+Shift+P → "Developer: Open Process Explorer"
```text

### 检查扩展性能
```text
Cmd+Shift+P → "Developer: Show Running Extensions"
```text

## 🎯 针对我们项目的优化

基于神宠系统项目特点:

### 文件监视优化
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/assets/models/**": true,
    "**/.git/**": true,
    "**/electron/dist/**": true
  }
}
```text

### TypeScript优化
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false,
  "typescript.updateImportsOnFileMove.enabled": "never"
}
```text

## 🚨 紧急情况处理

如果VS Code完全卡死:

1. **强制退出**: `Cmd+Option+Esc` → 选择VS Code → 强制退出
2. **清理进程**:
   ```bash
   pkill -f "Visual Studio Code"
   pkill -f "Code Helper"
   ```

3. **重新启动**: 等待30秒后重新打开VS Code

## 📋 日常开发最佳实践

1. **命令行为准**: 重要操作如编译、测试，优先使用命令行验证
2. **定期重载**: 每工作2-3小时重载一次窗口
3. **分批开发**: 不要同时编辑过多文件
4. **及时关闭**: 不需要的预览、终端及时关闭

## 🔔 何时需要完全重启VS Code

- 安装新扩展后
- 修改VS Code设置后
- 连续出现性能问题
- 问题面板显示明显错误的问题数量

---

**记住**: VS Code偶尔的性能问题是正常的，特别是在大型TypeScript项目中。关键是建立好的维护习惯！
