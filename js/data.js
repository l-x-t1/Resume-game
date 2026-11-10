/* ============================================================
 * data.js — 站点内容数据层
 * 所有内容均以李湘婷本人简历为准，未虚构任何经历、数据或技术。
 * 页面展示（index.html / projects.js / lab.js）只读取本文件。
 * ============================================================ */

var RESUME_DATA = {

  profile: {
    nameZh: "李湘婷",
    nameEn: "Xiangting Li",
    title: "AI Application Developer",
    tagline: "Building Intelligent Agents & RAG Systems.",
    introZh:
      "软件工程专业本科生，关注大模型应用开发、Agent 系统与 RAG 技术，具备 Python、Java 后端开发基础和 AI 应用项目实践经验。",
    meta: [
      { label: "学校", value: "河北经贸大学" },
      { label: "专业", value: "软件工程" },
      { label: "学历", value: "本科 · 2028 届" },
      { label: "求职方向", value: "大模型应用开发 / Agent 开发实习生" },
    ],
    email: "1524635462@qq.com",
    github: "https://github.com/l-x-t1",
    resumeFile: "assets/李湘婷_大模型应用开发实习生_简历.pdf",
  },

  /* ---------------- About ---------------- */
  about: {
    lines: [
      "软件工程专业在读，主攻方向是大模型应用开发——尤其是 Agent 系统与 RAG 检索增强生成。",
      "有完整的 Python / FastAPI AI 应用项目经验，也有扎实的 Java 后端基础（Spring Boot / MyBatis / MySQL / Redis）。",
      "日常使用 Claude Code、Codex 等 AI Coding 工具辅助需求分析、任务拆解、开发与测试复核，熟悉 Harness Engineering 的工作方式。",
      "正在持续深入 Agent Engineering、RAG 与后端工程化方向。",
    ],
    facts: [
      { key: "CURRENT FOCUS", value: "Agent Engineering / RAG / Backend Development" },
      { key: "FAVORITE STACK", value: "Python / Java / LangGraph / FastAPI" },
      { key: "BUILDING", value: "Intelligent Agent Applications" },
    ],
    keywords: ["Agentic RAG", "Multi-Agent", "LangGraph", "知识图谱", "混合检索", "Harness Engineering"],
  },

  /* ---------------- Skills ---------------- */
  /* what: 该技术主要解决什么问题； where: 在哪个项目中使用过； role: 它在项目中承担什么作用 */
  skills: [
    {
      category: "Backend Development",
      nameZh: "后端开发",
      desc: "扎实的 Java 后端基础：集合框架、多线程、JVM 内存结构与垃圾回收，理解 IoC、DI、AOP 等核心机制。",
      tags: [
        {
          name: "Java",
          what: "通用后端开发语言，掌握集合框架、多线程与 JVM 内存结构、垃圾回收等核心知识。",
          where: "校服智管",
          role: "主要开发语言，用于实现结算、问卷、生产与发货等业务模块。",
        },
        {
          name: "Spring Boot",
          what: "简化 Spring 应用的搭建与开发，理解 IoC、DI、AOP 核心机制。",
          where: "校服智管",
          role: "微服务业务模块的开发框架，承载各服务的接口与业务逻辑。",
        },
        {
          name: "Spring MVC",
          what: "基于 MVC 模式的 Web 层框架，负责请求分发与响应处理。",
          where: "校服智管",
          role: "处理各业务模块的接口层请求与参数绑定。",
        },
        {
          name: "MyBatis",
          what: "半自动化 ORM 框架，支持手写 SQL 与动态 SQL。",
          where: "校服智管",
          role: "用 XML 编写多条件动态 SQL，实现结算多维度查询与 SUM / COUNT / CASE WHEN 聚合统计。",
        },
        {
          name: "MySQL",
          what: "关系型数据库，熟悉索引结构、索引优化、事务隔离级别与 MVCC 等核心机制。",
          where: "校服智管 / FitMind",
          role: "校服智管的业务数据存储；FitMind 中承担结构化事实记忆。",
        },
        {
          name: "Redis",
          what: "内存数据库，熟悉持久化、缓存应用及穿透 / 击穿 / 雪崩等问题的解决方案。",
          where: "FitMind / 校服智管",
          role: "FitMind 中基于 Hash 按 user_id + session_id 管理会话状态；校服智管中用于缓存。",
        },
        {
          name: "Spring Cloud Alibaba",
          what: "微服务治理框架族，提供服务注册发现、配置管理等能力。",
          where: "校服智管",
          role: "微服务架构的治理体系，配合 Nacos 完成服务注册与配置管理。",
        },
      ],
    },
    {
      category: "AI Application Development",
      nameZh: "AI 应用开发",
      desc: "熟悉 LangChain / LangGraph 框架，掌握共享 State、条件路由、节点编排与工具调用机制。",
      tags: [
        {
          name: "Python",
          what: "AI 应用开发的主要语言，具备业务接口开发与服务集成实践经验。",
          where: "智练 Coach / FitMind",
          role: "两个 AI 项目的核心开发语言。",
        },
        {
          name: "FastAPI",
          what: "高性能 Python Web 框架，适合构建 AI 服务接口。",
          where: "智练 Coach",
          role: "搭建 Agentic RAG 系统的服务端接口。",
        },
        {
          name: "LangChain",
          what: "大模型应用开发框架，提供模型集成、链式调用与工具调用等组件。",
          where: "智练 Coach / FitMind",
          role: "承担模型调用、组件编排与工具调用等基础能力。",
        },
        {
          name: "LangGraph",
          what: "基于图的 Agent 编排框架，掌握共享 State、条件路由与节点编排。",
          where: "FitMind",
          role: "组织意图识别、信息收集、任务规划与执行 Agent，通过条件边实现动态路由。",
        },
        {
          name: "Agent Workflow",
          what: "将复杂任务拆解为多 Agent 协作的工作流，实现任务拆解、协同调度与安全执行。",
          where: "FitMind / 智练 Coach",
          role: "FitMind 中四 Agent 协作编排；智练 Coach 中检索策略的动态决策。",
        },
        {
          name: "Tool Calling",
          what: "让模型按约定结构调用外部工具，理解参数校验与异常恢复机制。",
          where: "FitMind",
          role: "工具调用前进行参数与权限校验，支持异常拦截与执行结果反馈。",
        },
        {
          name: "Multi-Agent Collaboration",
          what: "多个 Agent 分工协作，通过共享 State 在节点间传递信息、约束与执行结果。",
          where: "FitMind",
          role: "会话状态与历史上下文注入共享 State，实现复杂任务的协同处理。",
        },
      ],
    },
    {
      category: "RAG & Knowledge Engineering",
      nameZh: "RAG 与知识工程",
      desc: "具备多轮对话上下文管理、分层记忆及历史信息冲突校验实践经验，熟悉状态更新与节点间数据传递。",
      tags: [
        {
          name: "Milvus",
          what: "向量数据库，用于存储与检索文本向量化后的语义表示。",
          where: "智练 Coach",
          role: "向量召回通道，存储文档切片向量，支撑语义检索。",
        },
        {
          name: "Neo4j",
          what: "图数据库，适合表达实体与关系的知识图谱。",
          where: "智练 Coach",
          role: "构建包含 10 类节点、11 类关系的健身知识图谱，作为图谱召回通道。",
        },
        {
          name: "BM25",
          what: "基于词频的经典稀疏检索算法，擅长关键词精确匹配。",
          where: "智练 Coach",
          role: "三路混合召回中的关键词召回通道。",
        },
        {
          name: "Vector Retrieval",
          what: "将文本编码为向量后按语义相似度检索，弥补关键词检索的语义缺口。",
          where: "智练 Coach",
          role: "三路混合召回中的语义召回通道。",
        },
        {
          name: "Hybrid Retrieval",
          what: "融合多路检索结果，同时覆盖关键词命中与语义相关性。",
          where: "智练 Coach",
          role: "设计 BM25、向量、图谱三路混合召回，提升相关知识召回覆盖能力。",
        },
        {
          name: "RRF",
          what: "Reciprocal Rank Fusion，按排名倒数融合多路检索结果。",
          where: "智练 Coach",
          role: "对三路召回结果进行融合排序。",
        },
        {
          name: "BGE-Reranker",
          what: "交叉编码器重排模型，对候选结果做精细相关性排序。",
          where: "智练 Coach",
          role: "对 RRF 融合后的候选集进行相关性重排。",
        },
        {
          name: "RAGAS",
          what: "RAG 系统评估框架，用于量化检索与生成质量。",
          where: "智练 Coach",
          role: "用于检索与生成效果的评估。",
        },
        {
          name: "Langfuse",
          what: "LLM 应用可观测平台，追踪链路中每个环节的输入输出。",
          where: "智练 Coach",
          role: "检索、评估、生成全流程的链路追踪与监控。",
        },
      ],
    },
    {
      category: "AI Coding & Engineering",
      nameZh: "AI Coding 与工程化",
      desc: "熟悉 Harness Engineering 与 AI Coding，能够使用 AI 工具辅助需求分析、任务拆解、代码开发与测试复核。",
      tags: [
        {
          name: "Codex",
          what: "AI Coding 工具，辅助代码生成与任务执行。",
          where: "日常开发",
          role: "辅助需求分析、任务拆解、代码开发与测试复核。",
        },
        {
          name: "Claude Code",
          what: "AI Coding 工具，理解任务规划、工具调用与执行校验机制。",
          where: "日常开发",
          role: "辅助需求分析、代码开发与测试复核，具备 Skills 使用与复用经验。",
        },
        {
          name: "Harness Engineering",
          what: "围绕 AI 编码工具构建工程化工作方式：任务规划、工具调用、执行校验与异常恢复。",
          where: "日常开发",
          role: "以工程化方式组织 AI 辅助开发流程，保证产出质量可控。",
        },
        {
          name: "Skills",
          what: "将可复用的方法论封装为技能，供 AI 工具在任务中调用与复用。",
          where: "FitMind",
          role: "研究 Skill 的评估与自进化机制，推动技能持续迭代。",
        },
        {
          name: "Task Planning",
          what: "将目标拆解为可执行、可验证的子任务序列。",
          where: "FitMind",
          role: "任务规划 Agent 负责将用户需求拆解为可执行计划。",
        },
        {
          name: "Tool Invocation",
          what: "Agent 执行体系中对工具的受控调用，含参数与权限约束。",
          where: "FitMind",
          role: "调用前进行参数与权限校验，异常时拦截并反馈执行结果。",
        },
        {
          name: "Execution Verification",
          what: "对执行结果进行校验，保证 Agent 行为可信可查。",
          where: "FitMind / 智练 Coach",
          role: "FitMind 中执行结果反馈与回归测试；智练 Coach 中引用依据校验与拒答机制。",
        },
      ],
    },
  ],

  /* ---------------- Projects ---------------- */
  projects: [
    {
      id: "zhilian-coach",
      index: "01",
      name: "智练 Coach",
      subtitle: "Agentic RAG 智能知识服务系统",
      period: "2026.05 — 2026.09",
      role: "独立开发",
      position: "面向健身知识问答与个性化运动指导场景的 Agentic RAG 系统。",
      stack: ["Python", "FastAPI", "LangChain", "Neo4j", "MinerU", "Milvus", "BGE-Reranker", "RAGAS", "Langfuse"],
      background:
        "面向石家庄市的健身知识问答与个性化运动指导场景，构建 Agentic RAG 系统，融合混合检索与知识图谱，实现意图分析、检索策略动态路由、结果评估与迭代检索，提升复杂问题的知识召回能力和回答可靠性。",
      features: [
        "基于 MinerU 完成文档解析，清洗切分后构建健身知识库",
        "基于 Neo4j 构建包含 10 类节点、11 类关系的知识图谱",
        "BM25、向量、图谱三路混合召回 + RRF 融合",
        "Agent 根据问题意图动态选择检索策略",
        "检索结果相关性评估，未达标时触发 Query Rewrite 或二次检索",
        "引用依据校验与无有效引用拒答机制",
        "Langfuse 全流程链路追踪与监控",
      ],
      mine: [
        "知识库构建与图谱建模：使用 MinerU 完成文档解析，清洗切分后基于 Neo4j 构建知识图谱；设计 Query Rewrite → 三路召回 → RRF 融合 → BGE-Reranker 重排链路。",
        "Agent 动态检索与决策：根据用户问题进行意图分析与检索策略路由，对检索结果进行相关性评估，未达标时触发 Query Rewrite 或二次检索，并根据检索反馈持续调整检索路径。",
        "多阶段检索与生成控制：基于评估结果决定是否进入答案生成阶段，引入引用依据校验与无有效引用拒答机制，结合异常兜底逻辑和 Langfuse 链路追踪实现全流程监控。",
      ],
      highlights: [
        "检索策略由 Agent 按问题意图动态路由，而非固定管线",
        "评估驱动的迭代检索：不满意就改写重查，无据可依就拒答",
        "三路混合召回 + 重排，兼顾关键词命中与语义相关性",
      ],
      flow: {
        title: "Agentic RAG 处理流程",
        note: "点击任意节点，查看该步骤的作用、输入、输出与对应技术。",
        nodes: [
          {
            id: "q",
            label: "用户问题",
            what: "接收用户的健身知识提问，作为整条链路的输入。",
            input: "用户原始问题文本",
            output: "标准化的查询请求",
            tech: "FastAPI 接口层",
          },
          {
            id: "rewrite",
            label: "Query Rewrite",
            what: "对口语化、指代不明的问题进行改写，提高各路召回的命中率；在检索评估未达标时也会再次触发。",
            input: "用户原始问题 / 评估不达标的反馈",
            output: "改写后的查询语句",
            tech: "LangChain + LLM",
          },
          {
            id: "recall",
            label: "三路混合召回",
            what: "BM25 负责关键词精确匹配，向量检索覆盖语义相关性，图谱检索利用实体关系补充结构化知识，三路并行召回。",
            input: "改写后的查询",
            output: "BM25 / 向量 / 图谱三路候选文档集",
            tech: "BM25 + Milvus + Neo4j",
          },
          {
            id: "rrf",
            label: "RRF 融合",
            what: "按倒数排名融合三路检索结果，把不同召回通道的候选统一为一个排序。",
            input: "三路候选文档集",
            output: "融合后的候选列表",
            tech: "Reciprocal Rank Fusion",
          },
          {
            id: "rerank",
            label: "BGE-Reranker 重排",
            what: "用交叉编码器对融合候选做精细相关性重排，淘汰弱相关内容。",
            input: "融合后的候选列表",
            output: "Top-K 高相关文档",
            tech: "BGE-Reranker",
          },
          {
            id: "evaluate",
            label: "检索结果评估",
            what: "Agent 评估重排后结果能否支撑回答：达标进入生成；不达标触发 Query Rewrite 或二次检索，持续调整检索路径。",
            input: "Top-K 文档 + 原始问题",
            output: "通过 / 触发改写重查 / 拒答",
            tech: "Agent 意图分析 + 动态路由",
          },
          {
            id: "generate",
            label: "答案生成 / 二次检索 / 拒答",
            what: "达标则生成带引用依据的答案并校验引用；无有效引用时拒答而不是硬编，配合异常兜底逻辑保证稳定性。",
            input: "评估通过的文档 + 问题",
            output: "带引用的答案 / 二次检索请求 / 拒答复述",
            tech: "引用校验 + Langfuse 监控",
          },
        ],
      },
    },
    {
      id: "fitmind",
      index: "02",
      name: "FitMind",
      subtitle: "多 Agent 健身规划与 Skill 自进化系统",
      period: "2026.02 — 2026.05",
      role: "独立开发",
      position: "面向个性化训练规划和多轮健身咨询场景的 Agent 系统。",
      stack: ["Python", "LangGraph", "LangChain", "Redis", "MySQL", "Chroma", "JWT", "pytest"],
      background:
        "面向个性化训练规划与多轮健身咨询场景，基于多 Agent 工作流构建对话状态管理与分层记忆系统，解决多轮交互中用户信息丢失、重复询问、需求冲突及工具调用缺少约束等问题，实现上下文持续维护、意图路由、信息补全与训练规划协同处理。",
      features: [
        "Redis Hash 按 user_id + session_id 管理会话状态",
        "槽位状态树管理多轮信息收集，支持增量更新与已确认信息保留",
        "Redis / MySQL / Chroma 分层记忆 + 新旧信息冲突校验",
        "LangGraph 编排意图识别、信息收集、任务规划与执行 Agent",
        "工具调用前的参数与权限校验",
        "Replay + LLM-as-Judge 评估 Skill 执行质量",
        "候选 Skill 版本经规则校验与 pytest 回归测试后版本化管理",
      ],
      mine: [
        "多轮对话上下文与状态管理：基于 Redis Hash 按 user_id + session_id 管理会话状态，构建槽位状态树，支持增量更新、已确认信息保留、必填校验及多轮追问；结合短期对话记忆、MySQL 结构化事实记忆与 Chroma 语义记忆实现分层记忆，并通过会话过期机制控制状态生命周期。",
        "多 Agent 协作与任务编排：基于 LangGraph 构建意图识别、信息收集、任务规划与执行 Agent，通过条件边实现动态路由，将会话状态与历史上下文注入共享 State，并在工具调用前进行参数与权限校验。",
        "Skill 评估与自进化机制：通过 Replay 回放历史任务，结合 LLM-as-Judge 评估 Skill 执行质量；针对低质量案例生成候选优化版本，经规则校验和回归测试验证后进行版本管理，确保技能更新的可追溯性。",
      ],
      highlights: [
        "槽位状态树 + 分层记忆，多轮对话不丢信息、不重复询问",
        "四个 Agent 通过共享 State 与条件边协同，工具调用有约束",
        "Skill 自进化闭环：评估 → 生成候选 → 回归测试 → 版本管理",
      ],
      flows: [
        {
          key: "agents",
          title: "多 Agent 工作流",
          note: "点击节点查看对应处理逻辑。",
          nodes: [
            {
              id: "intent",
              label: "意图识别 Agent",
              what: "识别用户当前轮次的真实意图（咨询、规划、闲聊等），决定工作流的走向。",
              input: "用户消息 + 历史上下文",
              output: "意图标签与路由决策",
              tech: "LangGraph 条件边",
            },
            {
              id: "info",
              label: "信息收集 Agent",
              what: "基于槽位状态树管理多轮信息收集：必填信息校验、多轮追问、增量更新，已确认信息保留不重复询问。",
              input: "意图标签 + 会话状态",
              output: "补全后的槽位状态",
              tech: "Redis Hash 槽位状态树",
            },
            {
              id: "plan",
              label: "任务规划 Agent",
              what: "将补全后的需求拆解为可执行计划，注入任务约束。",
              input: "槽位状态 + 用户约束",
              output: "结构化执行计划",
              tech: "共享 State",
            },
            {
              id: "exec",
              label: "执行 Agent",
              what: "按计划调用工具执行；调用前进行参数与权限校验，异常时拦截并反馈执行结果。",
              input: "执行计划",
              output: "执行结果与反馈",
              tech: "Tool Calling + 校验",
            },
          ],
        },
        {
          key: "skill",
          title: "Skill 自进化流程",
          note: "Skill 不是一次性写死的：通过回放评估持续迭代。",
          nodes: [
            {
              id: "replay",
              label: "案例回放 Replay",
              what: "回放历史执行记录与用户反馈，还原 Skill 当时的执行过程。",
              input: "历史执行记录 + 用户反馈",
              output: "可评估的执行案例",
              tech: "Replay 机制",
            },
            {
              id: "judge",
              label: "质量评估 LLM-as-Judge",
              what: "以 LLM-as-Judge 评估 Skill 执行质量，定位低质量案例。",
              input: "执行案例",
              output: "质量评分与问题定位",
              tech: "LLM-as-Judge",
            },
            {
              id: "candidate",
              label: "生成候选版本",
              what: "针对低质量案例生成候选 Skill 优化版本。",
              input: "问题定位 + 原 Skill",
              output: "候选 Skill 版本",
              tech: "Prompt 迭代",
            },
            {
              id: "validate",
              label: "规则校验",
              what: "对候选版本执行规则校验，过滤明显不合格的版本。",
              input: "候选 Skill 版本",
              output: "通过校验的候选版本",
              tech: "Python 规则",
            },
            {
              id: "regress",
              label: "回归测试",
              what: "用 pytest 回归测试验证优化效果，确认没有引入新问题。",
              input: "通过校验的候选版本",
              output: "测试通过的最终版本",
              tech: "pytest",
            },
            {
              id: "version",
              label: "版本记录",
              what: "对通过测试的版本做版本管理，记录优化过程，确保可追溯、可回滚。",
              input: "测试通过的版本",
              output: "新版本 Skill 入库",
              tech: "版本管理",
            },
          ],
        },
      ],
    },
    {
      id: "uniform-saas",
      index: "03",
      name: "校服智管",
      subtitle: "基于微服务架构的校服采购与供应链管理系统",
      period: "2026.02 — 2026.05",
      role: "后端开发（负责结算 / 问卷 / 生产发货等模块）",
      position: "面向校服采购与供应链管理场景的业务系统。",
      stack: ["Java", "Spring Boot", "Spring Cloud Alibaba", "MyBatis Plus", "MySQL", "Redis", "Nacos"],
      background:
        "面向石家庄市教育局合作的校服管理平台，采用微服务架构，服务于教育局、学校、校服供应商及学生家长，实现校服采购、生产管理、订单交易、物流配送、结算管理及问卷调查等业务功能。",
      features: [
        "结算列表、详情与统计功能开发",
        "MyBatis XML 多条件动态 SQL 实现复杂查询",
        "SUM / COUNT / CASE WHEN 聚合统计结算金额与状态",
        "问卷配置、题目维护、预览及分题型结果统计",
        "生产订单 CRUD、状态管理与 Spring 事务一致性保障",
        "生产单 → 发货单转换，含重复生成校验与状态检查",
        "发货单查询、物流单号维护与供应商数据权限校验",
      ],
      mine: [
        "结算管理：负责结算列表、详情及统计功能，关联订单与资金流水，使用 MyBatis XML 编写多条件动态 SQL，实现按组织、项目、结算周期及状态等维度查询，并通过聚合 SQL 统计结算总金额、已付、未付及结算状态。",
        "问卷管理：负责问卷配置、题目维护、问卷预览及结果统计，基于问卷主表与题目子表关联关系实现数据维护，针对单选、多选、文本等题型设计差异化统计逻辑。",
        "统购生产管理：负责生产单列表、新增、详情及状态修改，结合 Spring 事务管理完成生产单及明细数据的协同更新，保障数据一致性。",
        "生产发货流程：参与生产完成后的发货单生成流程，实现生产单向发货单的转换与关联，并通过生产状态及重复生成校验避免异常创建。",
        "发货单管理：负责统购发货单列表、详情及发货信息维护，实现物流单号维护与发货状态管理，并通过供应商身份及数据权限校验控制数据访问范围。",
      ],
      highlights: [
        "真实多角色微服务业务系统：教育局、学校、供应商、家长",
        "动态 SQL + 聚合统计支撑结算对账",
        "Spring 事务 + 状态校验保障生产发货流程一致性",
      ],
      flow: {
        title: "核心业务流程",
        note: "展示我参与的后端模块在整个采购链路中的位置。",
        nodes: [
          {
            id: "purchase",
            label: "采购业务",
            what: "教育局 / 学校发起校服采购需求，形成统购业务基础数据。",
            mine: false,
          },
          {
            id: "produce",
            label: "生产订单",
            what: "负责生产单列表、新增、详情及状态修改；围绕生产单与生产明细关联处理商品、尺码及数量，Spring 事务保障协同更新一致性。",
            mine: true,
          },
          {
            id: "delivery",
            label: "发货管理",
            what: "参与生产单 → 发货单转换与关联，含重复生成校验；负责发货单列表、详情及发货信息维护。",
            mine: true,
          },
          {
            id: "logistics",
            label: "物流跟踪",
            what: "实现发货单物流单号维护与发货状态管理。",
            mine: true,
          },
          {
            id: "settle",
            label: "结算统计",
            what: "负责结算列表、详情及统计功能，动态 SQL 多维查询 + SUM / COUNT / CASE WHEN 聚合，支撑结算进度跟踪与业务对账。",
            mine: true,
          },
        ],
      },
    },
  ],

  /* ---------------- Experience & Honors ---------------- */
  experience: {
    education: [
      {
        time: "2024.09 — 2028.06",
        school: "河北经贸大学",
        detail: "软件工程专业 · 本科（统招）",
      },
    ],
    honors: [
      "校一等奖学金（连续两年）",
      "校三好学生",
      "软件协会会长 · 组织技术分享活动",
    ],
  },

  /* ---------------- Interactive Lab ---------------- */
  lab: {
    rag: {
      question: "“深蹲的时候膝盖总是内扣，应该怎么纠正？”",
      scenario:
        "假设这是用户向系统提出的问题。当前检索通道只做单一关键词匹配，返回的段落大多在讲“深蹲的常见错误”的泛泛介绍，与“膝盖内扣如何纠正”关联很弱。",
      options: [
        {
          id: "a",
          label: "Query Rewrite 后再检索",
          score: 2,
          verdict: "推荐做法 ✔",
          explain:
            "与本项目一致：先做意图分析与查询改写，把“膝盖内扣怎么纠正”这类口语化表达改写为更精确的检索查询，再走混合召回。评估不达标时触发改写与二次检索，正是智练 Coach 中的核心决策逻辑。",
        },
        {
          id: "b",
          label: "保持原查询重新检索",
          score: 0,
          verdict: "收益有限 ✖",
          explain:
            "同样的查询再检索一遍，返回的大概率还是同样的弱相关内容。问题出在查询本身，不重写很难突破召回瓶颈。",
        },
        {
          id: "c",
          label: "直接生成答案",
          score: 1,
          verdict: "有幻觉风险 ✖",
          explain:
            "在弱相关上下文上强行生成，模型很容易编造细节。智练 Coach 中设置了引用依据校验：没有有效引用支撑的内容不会直接输出。",
        },
        {
          id: "d",
          label: "拒答或澄清追问",
          score: 1,
          verdict: "兜底手段 △",
          explain:
            "拒答是无有效引用时的正确兜底，但在还能通过改写检索到相关知识时，先迭代检索是更好的选择——拒答应该是最后一步，而不是第一步。",
        },
      ],
    },
  },
};
