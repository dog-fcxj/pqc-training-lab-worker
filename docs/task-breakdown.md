# PQC Training Lab 任务拆解

## 1. 目标

将当前项目从“视觉演示壳”升级为“可教学、可比较、可给出迁移建议”的 PQC 交互实验室。

本文档按可执行顺序拆解任务，并尽量对应到当前仓库文件。

补充背景：

- `pqc-sharing-kit` 是知识主线更完整的原版来源
- 当前仓库则是经历多轮 Gemini 样式重构后的视觉优先版本
- 因此任务拆解默认保留现有视觉方向，不将“重新设计一套 UI”作为首要任务

## 2. 总体交付标准

完成后应满足：

- 首页能说明项目价值和紧迫性
- 原理页能建立三种技术路线的基本理解
- 算法页能完成算法间比较与详情查看
- 工程页能完成握手开销展示与迁移建议输出
- 所有关键内容来自统一数据源
- 详情层不再有 `Under development...` 占位
- 后续新增知识内容时，不需要大改页面结构

## 2.1 扩展性约束

后续开发必须同时满足以下扩展性要求：

- 新增算法时只新增数据，不改算法页主结构
- 新增协议场景时只新增数据和少量映射，不改工程页主结构
- 新增深度知识时优先接入详情层，不挤压主页面
- 新增事实口径时保留来源标识和更新时间
- 新增内容块类型时，必须评估是否能复用已有 renderer

## 3. 任务列表

建议将任务分为五个任务包执行，每个任务包都要求“可独立验证、可独立回退”。

## 任务包 P1：数据与内容底座

包含：

- 任务 A
- Hero 所需的事实卡与基线日期
- detail 数据结构雏形

交付目标：

- 不改变页面主结构的前提下，让站点具备承载完整内容的能力

前置依赖：

- 无

产出文件：

- `public/data.js`
- 可选新增 `public/data/*.js`

完成定义：

- 当前页面继续可运行
- 数据结构已能承载 Hero / Principles / Algorithms / Handshake / Migration
- 数据结构对后续新增算法和场景保持兼容

回退方案：

- 保留旧导出字段
- 若拆分数据文件后组件导入复杂，先退回单文件导出

扩展性要求：

- 为每类核心对象增加稳定 `id`
- 为关键知识条目预留 `sourceKey`、`updatedAt`
- 为详情内容预留块类型数组，而不是单一长字符串

## 任务包 P2：认知入口与基础教学

包含：

- 任务 B
- 任务 C

交付目标：

- 让用户进入站点后能快速理解主题与三种技术路线

前置依赖：

- P1

产出文件：

- `public/components/hero.js`
- `public/components/principles.js`
- `public/styles.css`
- 可选 `public/components/principle-visuals.js`

完成定义：

- Hero 可作为站点入口
- Principles 不再是占位模块
- 新增一个 principle 时不需要改页面结构

回退方案：

- Hero 回退到现有版式，仅保留指标卡取消复杂布局变更
- Principles 若动态演示不稳定，降级为静态示意 + 说明文字

扩展性要求：

- Hero 指标卡通过数组渲染
- Principles 导航与详情通过数据循环渲染

## 任务包 P3：核心比较与工程场景

包含：

- 任务 D
- 任务 E

交付目标：

- 建立“算法比较”和“协议影响”两条主阅读路径

前置依赖：

- P1
- 建议在 P2 完成后推进

产出文件：

- `public/components/algorithms.js`
- `public/components/handshake.js`
- `public/styles.css`
- `public/app.js`

完成定义：

- 算法页可比较
- 工程页可对比
- 不打开详情层也能完成主要阅读
- 新增一个算法或协议场景时，页面结构无需改写

回退方案：

- 算法页若左右栏布局不稳，先退回卡片矩阵 + 下方详情区
- Handshake 若图形化对比效果差，先退回结构化 facts + compare list

扩展性要求：

- Algorithms 页按数据列表驱动
- Handshake 场景比较按指标数组驱动
- 比较组件不得写死只支持两个场景

## 任务包 P4：迁移建议与详情统一

包含：

- 任务 F
- 任务 G

交付目标：

- 让站点具备从展示走向决策建议的能力

前置依赖：

- P1
- 建议在 P3 之后执行

产出文件：

- `public/components/migration.js` 或 `public/components/handshake.js`
- `public/app.js`
- `public/data.js`

完成定义：

