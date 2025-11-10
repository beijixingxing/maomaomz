// ===============================================
// 🔍 事件系统诊断脚本 - 找出正确的事件监听方式
// ===============================================
// 使用方法：复制到浏览器控制台运行

console.log('%c=================================================', 'color: #4a9eff; font-weight: bold;');
console.log('%c🔍 开始诊断事件系统', 'color: #4a9eff; font-size: 16px; font-weight: bold;');
console.log('%c=================================================', 'color: #4a9eff; font-weight: bold;');

// ===============================================
// 1. 检查全局对象
// ===============================================
console.log('\n%c【1. 全局对象检查】', 'color: #667eea; font-weight: bold;');

const globalChecks = {
  SillyTavern: typeof SillyTavern !== 'undefined',
  TavernHelper: typeof TavernHelper !== 'undefined',
  'window.TavernHelper': typeof window.TavernHelper !== 'undefined',
  eventOn: typeof eventOn !== 'undefined',
  'window.eventOn': typeof window.eventOn !== 'undefined',
  tavern_events: typeof tavern_events !== 'undefined',
  'window.tavern_events': typeof window.tavern_events !== 'undefined',
  eventSource: typeof eventSource !== 'undefined',
  'window.eventSource': typeof window.eventSource !== 'undefined',
};

console.table(globalChecks);

// ===============================================
// 2. 检查 SillyTavern 对象的结构
// ===============================================
console.log('\n%c【2. SillyTavern 对象】', 'color: #667eea; font-weight: bold;');

if (typeof SillyTavern !== 'undefined') {
  const stProperties = Object.keys(SillyTavern);
  console.log('SillyTavern 的所有属性 (共 ' + stProperties.length + ' 个):');
  console.log(stProperties);

  // 检查事件相关的属性
  const eventRelated = stProperties.filter(
    key =>
      key.toLowerCase().includes('event') || key.toLowerCase().includes('on') || key.toLowerCase().includes('listener'),
  );

  console.log('\n事件相关的属性:');
  console.table(
    eventRelated.map(key => ({
      属性名: key,
      类型: typeof SillyTavern[key],
      值预览: String(SillyTavern[key]).substring(0, 100),
    })),
  );

  // 详细检查几个重要的属性
  console.log('\n关键属性详情:');
  console.log('- SillyTavern.eventSource:', SillyTavern.eventSource);
  console.log('- SillyTavern.eventTypes:', SillyTavern.eventTypes);
  console.log('- SillyTavern.getContext:', typeof SillyTavern.getContext);

  if (typeof SillyTavern.getContext === 'function') {
    try {
      const context = SillyTavern.getContext();
      console.log('- SillyTavern.getContext():', context);
    } catch (e) {
      console.log('- SillyTavern.getContext() 调用失败:', e.message);
    }
  }
} else {
  console.log('❌ SillyTavern 不存在');
}

// ===============================================
// 3. 检查 TavernHelper 对象的结构
// ===============================================
console.log('\n%c【3. TavernHelper 对象】', 'color: #667eea; font-weight: bold;');

if (typeof TavernHelper !== 'undefined' || typeof window.TavernHelper !== 'undefined') {
  const th = TavernHelper || window.TavernHelper;
  const thProperties = Object.keys(th);
  console.log('TavernHelper 的所有属性 (共 ' + thProperties.length + ' 个):');
  console.log(thProperties);

  // 检查事件相关的方法
  const eventMethods = thProperties.filter(
    key =>
      key.toLowerCase().includes('event') || key.toLowerCase().includes('on') || key.toLowerCase().includes('listener'),
  );

  console.log('\n事件相关的方法:');
  console.table(
    eventMethods.map(key => ({
      方法名: key,
      类型: typeof th[key],
      是否函数: typeof th[key] === 'function',
    })),
  );
} else {
  console.log('❌ TavernHelper 不存在');
}

// ===============================================
// 4. 搜索 window 对象上所有包含 'event' 的属性
// ===============================================
console.log('\n%c【4. window 对象上的事件相关属性】', 'color: #667eea; font-weight: bold;');

