-- 创建递增统计的函数
CREATE OR REPLACE FUNCTION increment_stat(stat_key TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO stats (key, count)
  VALUES (stat_key, 1)
  ON CONFLICT (key)
  DO UPDATE SET count = stats.count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

