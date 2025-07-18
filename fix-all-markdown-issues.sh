#!/bin/bash

# 完美状态markdown修复脚本
# 修复所有VS Code Problems面板中的markdown警告

echo "🧹 开始修复所有markdown问题..."
echo "📊 修复前状态检查..."

# 首先安装必要的工具
if ! command -v markdownlint &> /dev/null; then
    echo "📦 安装markdownlint..."
    npm install -g markdownlint-cli
fi

# 备份原始文件
echo "💾 创建备份..."
mkdir -p markdown-backup
cp *.md markdown-backup/ 2>/dev/null || true

# 1. 修复多余空行 (MD012)
echo "🔧 修复多余空行..."
for file in *.md; do
    if [ -f "$file" ]; then
        # 删除连续的多个空行，保留单个空行
        perl -i -pe 's/\n\n\n+/\n\n/g' "$file"
    fi
done

# 2. 修复尾随空格 (MD009)
echo "🔧 修复尾随空格..."
for file in *.md; do
    if [ -f "$file" ]; then
        # 删除行尾空格
        sed -i '' 's/[[:space:]]*$//' "$file"
    fi
done

# 3. 修复裸露URL (MD034)
echo "🔧 修复裸露URL..."
for file in *.md; do
    if [ -f "$file" ]; then
        # 将裸露的URL包装为链接格式
        sed -i '' 's|\(https\?://[^[:space:]]*\)|<\1>|g' "$file"
        sed -i '' 's|[^<]\(http://localhost:[0-9]*\)[^>]|<\1>|g' "$file"
        sed -i '' 's|support@saintgrid\.com|<support@saintgrid.com>|g' "$file"
    fi
done

# 4. 修复代码块语言标记 (MD040)
echo "🔧 修复代码块语言标记..."
for file in *.md; do
    if [ -f "$file" ]; then
        # 为空的代码块添加适当的语言标记
        sed -i '' 's/^```$/```text/g' "$file"
    fi
done

# 5. 修复标题标点符号 (MD026)
echo "🔧 修复标题标点符号..."
for file in *.md; do
    if [ -f "$file" ]; then
        # 移除标题末尾的标点符号
        sed -i '' 's/^\(#* .*\)[：:！!。.]*$/\1/g' "$file"
    fi
done

# 6. 修复列表周围空行 (MD032)
echo "🔧 修复列表格式..."
for file in *.md; do
    if [ -f "$file" ]; then
        # 这个比较复杂，使用markdownlint的自动修复功能
        npx markdownlint --fix "$file" 2>/dev/null || true
    fi
done

# 7. 修复System_Status_Report.md中的重复标题
echo "🔧 修复重复标题..."
if [ -f "System_Status_Report.md" ]; then
    # 为重复的标题添加编号
    sed -i '' 's/^## 📊 系统状态评级$/## 📊 系统状态评级 (概览)/g' "System_Status_Report.md"
    sed -i '' 's/^## 🏁 结论$/## 🏁 最终结论/g' "System_Status_Report.md"
fi

# 8. 修复第一行标题问题 (MD041)
echo "🔧 修复第一行标题问题..."
for file in *.md; do
    if [ -f "$file" ]; then
        # 确保第一行是顶级标题
        if head -1 "$file" | grep -q "^## "; then
            sed -i '' '1s/^## /# /' "$file"
        fi
    fi
done

# 运行markdownlint的自动修复
echo "🔧 运行markdownlint自动修复..."
for file in *.md; do
    if [ -f "$file" ]; then
        npx markdownlint --fix "$file" 2>/dev/null || true
    fi
done

echo "✅ 修复完成！"
echo "📊 修复后状态检查..."

# 最终检查
markdownlint_output=$(npx markdownlint *.md 2>&1 || true)
error_count=$(echo "$markdownlint_output" | wc -l)

if [ -z "$markdownlint_output" ]; then
    echo "🎉 完美！所有markdown问题已修复！"
    echo "🏆 VS Code Problems面板应该显示0个markdown警告"
else
    echo "📝 剩余问题数量: $error_count"
    echo "详细信息:"
    echo "$markdownlint_output" | head -20
fi

echo "💡 请重新加载VS Code窗口查看结果"
echo "🔄 Command: Developer: Reload Window"
