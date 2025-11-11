import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 创建 Supabase 客户端（使用内置环境变量）
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    // 解析请求
    const { code, apiEndpoint, timestamp } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ valid: false, message: '❌ 授权码不能为空' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取 IP 和地理位置
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const country = req.headers.get('cf-ipcountry') || 'unknown';

    // 清理 API 端点
    let cleanApiEndpoint = 'unknown';
    if (apiEndpoint && typeof apiEndpoint === 'string' && !apiEndpoint.startsWith('[object ')) {
      cleanApiEndpoint = apiEndpoint.trim() || 'unknown';
    }

    // 获取当前有效的授权码
    const { data: configData, error: configError } = await supabase
      .from('auth_config')
      .select('value')
      .eq('key', 'current_code')
      .single();

    if (configError || !configData) {
      return new Response(JSON.stringify({ valid: false, message: '❌ 系统暂未设置授权码' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const currentCode = configData.value;
    const isValid = code.toUpperCase() === currentCode.toUpperCase();

    // 只在失败时记录详细日志
    if (!isValid) {
      await supabase.from('verification_logs').insert({
        code,
        is_valid: false,
        api_endpoint: cleanApiEndpoint,
        ip,
        country,
      });

      // 更新失败统计
      await supabase.rpc('increment_stat', { stat_key: 'failed' });

      return new Response(
        JSON.stringify({
          valid: false,
          message: '❌ 授权码错误或已过期\n\n📢 请前往 Discord 查看今日最新授权码！\n⚠️ 商业化死全家，贩子死全家',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 验证成功：只记录必要数据
    await supabase.rpc('increment_stat', { stat_key: 'success' });

    // 记录 API 端点（用于抓商业化）
    if (cleanApiEndpoint !== 'unknown' && !cleanApiEndpoint.startsWith('[object ')) {
      await supabase
        .from('api_endpoints')
        .upsert(
          { endpoint: cleanApiEndpoint, ip, country, last_seen: new Date().toISOString() },
          { onConflict: 'endpoint', ignoreDuplicates: false },
        );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        message: '✅ 授权验证通过！猫猫欢迎你！🐱',
        code: currentCode,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('验证错误:', error);
    return new Response(JSON.stringify({ valid: false, message: '❌ 服务器错误: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
