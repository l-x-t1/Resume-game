# 李湘婷 · 交互式个人简历网站

一个兼具**视觉设计感、轻量游戏化交互和技术作品集展示能力**的 Creative Developer Portfolio。

展示大模型应用开发（Agent 系统 / RAG）与 Java 后端项目经验，内置三个可动手操作的技术互动模块。

> 技术栈：HTML + CSS + Vanilla JavaScript，**零依赖、零构建**。

---

## 快速开始

**方式一：直接打开**

双击 `index.html` 即可在浏览器中打开（无需服务器）。

**方式二：本地服务器（推荐）**

```bash
# Python
python -m http.server 8642

# 或 Node.js
npx serve .
```

然后访问 `http://localhost:8642/`。

> 部署到 GitHub Pages / Vercel / Netlify 时，直接上传整个文件夹即可，无需任何构建步骤。

---

## 目录结构

```
jianligame/
├── index.html            # 页面入口（单页滚动式，7 大区域）
├── css/
│   └── style.css         # 全站视觉样式（设计变量在文件顶部 :root）
├── js/
│   ├── data.js           # ★ 内容数据层：所有简历内容集中在这里
│   ├── main.js           # 全局交互：导航、滚动动画、视差、About/Skills 渲染
│   ├── projects.js       # 项目卡片渲染、可点击流程图、项目详情侧边面板
│   └── lab.js            # Interactive Lab 三个互动模块
└── assets/
    └── 李湘婷_大模型应用开发实习生_简历.pdf   # View Resume 按钮的入口文件
```

**数据与展示分离**：页面内容（个人信息、技能、项目、流程图节点文案）全部集中在 `js/data.js`，改内容只需要改这一个文件，`index.html` 与渲染脚本一般不用动。

---

## 页面区域

| 区域 | 内容与交互 |
|---|---|
| **Hero** | 大字号标题、OPEN TO INTERNSHIP 动态徽章、鼠标视差几何装饰、平滑滚动按钮、简历查看入口 |
| **About** | 个人档案卡（PROFILE）+ CURRENT FOCUS / FAVORITE STACK / BUILDING 信息卡 |
| **Skills** | 4 张技术分类卡、30 个技术标签全部可点击——弹出「解决什么问题 / 用在哪 / 项目中的作用」 |
| **Projects** | 三个项目三种呈现：智练 Coach（深色特写卡 + Agentic RAG 七节点可点击流程图）、FitMind（多 Agent 工作流 + Skill 自进化双流程图）、校服智管（业务链路图 + 参与范围标注）；点击「查看完整项目细节」打开侧边详情面板 |
| **Interactive Lab** | ① RAG 检索挑战（选择处理方式并给出教学反馈）② Multi-Agent Workflow（节点点击 + 连线点亮动画）③ Skill Evolution Loop（逐步推进 + 进度条） |
| **Experience & Honors** | 教育经历时间线 + 荣誉信息卡 |
| **Contact** | 大标题收尾、邮箱点击复制、GitHub 跳转、返回顶部 |

---

## 设计说明

- **配色**：奶油白 `#F7F5EF` 底 + 克莱因蓝 `#2449E8` 主强调 + 活力橙 `#FF875D` 点缀，深炭灰 `#202633` 正文，雾霾蓝 `#DCE5F7` 辅助背景。
- **风格**：Editorial Design——大字号标题、非对称网格、硬阴影（offset shadow）、虚线与几何装饰；不使用满屏渐变、玻璃拟态与模板化卡片。
- **动效**：滚动入场（IntersectionObserver）、悬停微交互、脉冲与连线动画；时长克制，不影响阅读。

## 已适配

- 桌面端 / 笔记本 / 平板 / 手机（移动端单列布局 + 汉堡菜单）
- `prefers-reduced-motion`：尊重系统"减少动态效果"设置，自动关闭动画
- 键盘可达：流程图节点、技能标签、菜单均支持 Tab + Enter / Space 操作，Esc 关闭弹层

---

## 内容真实性

所有个人信息、项目经历、技术栈与项目细节均以本人简历为准：

- 不虚构公司、合作方、奖项、用户量与性能数据；
- 不标注技能熟练度百分比；
- 未参与的模块只展示流程位置，不做个人职责夸大（校服智管业务图中以「我负责」徽章区分）；
- Interactive Lab 为教学演示，不接入真实大模型，页面中已明确标注。

---

## 常见修改

| 想改什么 | 去哪里改 |
|---|---|
| 个人信息 / 邮箱 / GitHub | `js/data.js` → `profile` |
| 技能标签及弹层介绍 | `js/data.js` → `skills`（每项含 `what / where / role`） |
| 项目内容 / 流程图节点文案 | `js/data.js` → `projects`（`flow.nodes` 即流程图节点） |
| 互动模块文案 | `js/data.js` → `lab` |
| 主题色 / 圆角 / 阴影 | `css/style.css` 顶部 `:root` CSS 变量 |
| 简历 PDF | 替换 `assets/` 下的文件（如改名需同步更新 `data.js` 中 `resumeFile` 和 `index.html` 里 View Resume 的 `href`） |

---

## 浏览器兼容

Chrome / Edge / Firefox / Safari 现代版本（使用 IntersectionObserver、CSS Grid、CSS 变量、Clipboard API 并带降级方案）。
