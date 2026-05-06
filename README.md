## WATransChat 官方网站（静态版）

本项目是 **WATransChat** 的静态官网页面，用于在 GitHub Pages 上展示产品功能与多平台下载链接。

### 官网访问

在浏览器中打开以下地址即可访问官网（可直接点击）：

- [https://zla5.github.io](https://zla5.github.io)

### 产品介绍

**WATransChat** 是一款面向跨语言沟通场景的 WhatsApp 翻译辅助工具，帮助用户在聊天中更高效地理解与回复不同语言的信息。  
产品聚焦“即用、轻量、稳定”的体验，适合外贸沟通、海外客户服务、跨国团队协作，以及个人日常国际交流使用。

核心能力包括：

- 多语言互译：支持常见语言之间快速翻译，降低沟通门槛。
- 聊天场景优化：围绕 WhatsApp 对话流程设计，减少切换应用的操作成本。
- 响应速度快：兼顾翻译质量与速度，帮助用户保持对话节奏。
- 使用门槛低：安装与上手简单，适合非技术用户快速使用。

### 目录结构

- `index.html`：主页（产品介绍 / 下载链接 / 安装指南 / FAQ）
- `styles.css`：页面样式
- `script.js`：页面交互（平滑滚动、年份自动更新等）

### 本地预览

1. 将整个文件夹上传或克隆到你的电脑。
2. 直接双击打开 `index.html`，使用浏览器查看页面即可。

### 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，例如：`watraschcat-site`（名称任意）。
2. 将本目录下所有文件推送到该仓库的 **main** 分支根目录。
3. 在 GitHub 仓库页面中打开：
   - `Settings` → `Pages`
   - 在 **Source** 处选择：`Deploy from a branch`
   - Branch 选择：`main` / `/ (root)`
4. 保存后等待 1–3 分钟，GitHub 会生成一个访问地址，例如：
   - `https://你的用户名.github.io/watraschcat-site`

之后每次修改 `index.html` / `styles.css` / `script.js` 并推送到同一分支，GitHub Pages 就会自动更新网站内容。


