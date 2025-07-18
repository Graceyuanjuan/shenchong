#!/bin/bash

echo "🔍 神宠系统启动诊断工具"
echo "================================="
echo

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version
echo

# 检查npm配置
echo "📋 检查npm镜像配置..."
npm config get registry
echo

# 检查依赖安装状态
echo "📋 检查依赖安装状态..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules 目录存在"
    echo "📦 已安装包数量: $(ls node_modules | wc -l)"
else
    echo "❌ node_modules 目录不存在，需要运行 npm install"
    exit 1
fi
echo

# 检查关键文件
echo "📋 检查关键文件..."
files=("package.json" "src/PetSystemApp.tsx" "src/ui-main.tsx" "index.html")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done
echo

# 检查端口占用
echo "📋 检查端口占用状态..."
for port in 3000 5173; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "🟡 端口 $port 已被占用"
        lsof -i :$port
    else
        echo "✅ 端口 $port 可用"
    fi
done
echo

# 尝试构建
echo "📋 测试TypeScript编译..."
npm run build > build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript编译成功"
    rm build.log
else
    echo "❌ TypeScript编译失败，查看 build.log"
    cat build.log
fi
echo

echo "🎯 诊断完成！"
echo
echo "启动建议："
echo "1. 如果所有检查都通过，运行: npm run dev:full"
echo "2. 如果有问题，请将此输出发送给技术支持"
echo
echo "预期看到完整UI界面包含："
echo "- 圆形彩色背景"
echo "- 可爱表情符号"
echo "- 状态和情绪显示"
echo "- 开发者工具面板"
