<template>
  <div
    v-if="show"
    class="progress-overlay"
    style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      animation: fadeIn 0.2s ease;
    "
  >
    <div
      class="progress-card"
      style="
        background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
        border-radius: 16px;
        padding: 35px;
        width: 520px;
        max-width: 90vw;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid #3a3a3a;
        animation: slideUp 0.3s ease;
      "
    >
      <!-- 标题 -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px">
        <div
          class="spinner"
          style="
            width: 28px;
            height: 28px;
            border: 3px solid #3a3a3a;
            border-top-color: #4a9eff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          "
        ></div>
        <h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 600">
          {{ title }}
        </h3>
      </div>

      <!-- 进度条 -->
      <div
        class="progress-bar-container"
        style="
          width: 100%;
          height: 10px;
          background: rgba(30, 30, 30, 0.8);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
        "
      >
        <div
          class="progress-bar"
          :style="{
            width: displayProgress + '%',
            height: '100%',
            background: '#4a9eff',
            transition: 'width 0.5s ease-out',
            boxShadow: '0 0 10px rgba(74, 158, 255, 0.5)',
          }"
        ></div>
      </div>

      <!-- 当前阶段 -->
      <div class="current-stage" style="color: #e0e0e0; font-size: 14px; margin-bottom: 12px; min-height: 20px">
        {{ currentMessage }}
      </div>

      <!-- 详细信息区域 -->
      <div
        v-if="details.length > 0"
        class="details-area"
        style="
          max-height: 150px;
          overflow-y: auto;
          background: rgba(10, 10, 10, 0.5);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 11px;
          color: #a0a0a0;
          line-height: 1.6;
        "
      >
        <div v-for="(detail, i) in details" :key="i" style="margin-bottom: 4px">
          <span style="color: #4a9eff">•</span> {{ detail }}
        </div>
      </div>

      <!-- 百分比和耗时 -->
      <div style="display: flex; justify-content: space-between; align-items: center">
        <div class="progress-percent" style="color: #4a9eff; font-size: 16px; font-weight: 600">
          {{ Math.round(displayProgress) }}%
        </div>

        <div class="elapsed-time" style="color: #888; font-size: 12px">已耗时: {{ elapsedSeconds }}秒</div>
      </div>

      <!-- 取消按钮（可选） -->
      <button
        v-if="cancellable"
        style="
          width: 100%;
          margin-top: 20px;
          padding: 10px;
          background: #3a3a3a;
          border: 1px solid #4a4a4a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        "
        @mouseenter="(e: any) => (e.currentTarget.style.background = '#4a4a4a')"
        @mouseleave="(e: any) => (e.currentTarget.style.background = '#3a3a3a')"
        @click="$emit('cancel')"
      >
        取消
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

interface Props {
  show: boolean;
  title?: string;
  initialMessage?: string;
  cancellable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI 正在处理',
  initialMessage: '正在准备...',
  cancellable: false,
});

defineEmits<{
  (e: 'cancel'): void;
}>();

// 进度状态
const progress = ref(0);
const displayProgress = ref(0); // 显示的进度（用于平滑动画）
const currentMessage = ref(props.initialMessage);
const details = ref<string[]>([]);
const startTime = ref(0);
const elapsedSeconds = ref(0);

let elapsedInterval: number | null = null;
let smoothProgressInterval: number | null = null;

// 监听显示状态
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      // 显示时重置状态
      progress.value = 0;
      displayProgress.value = 0;
      currentMessage.value = props.initialMessage;
      details.value = [];
      startTime.value = Date.now();
      elapsedSeconds.value = 0;

      // 启动计时器
      if (elapsedInterval) {
        clearInterval(elapsedInterval);
      }
      elapsedInterval = window.setInterval(() => {
        elapsedSeconds.value = Math.floor((Date.now() - startTime.value) / 1000);
      }, 1000);

      // 启动平滑进度动画
      if (smoothProgressInterval) {
        clearInterval(smoothProgressInterval);
      }
      smoothProgressInterval = window.setInterval(() => {
        // 如果显示进度小于实际进度，平滑追赶
        if (displayProgress.value < progress.value) {
          const diff = progress.value - displayProgress.value;
          displayProgress.value += Math.max(0.5, diff * 0.1);
          if (displayProgress.value > progress.value) {
            displayProgress.value = progress.value;
          }
        }
        // 如果实际进度小于95%，并且显示进度接近实际进度，缓慢自动增长（模拟进度）
        else if (progress.value < 95 && displayProgress.value >= progress.value - 0.5) {
          displayProgress.value += 0.2;
          if (displayProgress.value > progress.value + 5) {
            displayProgress.value = progress.value + 5; // 最多超前5%
          }
        }
      }, 100);
    } else {
      // 隐藏时清理计时器
      if (elapsedInterval) {
        clearInterval(elapsedInterval);
        elapsedInterval = null;
      }
      if (smoothProgressInterval) {
        clearInterval(smoothProgressInterval);
        smoothProgressInterval = null;
      }
    }
  },
);

onUnmounted(() => {
  if (elapsedInterval) {
    clearInterval(elapsedInterval);
  }
  if (smoothProgressInterval) {
    clearInterval(smoothProgressInterval);
  }
});

// 暴露的方法
function setProgress(percent: number) {
  progress.value = Math.min(100, Math.max(0, percent));
}

function setMessage(message: string) {
  currentMessage.value = message;
}

function addDetail(detail: string) {
  details.value.push(detail);
  // 自动滚动到底部
  setTimeout(() => {
    const detailsArea = document.querySelector('.details-area');
    if (detailsArea) {
      detailsArea.scrollTop = detailsArea.scrollHeight;
    }
  }, 50);
}

function clearDetails() {
  details.value = [];
}

function complete() {
  progress.value = 100;
  currentMessage.value = '完成！';
}

defineExpose({
  setProgress,
  setMessage,
  addDetail,
  clearDetails,
  complete,
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 自定义滚动条 */
.details-area::-webkit-scrollbar {
  width: 6px;
}

.details-area::-webkit-scrollbar-track {
  background: rgba(30, 30, 30, 0.5);
  border-radius: 3px;
}

.details-area::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.details-area::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}
</style>
