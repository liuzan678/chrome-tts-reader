[English](#english) | [中文](#chinese)

<a id="english"></a>

# Chrome TTS Reader

A Manifest V3 Chrome extension that reads selected text or article-like page content aloud with persistent side panel controls.

Chrome TTS Reader is built for reading articles, blogs, and documentation pages with a workflow that stays lightweight: open the side panel, load the current page, listen paragraph by paragraph, and resume where you left off.

## Highlights

- Read selected text from the browser context menu
- Read article-like page content from the side panel
- Keep playback controls available in a persistent side panel
- Jump to the next or previous paragraph
- Pick a custom start position directly on the page
- Change voice and speech rate
- Highlight the active paragraph while reading
- Resume from the last paragraph on the same URL
- Use keyboard shortcuts for common playback actions

## Screenshots

Add screenshots at the following paths to enable the reserved README image references:

- `./docs/images/hero.png`
- `./docs/images/sidepanel.png`
- `./docs/images/highlight.png`

Suggested captures:

- `hero.png`: repository or extension overview
- `sidepanel.png`: side panel controls
- `highlight.png`: active paragraph highlight on the page

## Installation

### Install from Release or Chrome Web Store

Distribution channels are not published yet.

- GitHub Releases: coming soon
- Chrome Web Store: coming soon

Until packaged releases are available, use the source installation flow below.

### Build from Source

#### Requirements

- Chrome 114 or later
- Node.js and npm

#### Steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the extension:

   ```bash
   npm run build
   ```

3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the `dist/` directory.

## Usage

### Read the current page

1. Click the extension action.
2. The side panel opens automatically.
3. Click **Read Current Page**.
4. Use **Play**, **Pause**, **Stop**, **Previous**, and **Next** to control playback.

### Read selected text

1. Select text on a supported page.
2. Right-click the selection.
3. Choose **Read selected text**.

### Pick a custom start position

1. Open the side panel.
2. Click **Pick Start Position**.
3. Click the paragraph where reading should begin.

### Adjust playback

- Choose a voice from the voice selector
- Change reading speed with the rate slider
- Reopen the same page later to continue from the saved paragraph

## Keyboard Shortcuts

| Action | Windows / Linux | macOS |
| --- | --- | --- |
| Toggle play or pause | `Ctrl+Shift+Space` | `Command+Shift+Space` |
| Next paragraph | `Ctrl+Shift+.` | `Command+Shift+.` |
| Previous paragraph | `Ctrl+Shift+,` | `Command+Shift+,` |

## How It Works

Chrome TTS Reader uses a standard Manifest V3 split:

- `background` service worker manages playback state, Chrome TTS integration, shortcuts, and context menu actions
- `content` script extracts readable text, supports start-position picking, and manages in-page highlighting
- `sidepanel` UI provides persistent controls for reading and playback settings
- `shared` modules keep contracts, storage helpers, and text utilities consistent across extension parts

## Project Structure

```text
public/            Static extension assets, including the manifest
src/background/    Service worker and playback orchestration
src/content/       Text extraction, highlight, and start-position picking
src/sidepanel/     Side panel UI and interactions
src/shared/        Shared contracts, storage helpers, and utilities
tests/             Unit tests for playback, extraction, picking, and shared logic
```

## Development

### Commands

- `npm run build` — build the unpacked extension into `dist/`
- `npm run dev` — rebuild on file changes
- `npm test` — run the test suite

### Stack

- TypeScript
- Vite
- Vitest
- Chrome Extensions Manifest V3
- `@mozilla/readability` for article-style extraction support

## Limitations

- Chrome only for now
- Best suited to article, blog, and documentation pages
- Heuristic extraction may be less accurate on highly dynamic or app-like pages
- Restricted pages such as `chrome://` are not supported
- No cloud TTS providers
- No AI summarization, translation, or rewriting

## Roadmap

- Publish packaged releases for easier installation
- Prepare Chrome Web Store distribution
- Improve extraction quality on more complex layouts
- Expand compatibility across a broader range of content-heavy pages

## License

A license file is not included in this repository yet.

If you plan to publish this project publicly on GitHub for reuse or contributions, add a license before wider distribution.

---

<a id="chinese"></a>

# Chrome TTS Reader

一个基于 Manifest V3 的 Chrome 扩展，可朗读选中文本或类文章页面内容，并提供常驻侧边栏控制。

Chrome TTS Reader 主要面向文章、博客和文档页面阅读场景，流程尽量保持轻量：打开侧边栏、加载当前页面、按段落连续朗读，并在下次回到同一页面时继续上次进度。

## 功能亮点

- 通过右键菜单朗读当前选中的文本
- 通过侧边栏朗读当前页面的正文内容
- 使用常驻侧边栏进行播放控制
- 支持上一段 / 下一段跳转
- 支持在页面中直接选择朗读起始段落
- 支持切换语音和调整语速
- 朗读时高亮当前段落
- 按 URL 记录并恢复上次朗读进度
- 提供常用播放快捷键

## 截图

请将截图放到以下路径，以启用 README 中预留的图片引用位置：

- `./docs/images/hero.png`
- `./docs/images/sidepanel.png`
- `./docs/images/highlight.png`

建议对应内容如下：

- `hero.png`：项目或扩展整体展示图
- `sidepanel.png`：侧边栏控制界面
- `highlight.png`：页面内当前段落高亮效果

## 安装

### 通过 Release 或 Chrome Web Store 安装

当前还没有发布正式分发渠道。

- GitHub Releases：即将提供
- Chrome Web Store：即将提供

在正式发布前，请先使用下面的源码安装方式。

### 从源码构建

#### 环境要求

- Chrome 114 或更高版本
- Node.js 和 npm

#### 步骤

1. 安装依赖：

   ```bash
   npm install
   ```

2. 构建扩展：

   ```bash
   npm run build
   ```

3. 在 Chrome 中打开 `chrome://extensions`
4. 打开 **Developer mode（开发者模式）**
5. 点击 **Load unpacked（加载已解压的扩展程序）**
6. 选择 `dist/` 目录

## 使用说明

### 朗读当前页面

1. 点击扩展图标
2. 侧边栏会自动打开
3. 点击 **Read Current Page**
4. 使用 **Play**、**Pause**、**Stop**、**Previous**、**Next** 控制播放

### 朗读选中文本

1. 在支持的网页中选中文本
2. 右键点击选区
3. 选择 **Read selected text**

### 选择自定义起始位置

1. 打开侧边栏
2. 点击 **Pick Start Position**
3. 点击希望开始朗读的段落

### 调整播放设置

- 在语音选择器中切换 voice
- 使用 rate 滑块调整朗读速度
- 之后重新打开同一页面时，可从已保存的段落继续朗读

## 快捷键

| 操作 | Windows / Linux | macOS |
| --- | --- | --- |
| 播放 / 暂停切换 | `Ctrl+Shift+Space` | `Command+Shift+Space` |
| 下一段 | `Ctrl+Shift+.` | `Command+Shift+.` |
| 上一段 | `Ctrl+Shift+,` | `Command+Shift+,` |

## 工作原理

Chrome TTS Reader 采用标准的 Manifest V3 结构：

- `background` service worker 负责播放状态、Chrome TTS 集成、快捷键和右键菜单动作
- `content` script 负责提取可读文本、支持起始段落选择，并处理页面内高亮
- `sidepanel` UI 提供常驻阅读控制和播放设置
- `shared` 模块统一维护消息协议、存储辅助函数和文本工具

## 项目结构

```text
public/            扩展静态资源，包括 manifest
src/background/    Service worker 与播放编排逻辑
src/content/       文本提取、高亮与起始段落选择
src/sidepanel/     侧边栏界面与交互
src/shared/        共享协议、存储辅助函数与工具方法
tests/             播放、提取、选择和共享逻辑相关测试
```

## 开发

### 常用命令

- `npm run build` — 构建可加载的扩展产物到 `dist/`
- `npm run dev` — 监听文件变化并自动重建
- `npm test` — 运行测试

### 技术栈

- TypeScript
- Vite
- Vitest
- Chrome Extensions Manifest V3
- `@mozilla/readability`，用于文章类内容提取支持

## 当前限制

- 当前仅支持 Chrome
- 最适合文章、博客和文档页面
- 基于启发式规则的正文提取，在高度动态或应用型页面上可能不够稳定
- 不支持 `chrome://` 等受限页面
- 不包含云端 TTS 服务集成
- 不包含 AI 摘要、翻译或改写能力

## 路线图

- 发布可直接安装的打包版本
- 准备 Chrome Web Store 分发
- 提升复杂页面布局下的正文提取质量
- 扩展对更多内容型页面的兼容性

## License

当前仓库尚未包含 license 文件。

如果你准备将这个项目公开发布到 GitHub 并接受复用或贡献，建议在更广泛分发前补充 license。