// ===============================================
// 🔍 消息事件监听测试脚本
// ===============================================
// 使用方法：复制到浏览器控制台运行

console.log('%c=================================================', 'color: #4a9eff; font-weight: bold;');
console.log('%c📨 开始测试消息事件监听', 'color: #4a9eff; font-size: 16px; font-weight: bold;');
console.log('%c=================================================', 'color: #4a9eff; font-weight: bold;');

// ===============================================
// 1. 监听所有可能的消息相关事件
// ===============================================

const eventCounter = {
  total: 0,
  byType: {},
};

console.log('\n%c正在注册消息事件监听器...', 'color: #667eea; font-weight: bold;');

// 方式1: jQuery 监听 document 上的所有事件
if (typeof $ !== 'undefined') {
  console.log('✅ 方式1: jQuery $(document) 监听器已注册');

  // 监听可能的消息相关事件名称
  const possibleEvents = [
    'CHARACTER_MESSAGE_RENDERED',
    'USER_MESSAGE_RENDERED',
    'MESSAGE_RECEIVED',
    'MESSAGE_SENT',
    'CHAT_CHANGED',
    'message_rendered',
    'character_message_rendered',
    'user_message_rendered',
    'newMessage',
    'messageAdded',
    'chatUpdated',
  ];

  possibleEvents.forEach(eventName => {
    $(document).on(eventName, function (e, ...args) {
      eventCounter.total++;
      eventCounter.byType[eventName] = (eventCounter.byType[eventName] || 0) + 1;

      console.log('%c🎉 捕获到事件:', 'color: #2ecc71; font-weight: bold;', eventName);
      console.log('- 事件对象:', e);
      console.log('- 附加参数:', args);
      console.log('- 当前计数:', eventCounter);

      window.toastr?.success('捕获到事件: ' + eventName);
    });
  });

  console.log('已注册监听:', possibleEvents.length, '个可能的事件名称');
}

// 方式2: 原生事件监听
console.log('✅ 方式2: 原生 addEventListener 监听器已注册');

const nativeEvents = ['CHARACTER_MESSAGE_RENDERED', 'USER_MESSAGE_RENDERED', 'MESSAGE_RECEIVED', 'CHAT_CHANGED'];

nativeEvents.forEach(eventName => {
  document.addEventListener(eventName, function (e) {
    eventCounter.total++;
    eventCounter.byType[eventName + '_native'] = (eventCounter.byType[eventName + '_native'] || 0) + 1;

    console.log('%c🎉 捕获到原生事件:', 'color: #2ecc71; font-weight: bold;', eventName);
    console.log('- 事件详情:', e.detail);
    console.log('- 当前计数:', eventCounter);

    window.toastr?.success('捕获到原生事件: ' + eventName);
  });
});

// ===============================================
// 2. 监控 DOM 变化
// ===============================================

console.log('\n%c正在启动 DOM 变化监控...', 'color: #667eea; font-weight: bold;');

let messageCount = 0;

const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        // 检查是否是消息节点
        if (node.nodeType === 1) {
          // Element node
          const classList = node.classList || [];
          const classStr = Array.from(classList).join(' ');

          // 检查常见的消息类名
          if (
            classStr.includes('mes') ||
            classStr.includes('message') ||
            classStr.includes('chat') ||
            node.id?.includes('mes') ||
            node.id?.includes('message')
          ) {
            messageCount++;
            console.log('%c📝 检测到新消息节点:', 'color: #e74c3c; font-weight: bold;');
            console.log('- 节点类型:', node.nodeName);
            console.log('- class:', classStr);
            console.log('- id:', node.id);
            console.log('- 消息计数:', messageCount);
            console.log('- 节点:', node);

            window.toastr?.info('检测到新消息节点 #' + messageCount);
          }
        }
      });
    }
  });
});

// 找到聊天容器并开始监控
const chatContainer =
  document.getElementById('chat') ||
  document.querySelector('.mes_block') ||
  document.querySelector('#sheld') ||
  document.body;

if (chatContainer) {
  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
  });
  console.log('✅ DOM 变化监控已启动，监控容器:', chatContainer);
} else {
  console.log('⚠️ 未找到聊天容器，监控整个 body');
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ===============================================
// 3. 提供手动测试函数
// ===============================================

console.log('\n%c提供测试函数:', 'color: #667eea; font-weight: bold;');

// 手动触发测试事件
window.testTriggerEvent = function (eventName) {
  console.log('🧪 手动触发测试事件:', eventName);

  // 尝试 jQuery 触发
  if (typeof $ !== 'undefined') {
    $(document).trigger(eventName, ['测试数据', Date.now()]);
    console.log('✅ jQuery 触发完成');
  }

  // 尝试原生触发
  const event = new CustomEvent(eventName, {
    detail: {
      test: true,
      timestamp: Date.now(),
      message: '这是一个测试事件',
    },
  });
  document.dispatchEvent(event);
  console.log('✅ 原生事件触发完成');

  window.toastr?.info('已触发测试事件: ' + eventName);
};

// 查看事件统计
window.showEventStats = function () {
  console.log('%c📊 事件统计:', 'color: #3498db; font-weight: bold;');
  console.log('总事件数:', eventCounter.total);
  console.log('按类型统计:');
  console.table(eventCounter.byType);
  console.log('消息节点计数:', messageCount);

  if (eventCounter.total === 0 && messageCount === 0) {
    console.log('%c⚠️ 提示: 尚未捕获到任何事件或消息', 'color: #f39c12;');
    console.log('请尝试：');
    console.log('1. 在聊天中发送一条消息');
    console.log('2. 切换到另一个角色/聊天');
    console.log('3. 运行 testTriggerEvent("CHARACTER_MESSAGE_RENDERED") 手动触发测试');
  }

  window.toastr?.info('事件统计: ' + eventCounter.total + ' 个事件, ' + messageCount + ' 个消息节点');
};

// 停止监控
window.stopEventMonitoring = function () {
  observer.disconnect();
  console.log('✅ DOM 监控已停止');
  window.toastr?.success('监控已停止');
};

console.log('✅ testTriggerEvent(eventName) - 手动触发测试事件');
console.log('✅ showEventStats() - 查看事件统计');
console.log('✅ stopEventMonitoring() - 停止 DOM 监控');

// ===============================================
// 4. 自动测试
// ===============================================

console.log('\n%c正在运行自动测试...', 'color: #667eea; font-weight: bold;');

setTimeout(() => {
  console.log('\n%c⏱️ 5秒测试完成', 'color: #f39c12; font-weight: bold;');
  window.showEventStats();

  console.log('\n%c📋 下一步操作:', 'color: #e74c3c; font-weight: bold;');
  console.log('1. 在聊天中发送一条消息');
  console.log('2. 观察控制台是否捕获到事件');
  console.log('3. 运行 showEventStats() 查看统计');
  console.log('4. 将控制台输出截图或复制给我');
}, 5000);

console.log('\n%c⏳ 监控已启动，请在聊天中发送消息进行测试...', 'color: #2ecc71; font-weight: bold;');
console.log('⏳ 将在 5 秒后显示初步统计...');
