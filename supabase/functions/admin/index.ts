import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 简单的管理员密码（可以在环境变量中设置）
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'maomaomz2025';

// HTML 管理页面
function getAdminHTML() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>猫猫授权系统 - 后端管理 (Supabase)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      text-align: center;
      color: white;
      margin-bottom: 30px;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .card h2 {
      color: #667eea;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-box .number {
      font-size: 2.5em;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-box .label { font-size: 0.9em; opacity: 0.9; }
    input, button {
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 16px;
      margin: 5px;
    }
    input { width: calc(100% - 10px); }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: translateY(-2px); }
    button:active { transform: translateY(0); }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f8f9fa;
      color: #667eea;
      font-weight: 600;
    }
    tr:hover { background: #f8f9fa; }
    .success { color: #28a745; font-weight: bold; }
    .failed { color: #dc3545; font-weight: bold; }
    .loading {
      text-align: center;
      padding: 20px;
      color: #999;
    }
    .timestamp { color: #999; font-size: 0.9em; }
    #loginModal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    #loginModal .modal-content {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      text-align: center;
    }
    #loginModal h2 {
      color: #667eea;
      margin-bottom: 20px;
    }
    #loginModal input {
      width: 300px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <!-- 登录模态框 -->
  <div id="loginModal">
    <div class="modal-content">
      <h2>🔐 管理员登录</h2>
      <input type="password" id="passwordInput" placeholder="请输入管理员密码" />
      <br>
      <button onclick="login()">登录</button>
    </div>
  </div>

  <div class="container" id="mainContent" style="display:none;">
    <h1>🐱 猫猫授权系统 - 后端管理 (Supabase)</h1>

    <!-- 统计数据 -->
    <div class="card">
      <h2>📊 授权统计</h2>
      <div class="stats-grid" id="statsGrid">
        <div class="loading">加载中...</div>
      </div>
    </div>

    <!-- 授权码管理 -->
    <div class="card">
      <h2>🔑 授权码管理</h2>
      <div>
        <label>当前授权码: <strong id="currentCode">加载中...</strong></label>
        <br><br>
        <input type="text" id="newCodeInput" placeholder="输入新的授权码 (如: MEOW-20251112-XXXX)" />
        <button onclick="updateCode()">更新授权码</button>
      </div>
    </div>

    <!-- 验证日志 -->
    <div class="card">
      <h2>📝 最近验证日志 (最新 50 条)</h2>
      <div id="logsTable">
        <div class="loading">加载中...</div>
      </div>
    </div>

    <!-- API 端点监控 -->
    <div class="card">
      <h2>🌐 API 端点监控</h2>
      <div id="endpointsTable">
        <div class="loading">加载中...</div>
      </div>
    </div>
  </div>

  <script>
    // Supabase anon key（这是公开的，前端可见）
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGFpZ2JxcHdrbWJkb3Ztd2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODQ3OTIsImV4cCI6MjA3ODQ2MDc5Mn0.psf0ZCXCAKc7PDFZhlMB0Q0mX55w1N1X50MAY6PuUxw';

    let adminPassword = '';

    // 登录
    function login() {
      const password = document.getElementById('passwordInput').value;
      if (!password) {
        alert('请输入密码');
        return;
      }
      adminPassword = password;

      // 验证密码
      fetch('/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ password })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          document.getElementById('loginModal').style.display = 'none';
          document.getElementById('mainContent').style.display = 'block';
          loadStats();
          loadCurrentCode();
          loadLogs();
          loadEndpoints();
        } else {
          alert('❌ 密码错误');
          document.getElementById('passwordInput').value = '';
        }
      })
      .catch(err => {
        alert('❌ 登录失败: ' + err.message);
      });
    }

    // 在所有请求中添加密码和 Supabase 授权头
    async function authFetch(url, options = {}) {
      options.headers = options.headers || {};
      options.headers['X-Admin-Password'] = adminPassword;
      options.headers['Authorization'] = 'Bearer ' + SUPABASE_ANON_KEY;
      return fetch(url, options);
    }

    // 加载统计数据
    async function loadStats() {
      try {
        const res = await authFetch('/stats');
        const data = await res.json();

        const total = data.success + data.failed;
        const successRate = total > 0 ? ((data.success / total) * 100).toFixed(1) : 0;

        document.getElementById('statsGrid').innerHTML = \`
          <div class="stat-box">
            <div class="label">成功验证</div>
            <div class="number">\${data.success}</div>
          </div>
          <div class="stat-box">
            <div class="label">失败验证</div>
            <div class="number">\${data.failed}</div>
          </div>
          <div class="stat-box">
            <div class="label">总验证次数</div>
            <div class="number">\${total}</div>
          </div>
          <div class="stat-box">
            <div class="label">成功率</div>
            <div class="number">\${successRate}%</div>
          </div>
        \`;
      } catch (error) {
        document.getElementById('statsGrid').innerHTML = '<div class="loading">加载失败</div>';
      }
    }

    // 加载当前授权码
    async function loadCurrentCode() {
      try {
        const res = await authFetch('/current-code');
        const data = await res.json();
        document.getElementById('currentCode').textContent = data.code;
      } catch (error) {
        document.getElementById('currentCode').textContent = '加载失败';
      }
    }

    // 更新授权码
    async function updateCode() {
      const newCode = document.getElementById('newCodeInput').value.trim().toUpperCase();
      if (!newCode) {
        alert('请输入新的授权码');
        return;
      }

      if (!confirm(\`确定要将授权码更新为: \${newCode}?\`)) {
        return;
      }

      try {
        const res = await authFetch('/update-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: newCode })
        });
        const data = await res.json();

        if (data.success) {
          alert('✅ 授权码更新成功！');
          loadCurrentCode();
          document.getElementById('newCodeInput').value = '';
        } else {
          alert('❌ 更新失败: ' + data.message);
        }
      } catch (error) {
        alert('❌ 更新失败: ' + error.message);
      }
    }

    // 加载验证日志
    async function loadLogs() {
      try {
        const res = await authFetch('/logs');
        const logs = await res.json();

        if (logs.length === 0) {
          document.getElementById('logsTable').innerHTML = '<div class="loading">暂无日志</div>';
          return;
        }

        let html = '<table><thead><tr><th>时间</th><th>授权码</th><th>结果</th><th>API端点</th><th>IP</th><th>国家</th></tr></thead><tbody>';

        logs.forEach(log => {
          const time = new Date(log.created_at).toLocaleString('zh-CN');
          const status = log.is_valid ?
            '<span class="success">✅ 成功</span>' :
            '<span class="failed">❌ 失败</span>';

          html += \`<tr>
            <td class="timestamp">\${time}</td>
            <td><code>\${log.code}</code></td>
            <td>\${status}</td>
            <td>\${log.api_endpoint || '-'}</td>
            <td>\${log.ip || '-'}</td>
            <td>\${log.country || '-'}</td>
          </tr>\`;
        });

        html += '</tbody></table>';
        document.getElementById('logsTable').innerHTML = html;
      } catch (error) {
        document.getElementById('logsTable').innerHTML = '<div class="loading">加载失败</div>';
      }
    }

    // 加载 API 端点
    async function loadEndpoints() {
      try {
        const res = await authFetch('/endpoints');
        const endpoints = await res.json();

        if (endpoints.length === 0) {
          document.getElementById('endpointsTable').innerHTML = '<div class="loading">暂无记录</div>';
          return;
        }

        let html = '<table><thead><tr><th>API端点</th><th>IP</th><th>国家</th><th>最后访问时间</th></tr></thead><tbody>';

        endpoints.forEach(ep => {
          const time = new Date(ep.last_seen).toLocaleString('zh-CN');

          html += \`<tr>
            <td><strong>\${ep.endpoint}</strong></td>
            <td>\${ep.ip || '-'}</td>
            <td>\${ep.country || '-'}</td>
            <td class="timestamp">\${time}</td>
          </tr>\`;
        });

        html += '</tbody></table>';
        document.getElementById('endpointsTable').innerHTML = html;
      } catch (error) {
        document.getElementById('endpointsTable').innerHTML = '<div class="loading">加载失败</div>';
      }
    }

    // 回车键登录
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        login();
      }
    });

    // 每 30 秒自动刷新
    setInterval(() => {
      if (adminPassword && document.getElementById('mainContent').style.display !== 'none') {
        loadStats();
        loadLogs();
        loadEndpoints();
      }
    }, 30000);
  </script>
</body>
</html>
  `;
}

// 验证管理员密码
function verifyAdminPassword(req: Request): boolean {
  const password = req.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const url = new URL(req.url);
    const path = url.pathname;

    // 主页面（不需要验证）- 但检查是否有 anon key
    if (path === '/admin' || path === '/' || path.startsWith('/functions/v1/admin')) {
      return new Response(getAdminHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 验证密码接口（不需要密码）
    if (path === '/verify-password' && req.method === 'POST') {
      const { password } = await req.json();
      const isValid = password === ADMIN_PASSWORD;

      return new Response(JSON.stringify({ success: isValid }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 其他所有接口都需要密码验证
    if (!verifyAdminPassword(req)) {
      return new Response(JSON.stringify({ error: '未授权访问' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取统计数据
    if (path === '/stats') {
      const { data, error } = await supabase.from('stats').select('*');

      if (error) throw error;

      const stats = {
        success: data.find(s => s.key === 'success')?.count || 0,
        failed: data.find(s => s.key === 'failed')?.count || 0,
      };

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取当前授权码
    if (path === '/current-code') {
      const { data, error } = await supabase.from('auth_config').select('value').eq('key', 'current_code').single();

      if (error) throw error;

      return new Response(JSON.stringify({ code: data.value }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 更新授权码
    if (path === '/update-code' && req.method === 'POST') {
      const { code } = await req.json();

      if (!code) {
        return new Response(JSON.stringify({ success: false, message: '授权码不能为空' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('auth_config')
        .update({ value: code.toUpperCase(), updated_at: new Date().toISOString() })
        .eq('key', 'current_code');

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: '授权码更新成功' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取验证日志
    if (path === '/logs') {
      const { data, error } = await supabase
        .from('verification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取 API 端点
    if (path === '/endpoints') {
      const { data, error } = await supabase
        .from('api_endpoints')
        .select('*')
        .order('last_seen', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error('管理页面错误:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