const windowEventProps = [];
for (const key in window) {
  if (key.toLowerCase().includes('event') || key.toLowerCase().includes('on')) {
    windowEventProps.push({
      属性名: key,
      类型: typeof window[key],
      是否函数: typeof window[key] === 'function',
    });
  }
}

console.log('找到 ' + windowEventProps.length + ' 个事件相关的属性:');
console.table(windowEventProps.slice(0, 20)); // 只显示前20个

// ===============================================
// 5. 检查 jQuery 事件系统
// ===============================================
console.log('\n%c【5. jQuery 事件系统】', 'color: #667eea; font-weight: bold;');

if (typeof $ !== 'undefined') {
  console.log('✅ jQuery 可用');

  // 检查 document 上的事件
  const $doc = $(document);
  console.log('$(document) 对象:', $doc);

  // 尝试查看是否有自定义事件
  try {
    const events = $._data(document, 'events');
    if (events) {
      console.log('document 上注册的事件类型:', Object.keys(events));
      console.log('详细事件信息:', events);
    } else {
      console.log('document 上没有使用 $._data 注册的事件');
    }
  } catch (e) {
    console.log('无法访问 jQuery 事件数据:', e.message);
  }
} else {
  console.log('❌ jQuery 不可用');
}

// ===============================================
// 6. 测试可能的事件触发方式
// ===============================================
console.log('\n%c【6. 测试事件监听方式】', 'color: #667eea; font-weight: bold;');

// 测试函数
window.testEventListener = (methodName, testCode) => {
  console.log(`\n测试: ${methodName}`);
  try {
    eval(testCode);
    console.log(`✅ ${methodName} 可以执行`);
    return true;
  } catch (e) {
    console.log(`❌ ${methodName} 失败:`, e.message);
    return false;
  }
};

// 测试各种可能的事件监听方式
const testResults = {};

// 方式1: eventOn + tavern_events
testResults['eventOn + tavern_events'] = window.testEventListener(
  'eventOn + tavern_events',
  `
  if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined') {
    console.log('tavern_events:', tavern_events);
    console.log('tavern_events.CHARACTER_MESSAGE_RENDERED:', tavern_events.CHARACTER_MESSAGE_RENDERED);
  } else {
    throw new Error('eventOn 或 tavern_events 不可用');
  }
  `,
);

// 方式2: TavernHelper.eventOn
testResults['TavernHelper.eventOn'] = window.testEventListener(
  'TavernHelper.eventOn',
  `
  if (typeof TavernHelper !== 'undefined' && typeof TavernHelper.eventOn === 'function') {
    console.log('TavernHelper.eventOn 存在');
  } else {
    throw new Error('TavernHelper.eventOn 不可用');
  }
  `,
);

// 方式3: SillyTavern.eventSource
testResults['SillyTavern.eventSource'] = window.testEventListener(
  'SillyTavern.eventSource',
  `
  if (typeof SillyTavern !== 'undefined' && SillyTavern.eventSource) {
    console.log('SillyTavern.eventSource:', SillyTavern.eventSource);
    console.log('SillyTavern.eventSource.on:', typeof SillyTavern.eventSource.on);
    console.log('SillyTavern.eventTypes:', SillyTavern.eventTypes);
  } else {
    throw new Error('SillyTavern.eventSource 不可用');
  }
  `,
);

// 方式4: jQuery 自定义事件
testResults['jQuery $(document).on'] = window.testEventListener(
  'jQuery $(document).on',
  `
  if (typeof $ !== 'undefined') {
    console.log('jQuery 可用，可以使用 $(document).on() 监听自定义事件');
  } else {
    throw new Error('jQuery 不可用');
  }
  `,
);

// 方式5: addEventListener
testResults['document.addEventListener'] = window.testEventListener(
  'document.addEventListener',
  `
  if (typeof document.addEventListener === 'function') {
    console.log('document.addEventListener 可用');
  } else {
    throw new Error('document.addEventListener 不可用');
  }
  `,
);

