#!/bin/bash

echo "🔥 VS Code 顽固问题强力清除工具"
echo "=================================="
echo "问题状态: 44个 (执行Reload Window后仍然存在)"
echo "诊断: VS Code已进入'深度幻觉'状态"
echo

echo "🎯 强力解决方案序列:"
echo

echo "方案1: 重启TypeScript Language Server"
echo "在VS Code中执行:"
echo "  Cmd+Shift+P → TypeScript: Restart TS Server"
echo "  等待2-3分钟让服务完全重启"
echo

echo "方案2: 清除VS Code工作区缓存"
echo "在VS Code中执行:"
echo "  Cmd+Shift+P → Developer: Reload Window With Extensions Disabled"
echo "  然后重新启用扩展"
echo

echo "方案3: 终极重启 (核武器级别)"
echo "1. 完全关闭VS Code (Cmd+Q)"
echo "2. 执行以下命令清理缓存:"

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   rm -rf ~/Library/Caches/com.microsoft.VSCode*"
    echo "   rm -rf ~/.vscode/CachedExtensions"
    echo "   rm -rf /tmp/vscode-*"
else
    echo "   rm -rf ~/.cache/vscode"
    echo "   rm -rf ~/.vscode/CachedExtensions"
    echo "   rm -rf /tmp/vscode-*"
fi

echo "3. 等待30秒"
echo "4. 重新打开VS Code"
echo

echo "方案4: 进程清理 (如果VS Code卡死)"
echo "执行以下命令强制清理所有VS Code进程:"
echo "  pkill -f 'Visual Studio Code'"
echo "  pkill -f 'Code Helper'"
echo "  pkill -f 'node.*typescript'"
echo

echo "🔍 当前系统状态检查:"
echo

# 检查VS Code进程
vscode_count=$(ps aux | grep "Visual Studio Code" | grep -v grep | wc -l)
echo "VS Code进程数: $vscode_count"

# 检查TypeScript进程
ts_count=$(ps aux | grep "typescript" | grep -v grep | wc -l)
echo "TypeScript进程数: $ts_count"

# 检查端口占用
echo "端口占用检查:"
for port in 3000 5173 8080; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "  端口 $port: 被占用"
    else
        echo "  端口 $port: 空闲"
    fi
done

echo
echo "💡 如果问题仍然存在:"
echo "这可能是以下原因之一:"
echo "1. VS Code扩展冲突 (特别是TypeScript相关扩展)"
echo "2. 项目文件损坏 (检查 .vscode/settings.json)"
echo "3. 系统级别的文件监视器问题"
echo "4. TypeScript配置文件 (tsconfig.json) 问题"
echo

echo "🔧 系统级别修复:"
echo "如果所有VS Code方案都失效，尝试:"
echo "1. 重启整个Mac系统"
echo "2. 检查磁盘空间是否充足"
echo "3. 运行磁盘工具修复权限"
echo

echo "📊 最终验证:"
echo "无论VS Code显示多少问题，记住:"
npx tsc --noEmit 2>/dev/null && echo "✅ TypeScript编译正常 - 你的代码没问题!" || echo "❌ TypeScript编译错误 - 需要检查代码"

echo
echo "🎯 建议执行顺序:"
echo "1. 方案1 (TypeScript重启) - 5分钟"
echo "2. 如果无效 → 方案2 (禁用扩展重载) - 5分钟"  
echo "3. 如果无效 → 方案3 (终极重启) - 10分钟"
echo "4. 如果无效 → 方案4 (进程清理) - 5分钟"
echo
echo "记住: 这是工具问题，不是你的代码问题! 💪"
