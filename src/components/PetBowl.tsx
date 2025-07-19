import React, { useState } from "react";
import { motion } from "framer-motion";

// 如果你没有用 shadcn/ui，可以用这个轻量Button组件替代
const BaseButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-sm rounded bg-white hover:bg-gray-100 border border-gray-300 shadow transition-colors"
  >
    {children}
  </button>
);

export default function PetBowl() {
  const [mode, setMode] = useState<"idle" | "hover" | "left" | "right">("idle");

  // 实际功能绑定
  const handleAction = (action: string) => {
    console.log(`🍚 执行功能: ${action}`);
    alert(`点击了: ${action}`); // 添加alert来测试功能
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 🍲 主碗按钮 */}
      <div
        className="w-20 h-20 rounded-full bg-blue-500 shadow-lg cursor-pointer flex items-center justify-center text-white text-2xl border-4 border-white"
        onMouseEnter={() => setMode("hover")}
        onMouseLeave={() => setMode("idle")}
        onClick={(e) => {
          e.stopPropagation();
          setMode("left");
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMode("right");
        }}
        style={{
          transform: mode === "left" ? "scale(1.1)" : mode === "hover" ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.2s ease"
        }}
      >
        🥣
      </div>

      {/* 👀 感应碗 - Hover 面板 */}
      {mode === "hover" && (
        <div className="absolute bottom-24 right-0 bg-white p-3 shadow-xl rounded-xl border border-gray-200 min-w-[200px]">
          <div className="text-xs text-gray-500 mb-2">播放控制</div>
          <div className="flex flex-wrap gap-2">
            {["播放", "暂停", "快进", "快退"].map((label) => (
              <BaseButton key={label} onClick={() => handleAction(label)}>
                {label}
              </BaseButton>
            ))}
          </div>
        </div>
      )}

      {/* 🐣 唤醒碗 - Left Click 面板 */}
      {mode === "left" && (
        <div className="absolute bottom-24 right-0 bg-white p-3 shadow-xl rounded-xl border border-gray-200 w-56">
          <div className="text-xs text-gray-500 mb-2">功能菜单</div>
          <div className="grid grid-cols-2 gap-2">
            {["截图", "复制", "记要", "投屏"].map((action) => (
              <BaseButton key={action} onClick={() => handleAction(action)}>
                {action}
              </BaseButton>
            ))}
          </div>
        </div>
      )}

      {/* ⚙️ 控制碗 - Right Click 面板 */}
      {mode === "right" && (
        <div className="absolute bottom-24 right-0 bg-gray-800 text-white p-3 shadow-xl rounded-xl border border-gray-600 w-56">
          <div className="text-xs text-gray-400 mb-2">系统设置</div>
          <div className="grid grid-cols-2 gap-2">
            {["换肤", "AI对话", "网页", "控制面板"].map((item) => (
              <BaseButton key={item} onClick={() => handleAction(item)}>
                {item}
              </BaseButton>
            ))}
          </div>
        </div>
      )}

      {/* 点击其他区域关闭面板 */}
      {mode !== "idle" && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setMode("idle")}
        />
      )}
    </div>
  );
}