- Migration 能产出差异化建议
- 详情层不再只有算法分支能用
- 新增知识类别时，详情层可以通过内容块协议接入

回退方案：

- Migration 若规则引擎不稳定，先改为勾选项直出建议卡片，不做复杂排序
- Detail renderer 若统一失败，先统一数据入口与外壳，保留部分内部模板分支

扩展性要求：

- Migration 规则按配置驱动
- Detail renderer 面向块类型，而不是面向某个具体主题写死

## 任务包 P5：导航、样式整理与交付收尾

包含：

- 任务 H
- 任务 I
- 任务 J

交付目标：

- 提升可用性与可维护性，形成可交付版本

前置依赖：

- P2、P3、P4 基本完成

产出文件：

- `public/app.js`
- `public/index.html`
- `public/styles.css`
- 可选 `public/favicon.ico`

完成定义：

- 可键盘操作
- 移动端可读
- 404 favicon 消失
- 结构和样式更易维护
- 后续加内容不会迫使再次大规模重排样式

回退方案：

- 移动端若全屏翻页体验差，单独对移动端降级为自然滚动
- 样式抽离若导致视觉回归，优先回退 class 抽离，不回退内容改造
- URL hash 若不稳定，先保留内部页码状态

扩展性要求：

- 通用卡片、事实行、步骤块样式要可复用
- 不为单一主题创建过多一次性样式类

## 任务 A：重建内容数据层

目标：

- 让数据结构能够驱动所有页面和详情层

涉及文件：

- `public/data.js`

参考来源：

- `pqc-sharing-kit/demo/public/app.js`
- `pqc-sharing-kit/notes/cheatsheet.md`
- `pqc-sharing-kit/notes/speaker_notes.md`
- `pqc-sharing-kit/notes/expert_speaker_notes.md`

具体工作：

- 重写 `algorithms` 数据，补充 `family`、`sizes`、`facts`、`pathSteps`、`formula`、`takeaway`
- 新增 `heroMetrics`
- 扩展 `principles`
- 扩展 `handshakeScenarios`
- 新增 `migrationRules`
- 为详情弹层设计统一查询结构

验收标准：

- 单个页面不再依赖硬编码说明文案
- 所有四屏都能只通过数据驱动完成主要渲染

子任务：

1. 盘点当前 `data.js` 被哪些组件消费
2. 从参考项目迁移算法、握手、迁移规则数据
3. 补齐 Hero 与 Principles 所需字段
4. 设计 detail 数据入口
5. 做兼容性检查，确保旧组件仍能读取关键字段

回退措施：

- 若字段替换影响过大，先保留旧字段别名
- 若模块拆分后导入过于分散，合并回单文件

## 任务 B：补完 Hero 内容区

目标：

- 让首屏不只是概念宣传，而是提供判断入口

涉及文件：

- `public/components/hero.js`
- `public/styles.css`

具体工作：

- 增加关键指标卡片
- 增加“为什么是现在”的简短说明
- 优化按钮文案，使跳转意图更清晰
- 保留当前视觉网络，但让文字区信息密度更高

验收标准：

- 用户进入首屏 10 秒内能理解站点主题、受众、价值
- 首屏至少有 3 个有效事实点

子任务：

1. 设计首屏信息优先级
2. 新增指标卡与关键日期
3. 调整 CTA 语义
4. 检查首屏在 1440px、1024px、768px 下的布局

回退措施：

- 若指标卡破坏现有平衡，退回双列 Hero，只在文案侧增加轻量 fact list

## 任务 C：把 Principles 页从占位改成可解释模块

目标：

- 用低门槛交互讲清 lattice / hash / code 差异

涉及文件：

- `public/components/principles.js`
- `public/styles.css`
- 可选新增：`public/components/principle-visuals.js`

具体工作：

- 每个 principle 补充“直觉解释 / 工程意义 / 代表算法”
- 演示区不再只显示 `SIMULATING_...`
- 为三类原理设计不同的可视化内容
- 详情层支持 principle 详情

验收标准：

- 切换任一原理时，右侧内容和可视化都明显变化
- 用户能区分三条技术路线，不再只是看到名词

子任务：

1. 为 lattice / hash / code 各写一套直觉解释
2. 设计三套最轻量可视化表现
3. 增加代表算法与工程意义
4. 接入 principle 详情入口

回退措施：

- 若三套动画维护成本高，保留一套通用 stage 容器，按内容切换示意图和说明

## 任务 D：重构 Algorithms 页为对比视图

