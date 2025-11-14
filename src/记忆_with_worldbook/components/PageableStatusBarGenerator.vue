<template>
  <div class="pageable-statusbar-generator" style="padding: 25px; background: #1a1a1a">
    <!-- 标题说明 -->
    <div
      style="
        background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 20px;
        border: 1px solid rgba(74, 158, 255, 0.2);
      "
    >
      <h3 style="color: #4a9eff; margin: 0 0 10px 0; font-size: 20px; font-weight: 600">📖 翻页状态栏生成器</h3>
      <p style="color: #888; margin: 0; font-size: 14px; line-height: 1.6">
        用 AI 生成可翻页、可交互的多页面状态栏。描述你想要的样式，AI 会为你创造！
      </p>
    </div>

    <!-- 主内容区 -->
    <div style="display: grid; grid-template-columns: 400px 1fr; gap: 20px">
      <!-- 左侧：配置区 -->
      <div style="display: flex; flex-direction: column; gap: 15px">
        <!-- 触发正则 -->
        <div style="background: #2a2a2a; padding: 15px; border-radius: 12px; border: 1px solid #3a3a3a">
          <label style="display: block; margin-bottom: 8px; color: #c0c0c0; font-size: 13px; font-weight: 600">
            触发正则
          </label>
          <input
            v-model="triggerRegex"
            type="text"
            placeholder="<-STATUS->"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
            "
          />
        </div>

        <!-- AI 生成区 -->
        <div
          style="
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(245, 158, 11, 0.3);
          "
        >
          <h4 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 15px; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-sparkles"></i>
            AI 智能生成
          </h4>
          <textarea
            v-model="aiPrompt"
            placeholder="✨ 详细描述你想要的翻页状态栏样式：&#10;&#10;🎨 风格示例：&#10;- 深色科技风格，左边圆形头像，右边3个标签页，蓝色渐变（#1e3a8a 到 #3b82f6），圆角卡片（20px），多层阴影，发光边框，玻璃态效果&#10;- 粉色可爱风格，显示角色信息、状态、关系，柔和配色（#fce7f3 到 #fdf2f8），圆润设计（16px圆角），平滑动画（0.3s cubic-bezier）&#10;- 游戏风格，HP/MP进度条（渐变+发光+脉动动画），技能图标，霓虹边框，赛博朋克配色（#00f0ff, #ff00ff）&#10;&#10;💡 必须包含的设计细节（写得越详细，生成越美观）：&#10;1. 配色：具体颜色值（如：深色渐变 #0f172a → #1e293b，强调色 #3b82f6）&#10;2. 容器：padding（20-30px），圆角（16-20px），阴影（多层），边框（发光）&#10;3. 标签页按钮：默认/悬停/激活状态的详细样式（渐变、发光、放大效果）&#10;4. 字段项：背景（半透明），圆角（8-10px），间距（12-16px），图标&#10;5. 动画：过渡时间（0.3s），缓动函数（cubic-bezier），页面切换效果&#10;6. 特殊效果：玻璃态（backdrop-filter: blur），发光（box-shadow），渐变（linear-gradient）&#10;&#10;⚠️ 重要：必须明确要求使用渐变、阴影、发光、圆角、动画等现代设计元素！"
            :disabled="isGenerating"
            style="
              width: 100%;
              min-height: 200px;
              padding: 12px;
              background: #1e1e1e;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              resize: vertical;
              margin-bottom: 12px;
            "
          ></textarea>
          <button
            style="
              width: 100%;
              padding: 12px;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            :style="{ opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }"
            :disabled="isGenerating"
            @click="generateWithAI"
          >
            <i
              :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"
              style="margin-right: 8px"
            ></i>
            {{ isGenerating ? '生成中...' : '✨ AI 一键生成' }}
          </button>
        </div>

        <!-- 操作按钮 -->
        <div style="display: flex; flex-direction: column; gap: 10px">
          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            :disabled="!generatedHTML"
            :style="{ opacity: !generatedHTML ? 0.5 : 1 }"
            @click="exportRegex"
          >
            <i class="fa-solid fa-download" style="margin-right: 8px"></i>
            导出正则 JSON
          </button>

          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            @click="loadExample"
          >
            <i class="fa-solid fa-lightbulb" style="margin-right: 8px"></i>
            加载示例
          </button>

          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            @click="clearAll"
          >
            <i class="fa-solid fa-trash" style="margin-right: 8px"></i>
            清空所有
          </button>
        </div>
      </div>

      <!-- 右侧：预览区 -->
      <div
        style="
          background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #10b981;
          display: flex;
          flex-direction: column;
          min-height: 700px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        "
      >
        <div
          style="
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
            border-radius: 10px;
            border: 1px solid rgba(16, 185, 129, 0.3);
          "
        >
          <i class="fa-solid fa-eye" style="color: #10b981; font-size: 18px"></i>
          <span style="color: #fff; font-size: 16px; font-weight: 700">实时预览</span>
        </div>

        <div
          style="
            flex: 1;
            background: linear-gradient(135deg, #1e1e1e 0%, #252525 100%);
            border-radius: 12px;
            padding: 30px;
            overflow: auto;
            border: 2px solid #3a3a3a;
            box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
          "
        >
          <iframe
            v-if="generatedHTML"
            :srcdoc="previewHTML"
            style="width: 100%; height: 100%; min-height: 600px; border: none; border-radius: 8px; background: white"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          <div
            v-else
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #666;
              text-align: center;
            "
          >
            <div>
              <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3"></i>
              <p style="font-size: 16px">使用 AI 生成或加载示例查看预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { filterApiParams, normalizeApiEndpoint, useSettingsStore } from '../settings';

// Settings store
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// 状态
const triggerRegex = ref('<-STATUS->');
const aiPrompt = ref('');
const isGenerating = ref(false);
const generatedHTML = ref('');

// 预览 HTML
const previewHTML = computed(() => {
  if (!generatedHTML.value) return '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${generatedHTML.value}
</body>
</html>
  `;
});

// AI 生成
const generateWithAI = async () => {
  if (!aiPrompt.value.trim()) {
    (window as any).toastr?.warning('请输入生成需求');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    (window as any).toastr?.error('请先在"设置"标签页配置 API');
    return;
  }

  isGenerating.value = true;

  const systemPrompt = `你是一个顶级的前端UI/UX设计师，专门为 SillyTavern 生成美观、现代、专业的翻页状态栏。

【设计原则 - 必须严格遵循】：

1. **视觉美观 - 这是最重要的！**：
   - **配色方案**：必须使用精心设计的渐变配色，避免单调的纯色
     * 深色主题：使用深灰到浅灰的渐变（如 #1a1a1a → #2d2d2d），配合彩色强调色
     * 浅色主题：使用柔和的浅色渐变（如 #f8f9fa → #ffffff），配合深色文字
     * 必须使用渐变背景：linear-gradient(135deg, ...) 或 radial-gradient(...)
   - **间距设计**：所有元素必须有充足的 padding 和 margin
     * 容器 padding: 20-30px
     * 字段项之间的间距: 12-16px
     * 标签页按钮间距: 8-12px
   - **圆角设计**：所有元素都要有圆角，让界面更柔和
     * 容器: border-radius: 16-20px
     * 按钮: border-radius: 10-12px
     * 字段项: border-radius: 8-10px
   - **阴影效果**：必须添加多层阴影增加深度感
     * 容器: box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)
     * 按钮悬停: box-shadow: 0 4px 16px rgba(主色, 0.4)
   - **发光效果**：关键元素要有微妙的发光
     * 激活的标签页: box-shadow: 0 0 20px rgba(主色, 0.5)
     * 重要字段: text-shadow: 0 0 10px rgba(主色, 0.5)

2. **交互体验 - 必须流畅**：
   - **标签页按钮设计**：
     * 默认状态：半透明背景，边框，圆角
     * 悬停状态：背景渐变，放大效果（transform: scale(1.05)），阴影增强
     * 激活状态：渐变背景，发光边框，字体加粗
     * 过渡动画：transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
   - **页面切换动画**：
     * 使用 opacity 和 transform 实现淡入淡出
     * transition: opacity 0.3s ease, transform 0.3s ease
   - **所有可交互元素**：cursor: pointer，必须有悬停反馈

3. **视觉层次 - 必须清晰**：
   - **字体设计**：
     * 标题：font-size: 18-20px, font-weight: 700, 使用渐变文字或高对比度颜色
     * 标签：font-size: 14px, font-weight: 600, color: #888 或半透明白色
     * 值：font-size: 16px, font-weight: 500, color: #fff 或深色
   - **颜色对比**：
     * 背景和文字必须有足够的对比度（至少 4.5:1）
     * 使用强调色突出重要信息
   - **图标装饰**：
     * 在标签页按钮前添加 Font Awesome 图标（使用 <i class="fa-solid fa-xxx"></i>）
     * 在字段标签前添加小图标增强视觉识别

4. **现代UI元素 - 必须使用**：
   - **卡片式设计**：
     * 每个页面内容使用卡片容器
     * 卡片背景：半透明或渐变，带模糊效果
   - **玻璃态效果**：
     * backdrop-filter: blur(10px) saturate(180%)
     * background: rgba(255, 255, 255, 0.1) 或 rgba(0, 0, 0, 0.2)
   - **渐变背景和边框**：
     * 容器背景：linear-gradient(135deg, 颜色1, 颜色2)
     * 边框：border: 2px solid，配合渐变或发光
   - **进度条设计**（如果用户要求）：
     * 使用渐变背景：linear-gradient(90deg, 起始色, 结束色)
     * 添加动画：animation: pulse 2s ease-in-out infinite
     * 发光效果：box-shadow: 0 0 10px rgba(主色, 0.6)

【输出格式】：
必须输出一个完整的 HTML 代码块，包含：
1. <style> 标签内的所有 CSS 样式（必须包含美观的样式）
2. HTML 结构（使用 <details> 和 <summary>）
3. <script> 标签内的翻页 JavaScript 代码

【HTML 结构要求】：
<details>
<summary style="...">状态栏标题</summary>
<div class="status-container" style="...">
  <!-- 翻页按钮/标签页 -->
  <div class="page-tabs" style="...">
    <button class="page-tab active" onclick="switchPage(0)" style="...">
      <i class="fa-solid fa-xxx"></i> 页面1
    </button>
    <button class="page-tab" onclick="switchPage(1)" style="...">
      <i class="fa-solid fa-xxx"></i> 页面2
    </button>
  </div>

  <!-- 页面内容 -->
  <div class="page-content" style="...">
    <div class="page active" data-page="0" style="...">
      <div class="field-item" style="...">
        <span class="field-label" style="...">
          <i class="fa-solid fa-xxx"></i> 字段1:
        </span>
        <span class="field-value" style="...">$1</span>
      </div>
      <!-- 更多字段... -->
    </div>
    <div class="page" data-page="1" style="...">
      <!-- 页面2内容... -->
    </div>
  </div>
</div>
</details>

【JavaScript 要求】：
使用 <script> 标签包含以下代码：
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page, i) => {
    if (i === index) {
      page.style.display = 'block';
      setTimeout(() => {
        page.style.opacity = '1';
        page.style.transform = 'translateY(0)';
      }, 10);
    } else {
      page.style.opacity = '0';
      page.style.transform = 'translateY(10px)';
      setTimeout(() => {
        page.style.display = 'none';
      }, 300);
    }
  });
}

