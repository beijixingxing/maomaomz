/**
 * 内容预处理工具 - 过滤敏感信息避免触发 AI 安全机制
 */

/**
 * 替换内容中的未成年年龄信息
 * 将 18 岁以下的年龄替换为安全表述，避免触发 Gemini 等模型的安全拒绝
 */
export function sanitizeAgeContent(content: string): string {
  if (!content) return content;

  let result = content;

  // 中文年龄表述：X岁（X < 18）
  // 匹配：1-17岁、01-17岁
  result = result.replace(/\b([1-9]|1[0-7])\s*岁/g, '年轻');
  result = result.replace(/\b0([1-9]|1[0-7])\s*岁/g, '年轻');

  // 英文年龄表述：X years old, X-year-old, age X
  result = result.replace(/\b([1-9]|1[0-7])\s*years?\s*old\b/gi, 'young');
  result = result.replace(/\b([1-9]|1[0-7])-year-old\b/gi, 'young');
  result = result.replace(/\bage\s*([1-9]|1[0-7])\b/gi, 'young age');

  // 特定词汇替换
  const sensitiveTerms: [RegExp, string][] = [
    // 中文
    [/未成年/g, '年轻人'],
    [/小孩子?/g, '年轻人'],
    [/小朋友/g, '年轻人'],
    [/小学生/g, '学生'],
    [/初中生/g, '学生'],
    [/中学生/g, '学生'],
    [/高中生/g, '学生'],
    [/幼女/g, '少女'],
    [/幼童/g, '年轻人'],
    [/儿童/g, '年轻人'],
    [/少年/g, '年轻人'],
    [/萝莉/g, '少女'],
    [/正太/g, '少年'],
    // 英文
    [/\bminor[s]?\b/gi, 'young person'],
    [/\bchild(ren)?\b/gi, 'young person'],
    [/\bkid[s]?\b/gi, 'young person'],
    [/\bteen(ager)?[s]?\b/gi, 'young person'],
    [/\bunder\s*age[d]?\b/gi, 'young'],
    [/\bloli\b/gi, 'young girl'],
    [/\bshota\b/gi, 'young boy'],
  ];

  for (const [pattern, replacement] of sensitiveTerms) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 检查内容是否包含可能触发安全机制的关键词
 */
export function containsSensitiveContent(content: string): boolean {
  if (!content) return false;

  const sensitivePatterns = [
    /\b([1-9]|1[0-7])\s*岁/,
    /\b([1-9]|1[0-7])\s*years?\s*old\b/i,
    /未成年/,
    /\bminor[s]?\b/i,
    /\bchild(ren)?\b/i,
    /幼女|幼童|萝莉|正太/,
    /\bloli\b/i,
    /\bshota\b/i,
  ];

  return sensitivePatterns.some(pattern => pattern.test(content));
}

/**
 * 预处理发送给 AI 的内容
 * @param content 原始内容
 * @param enableFilter 是否启用过滤（可由设置控制）
 */
export function preprocessContent(content: string, enableFilter = true): string {
  if (!enableFilter) return content;
  return sanitizeAgeContent(content);
}