目标：

- 让算法页具备“比较”和“深看”两个层次

涉及文件：

- `public/components/algorithms.js`
- `public/app.js`
- `public/styles.css`

具体工作：

- 改为“左侧算法列表 + 右侧详情面板”或“上方矩阵 + 下方详情区”
- 点击算法卡片时切换当前详情，而不是直接打开统一弹层
- 展示对象尺寸、角色、接口、实现热点、适用场景
- 弹层用于更深入说明，而非承担基础信息展示

验收标准：

- 不打开弹层时，也能完成算法间基本比较
- 打开弹层后，能看到更深一层内容而不是重复摘要

子任务：

1. 确定列表区与详情区布局
2. 设计算法选中态和默认算法
3. 接入 facts / path / formula / takeaway 渲染
4. 将弹层改为深度信息而非基础信息

回退措施：

- 若左右布局压缩严重，改为上下布局
- 若单屏信息过多，详情层承接 formula 与延伸说明

## 任务 E：重做 Handshake / Deployment 页面结构

目标：

- 把“工程化握手开销”升级成真正的工程比较页

涉及文件：

- `public/components/handshake.js`
- `public/data.js`
- `public/styles.css`

具体工作：

- 增加 classical TLS 基线场景
- 为 hybrid TLS 和 IKEv2 + ML-KEM 增加对象、额外字节、工程风险说明
- 增加对比组件，例如条形图、对象块、对比列表
- 将“Traffic Capture”详情改为实际内容页

验收标准：

- 页面能明确回答“比传统 TLS 大多少、为什么大、影响什么”
- IKEv2 路线不再只是单句摘要

子任务：

1. 新增 classical TLS 基线
2. 接入握手字节与对象对比数据
3. 设计 compare row / object block / risk note
4. 接入 handshake 详情层

回退措施：

- 若视觉化条形图不稳定，先使用数值卡片 + facts grid

## 任务 F：新增 Migration Lab

目标：

- 让站点具备“从知识展示走向决策建议”的能力

涉及文件：

- `public/components/handshake.js` 或新建 `public/components/migration.js`
- `public/data.js`
- `public/app.js`

建议：

- 当前第四屏建议拆成 Handshake + Migration 的组合布局
- 如果空间不够，可重命名第四屏为 `Deployment & Migration`

具体工作：

- 增加系统画像选项
- 根据勾选结果生成建议卡片
- 建议项需包含“原因”和“优先级”

验收标准：

- 至少支持 5 到 6 个判断条件
- 至少返回 3 类不同建议

子任务：

1. 确定规则输入项
2. 设计建议卡字段结构
3. 选择结果排序方式
4. 接入页面状态与结果刷新

回退措施：

- 若排序逻辑复杂且不稳定，改为按勾选顺序输出固定建议组

## 任务 G：统一详情层渲染机制

目标：

- 消除目前 `openDetail(type)` 的临时分支结构

涉及文件：

- `public/app.js`
- `public/data.js`

具体工作：

- 设计 detail registry
- 支持 `hero`、`principle`、`algorithm`、`handshake`、`migration`
- 标题、卡片、列表、公式块等统一用配置渲染

验收标准：

- 详情层逻辑不再依赖大量字符串拼接分支
- 新增一种 detail 类型时，不需要大幅改动核心逻辑

子任务：

1. 定义 detail 数据协议
2. 提取共用标题区、容器区、关闭逻辑
3. 抽象内容块 renderer
4. 迁移至少三类 detail 到新机制

回退措施：

- 若统一 renderer 过度复杂，先统一容器和数据入口，保留类型化模板

## 任务 H：优化交互方式与导航

目标：

- 让站点在桌面端和移动端都能正常使用

涉及文件：

- `public/app.js`
- `public/index.html`
- `public/styles.css`

具体工作：

- 增加键盘导航
- 增加触摸滑动支持
- 增加 URL hash 同步
- 处理移动端 `100vh` 和固定 padding 问题

验收标准：

- 不依赖鼠标滚轮也能完整浏览
- 手机端不会出现主要内容溢出或无法切页

子任务：

1. 增加键盘切页
2. 增加触摸手势或移动端降级逻辑
3. 接入 URL hash
4. 修复小屏 padding 与高度问题

回退措施：

- 若 hash 与翻页冲突，先保留本地状态
- 若触摸翻页不稳定，移动端使用原生滚动

## 任务 I：样式整理与组件化清理

