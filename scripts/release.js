#!/usr/bin/env node

/**
 * 自动发布脚本
 * 功能：自动构建、打包、创建 GitHub Release
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 获取版本号
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const version = packageJson.version;

console.log(`\n🚀 开始发布 v${version}...\n`);

// 读取 changelog
const manifestJson = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
const changelog = manifestJson.changelog[version] || '更新内容请查看 changelog';

try {
  // 1. 构建前端
  console.log('📦 构建前端代码...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Git 提交
  console.log('\n📝 提交代码到 Git...');
  execSync('git add -A', { stdio: 'inherit' });
  try {
    execSync(`git commit -m "🚀 Release v${version}"`, { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️ 没有新的更改需要提交');
  }

  // 3. 创建 tag
  console.log(`\n🏷️ 创建 tag v${version}...`);
  try {
    execSync(`git tag -a v${version} -m "v${version}"`, { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️ Tag 已存在，跳过');
  }

  // 4. 推送到 GitHub
  console.log('\n📤 推送到 GitHub...');
  execSync('git push', { stdio: 'inherit' });
  execSync(`git push origin v${version}`, { stdio: 'inherit' });

  // 5. 使用 GitHub CLI 创建 Release
  console.log('\n📦 创建 GitHub Release...');
  
  const releaseNotes = `## 📋 更新内容\n\n${changelog}\n\n---\n\n### 📥 更新方法\n在 SillyTavern 的 **扩展管理** 中点击 **"立即更新"** 按钮即可。`;
  
  // 检查是否安装了 GitHub CLI
  try {
    execSync('gh --version', { stdio: 'ignore' });
    
    // 创建 Release
    execSync(
      `gh release create v${version} --title "v${version}" --notes "${releaseNotes.replace(/"/g, '\\"')}"`,
      { stdio: 'inherit' }
    );
    
    console.log('\n✅ Release 创建成功！');
  } catch (e) {
    console.log('\n⚠️ 未安装 GitHub CLI (gh)，请手动创建 Release：');
    console.log(`   访问: https://github.com/mzrodyu/maomaomz/releases/new?tag=v${version}`);
    console.log(`\n   Release 说明：\n${releaseNotes}`);
  }

  console.log(`\n🎉 发布完成！版本：v${version}\n`);
  console.log('📖 查看 Release: https://github.com/mzrodyu/maomaomz/releases\n');
  
} catch (error) {
  console.error('\n❌ 发布失败:', error.message);
  process.exit(1);
}

