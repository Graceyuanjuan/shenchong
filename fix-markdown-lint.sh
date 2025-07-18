#!/bin/bash

# markdown格式修复脚本
# 修复VS Code中显示的249个markdown格式问题

echo "开始修复markdown格式问题..."

# 定义需要修复的文件列表
FILES=(
    "fix_report.md"
    "交接确认.md"
    "神宠UI开发指南.md"
    "UI_开发交接文档.md"
    "README.md"
    "docs/BehaviorDB使用说明.md"
    "docs/T5-C_RhythmAdaptationEngine_v1.1_Implementation_Summary.md"
    "503问题修复报告.md"
    "神宠行为控制系统说明书_v1.0.md"
    "Git_Push_Final_Report.md"
    "Git_Push_Status_Report.md"
    "PROJECT_SUMMARY.md"
    "T3-T4_Review_Report.md"
    "T4D_Completion_Report.md"
    "T5A_Completion_Report.md"
    "T5B_AIEmotionDriver_Completion_Report.md"
    "T5C_RhythmAdaptation_Completion_Report.md"
    "copilot-task-T6-E-bowlUI.md"
    "T6-E_四碗UI任务验证报告.md"
    "VS_Code_问题分析报告.md"
    "问题修复完成报告.md"
    "T6-E_一个碗的四种状态切换_完成报告.md"
    "T6-E_9个问题项修复完成报告.md"
    "copilot-task-T6-F-bowl-state-map.md"
    "T6-F_单碗多状态行为绑定完成报告.md"
    "T6-G_21个问题项修复完成报告.md"
    "T6-H_测试修复完成报告.md"
    "T6-I_35个问题项修复报告.md"
)

# 函数：修复单个文件的markdown格式
fix_markdown_file() {
    local file="$1"
    
    if [[ ! -f "$file" ]]; then
        echo "跳过不存在的文件: $file"
        return
    fi
    
    echo "修复文件: $file"
    
    # 创建临时文件
    local temp_file="${file}.tmp"
    
    # 修复规则：
    # 1. MD022: 标题前后添加空行
    # 2. MD032: 列表前后添加空行
    # 3. MD031: 代码块前后添加空行
    # 4. MD024: 重复标题处理（添加编号或上下文区分）
    
    awk '
    BEGIN {
        prev_line = ""
        in_code_block = 0
        in_list = 0
        heading_counts[""] = 0
    }
    
    # 检测代码块
    /^```/ {
        if (in_code_block == 0) {
            # 开始代码块，前面加空行
            if (prev_line != "" && prev_line !~ /^$/) {
                print ""
            }
            in_code_block = 1
        } else {
            # 结束代码块
            in_code_block = 0
            print $0
            # 后面加空行（除非下一行是空行）
            getline next_line
            if (next_line !~ /^$/) {
                print ""
            }
            print next_line
            next
        }
    }
    
    # 检测标题
    /^#+/ {
        # 标题前加空行（除非是文件开头）
        if (NR > 1 && prev_line != "" && prev_line !~ /^$/) {
            print ""
        }
        
        # 处理重复标题
        heading_text = $0
        if (heading_counts[heading_text] > 0) {
            # 添加编号区分
            heading_counts[heading_text]++
            gsub(/^(#+)\s*(.*)$/, "\\1 \\2 (" heading_counts[heading_text] ")", $0)
        } else {
            heading_counts[heading_text] = 1
        }
        
        print $0
        
        # 标题后加空行（除非下一行是空行）
        getline next_line
        if (next_line !~ /^$/) {
            print ""
        }
        print next_line
        next
    }
    
    # 检测列表
    /^[-*+]/ || /^[0-9]+\./ {
        if (in_list == 0) {
            # 列表开始，前面加空行
            if (prev_line != "" && prev_line !~ /^$/) {
                print ""
            }
            in_list = 1
        }
    }
    
    # 检测列表结束
    !/^[-*+]/ && !/^[0-9]+\./ && !/^  / && !/^$/ {
        if (in_list == 1) {
            # 列表结束，前面加空行
            if (prev_line !~ /^$/) {
                print ""
            }
            in_list = 0
        }
    }
    
    # 输出当前行
    {
        print $0
        prev_line = $0
    }
    ' "$file" > "$temp_file"
    
    # 替换原文件
    mv "$temp_file" "$file"
    echo "✅ 修复完成: $file"
}

# 修复所有文件
for file in "${FILES[@]}"; do
    fix_markdown_file "$file"
done

echo ""
echo "📊 修复统计："
echo "- 处理文件数: ${#FILES[@]}"
echo "- 主要修复问题:"
echo "  • MD022: 标题前后空行"
echo "  • MD032: 列表前后空行"
echo "  • MD031: 代码块前后空行"
echo "  • MD024: 重复标题编号"
echo ""
echo "✅ Markdown格式修复完成！"
echo "💡 建议重新加载VS Code以查看修复效果"
