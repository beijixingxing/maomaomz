# Supabase 部署指南

## 📋 前置要求

1. 已在 https://supabase.com/ 注册账号
2. 已创建项目并记录了 API 密钥

## 🚀 部署步骤

### 1. 在 Supabase 网页端执行 SQL

登录 Supabase Dashboard → 点击 **SQL Editor** → 执行以下文件的 SQL：

1. 先执行主表创建（在网页 SQL Editor 中）
2. 再执行 `supabase/migrations/increment_stat.sql`

### 2. 部署 Edge Function

#### 方式1：使用 Supabase CLI（推荐）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 关联项目
supabase link --project-ref your-project-ref

# 部署函数
supabase functions deploy verify
```

#### 方式2：手动部署（简单）

1. 在 Supabase Dashboard 点击 **Edge Functions**
2. 点击 **Create a new function**
3. 函数名：`verify`
4. 把 `supabase/functions/verify/index.ts` 的内容复制粘贴进去
5. 点击 **Deploy**

### 3. 设置环境变量

在 Edge Functions 设置中添加：

- `SUPABASE_URL`: 你的项目 URL
- `SUPABASE_SERVICE_ROLE_KEY`: 服务端密钥

### 4. 测试 API

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"code":"MEOW-20251112-BVXC","apiEndpoint":"test","timestamp":"2025-11-12T00:00:00Z"}'
```

## 📝 获取 API 端点

部署成功后，你的验证 API 地址为：
```
https://your-project-ref.supabase.co/functions/v1/verify
```

把这个地址更新到前端的 `src/记忆_with_worldbook/auth.ts` 文件中的 `AUTH_API_URL` 常量。

## ✅ 完成！

部署完成后，你的授权系统就迁移到 Supabase 了！

