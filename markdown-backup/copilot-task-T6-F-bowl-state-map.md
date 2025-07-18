# ✅ Copilot 标准任务卡：T6-F · 单碗多状态行为绑定任务卡

**任务编号**: copilot-task-T6-F-bowl-state-map.md  
**目标组件**: BowlUI.tsx

---

## 🎯 任务目标

将当前 UI 中的"碗"组件升级为具备四种状态响应的智能交互体：

**一个"碗"具有 四种行为状态，分别通过不同交互方式触发，每个状态代表不同系统功能。**

---

## 🍚 状态编号与交互方式

| 编号 | 状态名称 | 触发方式 | 功能说明 |
|------|----------|----------|----------|
| ① | 静碗 | 默认展示 | 神宠待机，碗处于休眠状态 |
| ② | 感应碗 | 鼠标悬浮 hover | 展示提示、泛光特效、唤醒引导 |
| ③ | 唤醒碗 | 左键点击 click | 启动截图/记要/投屏等交互工具 |
| ④ | 控制碗 | 右键点击 contextmenu | 弹出系统菜单（换肤、对话、面板等） |

---

## 🧩 技术拆解建议

### 1️⃣ 默认状态（静碗）初始化

```tsx
<div className="bowl" onMouseEnter={handleHover} onClick={handleLeftClick} onContextMenu={handleRightClick}>
  🥣
</div>
```


### 2️⃣ 状态处理逻辑封装


```tsx
function handleHover() {
  setCurrentBowlState("感应碗");
  playGlowEffect();
  showTooltip("点击唤醒神宠！");
}

function handleLeftClick() {
  setCurrentBowlState("唤醒碗");
  triggerActions(["screenshot", "copy", "record"]);
}

function handleRightClick(e: React.MouseEvent) {
  e.preventDefault();
  setCurrentBowlState("控制碗");
  openControlMenu();
}
```


---

## 🎨 UI行为要求

| 状态 | 动画/效果 | 提示元素 |
|------|-----------|----------|
| 静碗 | 正常大小，无动画 | 表情默认 |
| 感应碗 | 光晕特效 + 文案引导 | 提示文字：点击唤醒神宠！ |
| 唤醒碗 | 变形（放大）+ Emoji闪动 | 动画截图/复制小图标浮现 |
| 控制碗 | 弹出菜单浮层 | 包含换肤、神宠聊天、控制面板等 |

---

## ✅ 验收标准

| 检查项 | 通过标准 |
|--------|----------|
| 四种交互准确触发 | 每种交互方式对应不同状态，无干扰逻辑 |
| 状态切换顺畅 | 状态切换 UI/行为同步，无延迟或冲突 |
| 插件行为可扩展 | triggerActions() 为可配置函数，后期支持插件拓展 |
| 控制菜单弹出 | 右键弹出菜单含预设功能入口，初版可放空逻辑验证结构 |

---

## 📦 文件结构建议（复用现有）

```text
src/
├── components/
│   └── BowlUI.tsx  # 实现四态碗组件逻辑
```


---

## 🚫 非本阶段目标

- ❌ 暂不实现菜单功能逻辑，仅需弹出结构
- ❌ 暂不接入后端或外部接口
- ❌ 暂不进行复杂动画设计，保留简约交互

---

## 📝 备注

完成后更新我们的MD文件
