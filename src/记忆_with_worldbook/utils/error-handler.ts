/**
 * 🚨 错误处理工具 - 将技术错误翻译成用户友好的中文提示
 */

/**
 * 常见错误码对应的中文提示
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误，请检查输入内容',
  401: 'API 密钥无效或已过期，请检查设置',
  403: 'API 访问被拒绝，可能是密钥权限不足',
  404: 'API 接口不存在，请检查端点地址',
  429: '请求太频繁，请稍后再试（API 限流）',
  500: 'API 服务器内部错误，请稍后重试',
  502: 'API 网关错误，服务暂时不可用',
  503: 'API 服务暂时不可用，请稍后重试',
  504: 'API 请求超时，请检查网络或稍后重试',
};

/**
 * 常见错误文本对应的中文提示
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /failed to fetch/i, message: '网络连接失败，请检查网络或 API 地址' },
  { pattern: /network\s*(error|failed)/i, message: '网络错误，请检查网络连接' },
  { pattern: /timeout|timed?\s*out/i, message: '请求超时，请检查网络或稍后重试' },
  { pattern: /cors|cross.origin/i, message: '跨域请求被阻止，请启用"使用酒馆 API"选项' },
  { pattern: /json/i, message: 'AI 返回格式错误，请重试' },
  { pattern: /api[_\s]?key|apikey|authorization/i, message: 'API 密钥问题，请检查设置' },
  { pattern: /rate\s*limit/i, message: 'API 请求限流，请稍后再试' },
  { pattern: /quota|exceeded/i, message: 'API 配额已用完，请检查账户余额' },
  { pattern: /invalid.*model/i, message: '模型名称无效，请检查模型设置' },
  { pattern: /context.*length|too.*long/i, message: '输入内容太长，请减少文字' },
  { pattern: /empty|空/i, message: 'AI 返回了空内容，请重试' },
];

/**
 * 将 API 错误转换为用户友好的中文提示
 * @param error 原始错误（可以是 Error、Response 或字符串）
 * @param context 错误发生的上下文（如"生成世界书"）
 * @returns 用户友好的错误信息
 */
export function translateError(error: unknown, context?: string): string {
  const prefix = context ? `${context}失败：` : '操作失败：';

  // 处理 Response 对象
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    if (ERROR_MESSAGES[status]) {
      return prefix + ERROR_MESSAGES[status];
    }
  }

  // 获取错误文本
  let errorText = '';
  if (error instanceof Error) {
    errorText = error.message;
  } else if (typeof error === 'string') {
    errorText = error;
  } else {
    errorText = String(error);
  }

  // 尝试匹配已知错误模式
  for (const { pattern, message } of ERROR_PATTERNS) {
    if (pattern.test(errorText)) {
      return prefix + message;
    }
  }

  // 如果错误信息本身就是中文且较短，直接使用
  if (/[\u4e00-\u9fa5]/.test(errorText) && errorText.length < 100) {
    return prefix + errorText;
  }

  // 截断过长的错误信息
  if (errorText.length > 100) {
    errorText = errorText.substring(0, 100) + '...';
  }

  // 默认返回原始错误
  return prefix + (errorText || '未知错误，请查看控制台');
}

/**
 * 处理 API 响应错误
 * @param response Fetch Response 对象
 * @param context 错误上下文
 * @returns 永远抛出错误（用于 throw）
 */
export async function handleApiResponseError(response: Response, context?: string): Promise<never> {
  const prefix = context ? `${context}失败：` : '';

  // 尝试获取响应体
  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    // 忽略
  }

  // 根据状态码生成提示
  const statusMessage = ERROR_MESSAGES[response.status];
  if (statusMessage) {
    console.error(`❌ API 错误 [${response.status}]:`, bodyText);
    throw new Error(prefix + statusMessage);
  }

  // 尝试从响应体中提取错误信息
  if (bodyText) {
    try {
      const json = JSON.parse(bodyText);
      const errorMsg = json.error?.message || json.message || json.error;
      if (errorMsg) {
        throw new Error(prefix + translateError(errorMsg));
      }
    } catch {
      // 不是 JSON，使用原始文本
      if (bodyText.length < 200) {
        throw new Error(prefix + bodyText);
      }
    }
  }

  throw new Error(prefix + `请求失败 (${response.status})`);
}
