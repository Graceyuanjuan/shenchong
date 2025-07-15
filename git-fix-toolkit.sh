#!/bin/bash

# Git修复工具包
# 用于处理推送内容有问题的各种情况

echo "🔧 Git修复工具包"
echo "=================="

# 检查当前状态
echo "📊 当前Git状态:"
git status --short

echo ""
echo "📈 最近5次提交:"
git log --oneline -n 5

echo ""
echo "🎯 选择修复方案:"
echo "1. 取消暂存特定文件 (修改后重新添加)"
echo "2. 修改最后一次提交 (amend)"
echo "3. 软重置到上一次提交 (保留修改)"
echo "4. 硬重置到上一次提交 (丢弃修改)"
echo "5. 创建修复提交"
echo "6. 检查文件差异"
echo "7. 强制推送 (谨慎!)"
echo "0. 退出"

read -p "请选择 (0-7): " choice

case $choice in
    1)
        read -p "输入要取消暂存的文件名: " filename
        git restore --staged "$filename"
        echo "✅ 文件 $filename 已从暂存区移除"
        ;;
    2)
        echo "⚠️  这将修改最后一次提交"
        read -p "确认继续? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            git commit --amend --no-edit
            echo "✅ 最后一次提交已修改"
        fi
        ;;
    3)
        echo "⚠️  这将重置到上一次提交但保留文件修改"
        read -p "确认继续? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            git reset --soft HEAD~1
            echo "✅ 软重置完成"
        fi
        ;;
    4)
        echo "🚨 危险! 这将丢失所有未提交的修改"
        read -p "确认继续? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            git reset --hard HEAD~1
            echo "✅ 硬重置完成"
        fi
        ;;
    5)
        read -p "输入修复提交信息: " message
        git commit -m "fix: $message"
        echo "✅ 修复提交已创建"
        ;;
    6)
        echo "📝 暂存区与工作区的差异:"
        git diff --cached
        ;;
    7)
        echo "🚨 危险! 强制推送会覆盖远程仓库"
        read -p "确认强制推送? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            git push --force-with-lease
            echo "✅ 强制推送完成"
        fi
        ;;
    0)
        echo "👋 退出修复工具"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        ;;
esac
