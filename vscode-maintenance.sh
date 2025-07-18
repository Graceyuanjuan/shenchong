#!/bin/bash

echo "🔧 VS Code 维护和优化工具"
echo "================================="
echo

# 检查VS Code进程
echo "📋 检查VS Code进程状态..."
vscode_processes=$(ps aux | grep "Visual Studio Code" | grep -v grep | wc -l)
echo "当前VS Code进程数: $vscode_processes"

if [ $vscode_processes -gt 5 ]; then
    echo "⚠️  警告: VS Code进程数量较多，可能需要重启"
fi
echo

# 检查内存使用
echo "📊 检查VS Code内存使用..."
if command -v ps &> /dev/null; then
    memory_usage=$(ps aux | grep "Visual Studio Code" | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
    if [ ! -z "$memory_usage" ]; then
        echo "VS Code内存使用: ${memory_usage}MB"
        if (( $(echo "$memory_usage > 1000" | bc -l) )); then
            echo "⚠️  警告: 内存使用较高，建议重启VS Code"
        fi
    fi
fi
echo

# 检查文件监视器
echo "🔍 检查文件监视器状态..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    watcher_count=$(lsof 2>/dev/null | grep -c "kqueue")
    echo "当前文件监视器数量: $watcher_count"
    if [ $watcher_count -gt 1000 ]; then
        echo "⚠️  警告: 文件监视器数量过多"
    fi
fi
echo

# 提供操作建议
echo "💡 维护建议:"
echo

if [ $vscode_processes -gt 8 ] || (( $(echo "$memory_usage > 1500" | bc -l) )); then
    echo "🔴 立即操作建议:"
    echo "1. 在VS Code中按 Cmd+Shift+P"
    echo "2. 输入 'Developer: Reload Window'"
    echo "3. 或者完全重启VS Code"
    echo
fi

echo "🟡 日常维护:"
echo "1. 定期使用 'Developer: Reload Window'"
echo "2. 关闭不需要的标签页"
echo "3. 禁用不必要的扩展"
echo

echo "🟢 预防措施:"
echo "1. 避免同时打开过多大文件"
echo "2. 定期清理工作区"
echo "3. 使用命令行进行重要操作验证"
echo

# 清理建议
echo "🧹 清理选项:"
echo "如果VS Code问题持续，可以尝试:"
echo
echo "清理缓存 (需要关闭VS Code):"
echo "rm -rf ~/Library/Caches/com.microsoft.VSCode*"
echo
echo "重置扩展 (慎用):"
echo "rm -rf ~/.vscode/extensions"
echo

echo "✅ 维护检查完成!"
echo
echo "记住: 重启解决90%的VS Code问题 😄"