console.log('\n%c【测试结果汇总】', 'color: #667eea; font-weight: bold;');
console.table(testResults);

// ===============================================
// 7. 尝试注册一个测试监听器
// ===============================================
console.log('\n%c【7. 注册测试监听器】', 'color: #667eea; font-weight: bold;');

console.log('正在尝试各种方式注册测试监听器...');

let successCount = 0;

// 尝试1: jQuery 自定义事件
try {
  $(document).on('test_event_maomaomz', function (e, data) {
    console.log('✅ jQuery 自定义事件触发成功！数据:', data);
  });
  console.log('✅ 已通过 jQuery 注册测试监听器');

  // 测试触发
  setTimeout(() => {
    $(document).trigger('test_event_maomaomz', ['测试数据']);
  }, 1000);

  successCount++;
} catch (e) {
  console.log('❌ jQuery 注册失败:', e.message);
}

// 尝试2: addEventListener
try {
  document.addEventListener('test_event_native_maomaomz', function (e) {
    console.log('✅ 原生事件监听器触发成功！数据:', e.detail);
  });
  console.log('✅ 已通过 addEventListener 注册测试监听器');

  // 测试触发
  setTimeout(() => {
    const event = new CustomEvent('test_event_native_maomaomz', { detail: '测试数据' });
    document.dispatchEvent(event);
  }, 1500);

  successCount++;
} catch (e) {
  console.log('❌ addEventListener 注册失败:', e.message);
}

console.log(`\n✅ 成功注册了 ${successCount} 个测试监听器`);
console.log('⏳ 将在 1-2 秒后自动触发测试事件，请等待...');

// ===============================================
// 8. 生成诊断报告
// ===============================================
setTimeout(() => {
  console.log('\n%c=================================================', 'color: #4a9eff; font-weight: bold;');
  console.log('%c📊 诊断报告', 'color: #4a9eff; font-size: 16px; font-weight: bold;');
  console.log('%c=================================================', 'color: #4a9eff; font-weight: bold;');

  const report = {
    环境类型: '',
    推荐的事件监听方式: '',
    可用的API: [],
  };

  if (testResults['SillyTavern.eventSource']) {
    report.环境类型 = 'SillyTavern 插件环境';
    report.推荐的事件监听方式 = 'SillyTavern.eventSource.on(SillyTavern.eventTypes.XXX, callback)';
    report.可用的API.push('SillyTavern.eventSource');
  } else if (testResults['eventOn + tavern_events']) {
    report.环境类型 = 'TavernHelper 脚本环境（完整）';
    report.推荐的事件监听方式 = 'eventOn(tavern_events.XXX, callback)';
    report.可用的API.push('eventOn', 'tavern_events');
  } else if (testResults['TavernHelper.eventOn']) {
    report.环境类型 = 'TavernHelper 脚本环境（部分）';
    report.推荐的事件监听方式 = 'TavernHelper.eventOn(event_name, callback)';
    report.可用的API.push('TavernHelper.eventOn');
  } else if (testResults['jQuery $(document).on']) {
    report.环境类型 = '混合环境（仅 jQuery）';
    report.推荐的事件监听方式 = '$(document).on("custom_event", callback) - 需要找到酒馆触发的自定义事件名称';
    report.可用的API.push('jQuery');
  } else {
    report.环境类型 = '未知环境';
    report.推荐的事件监听方式 = '需要进一步调查';
  }

  console.log('\n环境类型:', report.环境类型);
  console.log('推荐的事件监听方式:', report.推荐的事件监听方式);
  console.log('可用的API:', report.可用的API);

  console.log('\n%c下一步操作：', 'color: #f39c12; font-weight: bold;');
  console.log('1. 请将以上完整的控制台输出截图或复制给我');
  console.log('2. 特别注意【2. SillyTavern 对象】和【3. TavernHelper 对象】的内容');
  console.log('3. 如果测试事件触发成功，说明该方式可用');

  console.log('\n%c=================================================', 'color: #4a9eff; font-weight: bold;');
}, 3000);