【CSS 样式要求 - 必须非常美观】：
- **容器样式**：
  * 背景：渐变背景，不能是纯色
  * 边框：2px solid，配合渐变或发光
  * 阴影：多层阴影，外阴影 + 内阴影
  * 圆角：16-20px
  * 内边距：20-30px

- **标签页按钮样式**：
  * 默认：半透明背景 rgba(255,255,255,0.1)，边框，圆角 10px，padding 12px 20px
  * 悬停：渐变背景，transform: scale(1.05)，阴影增强，transition 0.3s
  * 激活：渐变背景，发光边框，font-weight: 700，box-shadow 发光

- **字段项样式**：
  * 每个字段项：背景 rgba(255,255,255,0.05)，圆角 8px，padding 12px 16px
  * 标签和值：清晰的视觉分隔，合适的字体大小和颜色
  * 字段项之间：margin-bottom: 12px

- **动画效果**：
  * 所有交互：transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  * 页面切换：opacity + transform 动画
  * 悬停效果：scale、shadow、color 变化

【关键要求】：
1. 使用 $1, $2, $3 等占位符表示字段值
2. 生成 2-4 个页面，每个页面显示不同字段
3. **CSS 样式必须非常美观、现代、专业，绝对不能简陋或丑陋**
4. 翻页按钮必须设计精美，有明显的激活和悬停状态
5. 必须使用渐变、阴影、发光、圆角等现代设计元素
6. 直接输出完整的 HTML 代码，不要添加任何解释文字
7. 不要使用 \`\`\`html 代码块标记
8. **重点：生成的UI必须非常美观，符合现代UI设计标准，绝对不能简陋！**`;

  try {
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const requestParams = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `用户需求：${aiPrompt.value.trim()}\n\n请根据以上需求生成一个非常美观、现代、专业的翻页状态栏。\n\n【必须遵循的设计要求】：\n1. **配色**：必须使用渐变配色，不能使用纯色。深色主题使用深灰渐变配合彩色强调，浅色主题使用柔和浅色渐变。\n2. **间距**：容器 padding 20-30px，字段项间距 12-16px，所有元素都要有充足的留白。\n3. **圆角**：容器 16-20px，按钮 10-12px，字段项 8-10px。\n4. **阴影**：必须添加多层阴影（外阴影 + 内阴影），按钮悬停时阴影增强。\n5. **发光**：激活的标签页要有发光效果，重要字段可以有文字发光。\n6. **动画**：所有交互都要有平滑的过渡动画（0.3s cubic-bezier），页面切换要有淡入淡出效果。\n7. **标签页按钮**：默认半透明背景+边框，悬停时渐变背景+放大+阴影增强，激活时渐变背景+发光边框+加粗。\n8. **字段项**：每个字段项要有半透明背景、圆角、合适的 padding，标签和值要有清晰的视觉分隔。\n9. **图标**：标签页按钮和字段标签前要添加合适的 Font Awesome 图标。\n10. **玻璃态效果**：可以使用 backdrop-filter: blur 和半透明背景增加现代感。\n\n【绝对禁止】：\n- 不能使用纯色背景（必须用渐变）\n- 不能没有阴影和发光效果\n- 不能间距太小或没有间距\n- 不能没有圆角\n- 不能没有动画效果\n- 不能简陋或丑陋的设计\n\n现在直接输出完整的 HTML 代码（不要添加任何解释文字）：`,
        },
      ],
      max_tokens: Math.min(settings.value.max_tokens, 8192),
      temperature: settings.value.temperature,
    };

    const filteredParams = filterApiParams(requestParams, settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredParams),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败 (${response.status})`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.content || '';

    // 清理代码块标记
    content = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 提取 <details> 到 </details> 之间的内容
    const detailsMatch = content.match(/<details[\s\S]*?<\/details>/i);
    if (detailsMatch) {
      generatedHTML.value = detailsMatch[0];
      (window as any).toastr?.success('✨ AI 生成成功！');
    } else {
      // 如果没有 <details>，尝试提取整个 HTML
      generatedHTML.value = content;
      (window as any).toastr?.warning('生成成功，但格式可能需要调整');
    }
  } catch (error) {
    console.error('AI 生成失败:', error);
    (window as any).toastr?.error('AI 生成失败：' + (error as Error).message);
  } finally {
    isGenerating.value = false;
  }
};

// 导出正则
const exportRegex = () => {
  if (!generatedHTML.value) {
    (window as any).toastr?.warning('请先生成内容');
    return;
  }

  const uuid = `regex-pageable-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const regexData = {
    id: uuid,
    scriptName: '翻页状态栏',
    findRegex: triggerRegex.value,
    replaceString: generatedHTML.value,
    trimStrings: [],
    placement: [2], // AI回复前
    disabled: false,
    runOnEdit: true,
  };

  const jsonStr = JSON.stringify(regexData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pageable-statusbar.json';
  a.click();
  URL.revokeObjectURL(url);

  (window as any).toastr?.success('✅ 正则已导出');
};

