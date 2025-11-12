<template>
  <div
    v-if="show"
    style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      padding: 20px;
    "
    @click.self="$emit('reject')"
  >
    <div
      style="
        background: #2a2a2a;
        border-radius: 16px;
        width: 95%;
        height: 90%;
        border: 1px solid #3a3a3a;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
      "
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        style="
          padding: 20px 25px;
          border-bottom: 1px solid #3a3a3a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <h3
          style="
            margin: 0;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-code-compare" style="color: #8b5cf6"></i>
          {{ title || 'AI 生成结果对比' }}
        </h3>
        <div style="display: flex; gap: 10px">
          <button
            style="
              padding: 8px 16px;
              background: #ef4444;
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="$emit('reject')"
            @mouseenter="(e: any) => (e.currentTarget.style.background = '#dc2626')"
            @mouseleave="(e: any) => (e.currentTarget.style.background = '#ef4444')"
          >
            <i class="fa-solid fa-xmark" style="margin-right: 6px"></i>
            拒绝
          </button>
          <button
            style="
              padding: 8px 16px;
              background: #10b981;
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            "
            @click="$emit('accept')"
            @mouseenter="(e: any) => (e.currentTarget.style.background = '#059669')"
            @mouseleave="(e: any) => (e.currentTarget.style.background = '#10b981')"
          >
            <i class="fa-solid fa-check" style="margin-right: 6px"></i>
            应用更改
          </button>
        </div>
      </div>

      <!-- 内容区 -->
      <div
        style="flex: 1; display: grid; gap: 15px; padding: 20px; overflow: hidden"
        :style="{
          gridTemplateColumns: showPreview ? '1fr 1fr 1.5fr' : '1fr 1fr',
        }"
      >
        <!-- 修改前代码 -->
        <div style="display: flex; flex-direction: column; background: #1e1e1e; border-radius: 8px; overflow: hidden">
          <div style="padding: 12px 15px; background: #2a2a2a; border-bottom: 1px solid #3a3a3a">
            <h4 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-file-code" style="margin-right: 8px; color: #ef4444"></i>
              修改前
            </h4>
          </div>
          <div style="flex: 1; overflow-y: auto; padding: 15px">
            <div v-if="changes.length === 0" style="color: #666; text-align: center; padding: 40px 20px">
              <i class="fa-solid fa-inbox" style="font-size: 48px; margin-bottom: 16px"></i>
              <div>暂无内容</div>
            </div>
            <div v-for="change in changes" :key="change.path" style="margin-bottom: 20px">
              <div
                style="
                  color: #4a9eff;
                  font-size: 12px;
                  font-weight: 600;
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                <i :class="getFileIcon(change.path)"></i>
                {{ change.path }}
              </div>
              <pre
                style="
                  margin: 0;
                  padding: 12px;
                  background: #1a1a1a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-family: 'Consolas', 'Monaco', monospace;
                  font-size: 12px;
                  line-height: 1.5;
                  overflow-x: auto;
                  border: 1px solid #3a3a3a;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                "
                >{{ change.oldContent || '(空)' }}</pre
              >
            </div>
          </div>
        </div>

        <!-- 修改后代码 -->
        <div style="display: flex; flex-direction: column; background: #1e1e1e; border-radius: 8px; overflow: hidden">
          <div style="padding: 12px 15px; background: #2a2a2a; border-bottom: 1px solid #3a3a3a">
            <h4 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-file-code" style="margin-right: 8px; color: #10b981"></i>
              修改后
            </h4>
          </div>
          <div style="flex: 1; overflow-y: auto; padding: 15px">
            <div v-for="change in changes" :key="change.path" style="margin-bottom: 20px">
              <div
                style="
                  color: #4a9eff;
                  font-size: 12px;
                  font-weight: 600;
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                <i :class="getFileIcon(change.path)"></i>
                {{ change.path }}
              </div>
              <pre
                style="
                  margin: 0;
                  padding: 12px;
                  background: #1a1a1a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-family: 'Consolas', 'Monaco', monospace;
                  font-size: 12px;
                  line-height: 1.5;
                  overflow-x: auto;
                  border: 1px solid #3a3a3a;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                "
                >{{ change.newContent }}</pre
              >
            </div>
          </div>
        </div>

        <!-- 预览效果（可选） -->
        <div
          v-if="showPreview"
          style="display: flex; flex-direction: column; background: #1e1e1e; border-radius: 8px; overflow: hidden"
        >
          <div style="padding: 12px 15px; background: #2a2a2a; border-bottom: 1px solid #3a3a3a">
            <h4 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-eye" style="margin-right: 8px; color: #4a9eff"></i>
              预览效果
            </h4>
          </div>
          <div style="flex: 1; overflow: auto; padding: 15px; background: #1a1a1a">
            <slot name="preview">
              <div style="color: #666; text-align: center; padding: 40px 20px">
                <i class="fa-solid fa-image" style="font-size: 48px; margin-bottom: 16px"></i>
                <div>暂无预览</div>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface CodeChange {
  path: string;
  oldContent: string;
  newContent: string;
}

defineProps<{
  show: boolean;
  title?: string;
  changes: CodeChange[];
  showPreview?: boolean;
}>();

defineEmits<{
  accept: [];
  reject: [];
}>();

const getFileIcon = (path: string): string => {
  if (path.endsWith('.html')) return 'fa-brands fa-html5';
  if (path.endsWith('.css')) return 'fa-brands fa-css3-alt';
  if (path.endsWith('.js')) return 'fa-brands fa-js';
  if (path.endsWith('.ts')) return 'fa-brands fa-js';
  if (path.endsWith('.json')) return 'fa-solid fa-file-code';
  if (path.endsWith('.vue')) return 'fa-brands fa-vuejs';
  return 'fa-solid fa-file';
};
</script>
