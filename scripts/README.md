# 🚀 自动发布脚本使用说明

## 快速开始

### 方式1：完全自动化（推荐）

**前提条件**：安装 GitHub CLI

#### Windows 安装 GitHub CLI：
```bash
# 使用 winget
winget install --id GitHub.cli

# 或者下载安装包
# https://cli.github.com/
```

#### 安装后登录：
```bash
gh auth login
```

#### 使用自动发布：
```bash
npm run release
```

**就这么简单！** 脚本会自动：
1. ✅ 构建前端代码
2. ✅ 提交到 Git
3. ✅ 创建 Tag
4. ✅ 推送到 GitHub
5. ✅ **自动创建 GitHub Release**

---

### 方式2：半自动化（不安装 GitHub CLI）

如果不想安装 GitHub CLI，运行：
```bash
npm run release
```

脚本会完成前 4 步，然后给你 Release 链接，你手动点一下创建即可。

---

## 📋 发布流程

### 1. 更新版本号

在 `package.json` 和 `manifest.json` 中修改版本号：
```json
{
  "version": "1.5.2"
}
```

### 2. 添加更新日志

在 `manifest.json` 的 `changelog` 中添加：
```json
{
  "changelog": {
    "1.5.2": "你的更新内容"
  }
}
```

### 3. 运行发布命令

```bash
npm run release
```

**完成！** 🎉

---

## 🎯 GitHub CLI 的好处

- ⚡ **一键发布**：无需打开浏览器
- 🤖 **完全自动化**：从构建到发布全自动
- 📝 **自动生成 Release Notes**：从 changelog 读取
- 🚀 **省时省力**：每次发布节省 5 分钟

---

## 💡 建议工作流

1. 开发完成后
2. 修改 `package.json` 和 `manifest.json` 的版本号
3. 更新 `manifest.json` 的 changelog
4. 运行 `npm run release`
5. **喝杯茶** ☕，等待自动发布完成

---

## ❓ 常见问题

### Q: GitHub CLI 安装后找不到命令？
A: 重启终端/PowerShell

### Q: 如何卸载 GitHub CLI？
A: `winget uninstall GitHub.cli`

### Q: 不想用自动化可以吗？
A: 当然可以！继续手动创建 Release 也没问题。