// 加载示例
const loadExample = () => {
  aiPrompt.value = `深色科技风格的角色状态栏，包含3个标签页：

1. 基础信息（姓名、年龄、性别、职业）
   - 每个字段前添加合适的图标
   - 使用卡片式布局，字段项有半透明背景

2. 状态（HP、MP、体力、精力）
   - 使用精美的渐变进度条（linear-gradient 90deg）
   - 进度条要有发光效果和脉动动画
   - 显示数值和百分比

3. 关系（好感度、信任度、关系状态）
   - 使用进度条或星级显示好感度
   - 关系状态用标签显示，带颜色区分

【详细设计要求】：
- 配色方案：深色背景使用渐变（#0f172a → #1e293b），配合蓝色强调色（#3b82f6 → #60a5fa）
- 容器样式：渐变背景，2px 发光边框，多层阴影（外阴影 + 内阴影），border-radius: 20px，padding: 25px
- 标签页按钮：
  * 默认：半透明背景 rgba(59, 130, 246, 0.1)，1px 边框 rgba(59, 130, 246, 0.3)，圆角 12px，padding 12px 24px
  * 悬停：渐变背景 linear-gradient(135deg, #3b82f6, #60a5fa)，transform: scale(1.05)，阴影增强
  * 激活：渐变背景，发光边框 box-shadow: 0 0 20px rgba(59, 130, 246, 0.6)，font-weight: 700
- 字段项：半透明背景 rgba(255, 255, 255, 0.05)，圆角 10px，padding 14px 18px，margin-bottom: 14px
- 进度条：渐变背景 linear-gradient(90deg, #3b82f6, #60a5fa)，圆角 8px，高度 24px，发光效果
- 动画：所有交互 transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)，页面切换淡入淡出
- 图标：使用 Font Awesome 图标增强视觉效果
- 玻璃态效果：backdrop-filter: blur(10px) saturate(180%)`;
  (window as any).toastr?.info('已加载详细示例，点击"AI 一键生成"开始');
};

// 清空所有
const clearAll = () => {
  if (confirm('确定要清空所有内容吗？')) {
    triggerRegex.value = '<-STATUS->';
    aiPrompt.value = '';
    generatedHTML.value = '';
    (window as any).toastr?.success('已清空');
  }
};
</script>

<style scoped>
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
}

textarea:focus,
input:focus {
  outline: none;
  border-color: #4a9eff;
}
</style>