目标：

- 降低后续迭代成本

涉及文件：

- `public/components/*.js`
- `public/styles.css`

具体工作：

- 抽离内联样式中的高频布局和视觉类
- 为卡片、面板、事实行、详情块建立统一 class
- 保持现有风格，不推翻 UI 方向

验收标准：

- 页面中重复内联样式显著减少
- 组件结构更清晰

子任务：

1. 盘点重复内联布局
2. 提取通用 class
3. 分批替换组件内联样式
4. 做视觉回归检查

回退措施：

- 不一次性替换所有内联样式
- 哪个组件替换后视觉回归，就只回退那个组件

## 任务 J：内容出处与站点收尾

目标：

- 让站点具备基本可信度和交付完整性

涉及文件：

- `public/index.html`
- `public/styles.css`
- 可选新增 `public/favicon.ico`

具体工作：

- 增加 favicon
- 增加页脚资料口径说明
- 增加 meta description
- 增加引用来源简表或数据基线说明

验收标准：

- 页面不再出现 404 favicon
- 用户能知道内容的时间基线与资料范围

子任务：

1. 增加 favicon
2. 增加 meta description
3. 增加 footer 基线说明
4. 增加必要的来源提示

回退措施：

- 若收尾项影响布局，优先保留功能性信息，弱化装饰性元素

## 4. 推荐执行顺序

建议按以下顺序开发：

1. 任务 A：数据层
2. 任务 B：Hero
3. 任务 C：Principles
4. 任务 D：Algorithms
5. 任务 E：Handshake
6. 任务 F：Migration
7. 任务 G：详情层
8. 任务 H：导航与移动端
9. 任务 I：样式清理
10. 任务 J：收尾

原因：

- 当前最关键的问题是内容和数据结构，而不是样式本身
- 页面逻辑只有在数据结构稳定后才适合重构
- 详情系统应在主要页面内容稳定后统一收口

## 4.1 两周执行样例

如果按较紧凑节奏推进，可参考下面的顺序：

### 第 1 周

1. 完成 P1
2. 完成 P2
3. 开始 P3 的算法页

### 第 2 周

1. 完成 P3 的工程页
2. 完成 P4
3. 完成 P5

## 4.2 回退决策规则

出现以下情况时应立即停止继续叠加功能，优先回退到上一锚点：

- 首页或任一主屏无法正常渲染
- 详情层无法关闭或覆盖主页面交互
- 页面导航状态错乱
- 桌面端视觉结构明显破坏

优先回退顺序：

1. 回退当前正在改的单一组件
2. 回退当前任务包
3. 回退到上一个里程碑锚点

不建议的处理方式：

- 不要在样式已错乱的情况下继续叠加逻辑修复
- 不要在数据结构未稳定时同步大改多个页面

## 5. 里程碑建议

### M1：内容可演示

包含：

- 数据层完成
- Hero / Principles / Algorithms 可用

结果：

- 站点能完成“为什么现在要关心 PQC”和“主流算法差异”两件事

### M2：工程可决策

包含：

- Handshake 完成
- Migration 完成

结果：

- 站点能从协议影响和系统画像给出迁移建议

### M3：可上线展示

包含：

- 统一详情层
- 移动端与可访问性修复
- 样式清理和站点收尾

结果：

- 站点适合培训、汇报、演示和静态部署

## 6. 文件级建议

如果希望当前版本继续保持简单，建议文件结构演进如下：

- `public/data.js`
  继续保留单文件数据，但按模块导出
- `public/components/hero.js`
  专注首屏内容渲染
- `public/components/principles.js`
  专注原理页
- `public/components/algorithms.js`
  专注算法对比
- `public/components/handshake.js`
  专注工程场景
- `public/components/migration.js`
  新增，专注迁移建议
- `public/app.js`
  只负责导航、状态切换、详情层调度

如果后续内容继续增长，可以再拆分为：

- `public/data/hero.js`
- `public/data/principles.js`
- `public/data/algorithms.js`
- `public/data/handshake.js`
- `public/data/migration.js`

## 7. 本轮建议的直接下一步

如果马上开始开发，我建议第一轮只做三件事：

1. 先把 `pqc-sharing-kit/demo/public/app.js` 的核心数据迁到当前项目
2. 再重构 Algorithms 和 Handshake 两个最有信息价值的页面
3. 最后补统一详情层和 Migration

这三步做完，项目就会从“样式页”变成“真正可展示的内容站”。
