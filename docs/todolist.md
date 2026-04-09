# PQC Training Lab Todo List

## 使用说明

这份清单用于把当前项目从“样式优先版本”推进为“内容与交互闭环版本”。

执行原则：

- 一次只推进一个任务包
- 每完成一个任务包就做一次本地运行检查
- 高风险任务优先保留降级路线
- 任何时候都不要为了加内容而破坏现有满意的视觉骨架

状态建议：

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` 已完成
- `[-]` 暂缓

---

## P0 基线确认

目标：

- 冻结当前样式优先版本，作为后续内容回灌的起点

Todo：

- [x] 记录当前基线版本说明
- [x] 确认 `pqc-sharing-kit` 中哪些资料作为内容来源
- [x] 确认 `pqc-explorer.zip` 中哪些内容可以直接迁入
- [x] 确认当前项目中必须保留的视觉特征

交付物：

- 当前仓库的执行基线
- 内容来源清单
- 样式保留原则

完成标准：

- 可以明确回答“什么不能动、什么优先补”

当前结果：

- 已输出 `docs/baseline.md`

回退措施：

- 若方向再次混乱，回到本清单和 `docs/project-plan.md` 重新对齐

---

## P1 数据与内容底座

目标：

- 建立可扩展的数据结构，为后续加知识留出空间

优先级：

- 最高

依赖：

- P0

Todo：

- [x] 盘点当前 `public/data.js` 的消费点
- [x] 从 `pqc-sharing-kit/demo/public/app.js` 提取可复用数据
- [x] 设计统一的数据对象类型
- [x] 为 `heroMetric`、`principle`、`algorithm`、`handshakeScenario`、`migrationRule` 增加稳定 `id`
- [x] 为关键知识项预留 `sourceKey`
- [x] 为关键知识项预留 `updatedAt`
- [x] 为详情层设计统一的内容块结构
- [x] 保留旧字段兼容，避免页面首轮报错
- [ ] 评估是否需要把 `public/data.js` 拆成多个模块文件

交付物：

- 可扩展的数据层
- 兼容旧页面的数据导出方式

完成标准：

- 当前页面不报错
- 新增一个算法时原则上只需要加数据
- 新增一个协议场景时原则上只需要加数据

当前结果：

- 已完成 `public/data.js` 扩展
- 已保留 `algorithms / principles / scenarios` 兼容导出
- 已新增 `heroMetrics / heroNarrative / handshakeMetrics / handshakeScenarios / migrationRules / detailDocuments`

回退措施：

- 若新结构牵动过多组件，先保留单文件 `public/data.js`
- 若字段替换导致页面报错，先恢复旧字段别名

---

## P2 Hero 与 Principles

目标：

- 补足认知入口与基础教学层

优先级：

- 高

依赖：

- P1

Todo：

- [x] 设计 Hero 信息优先级
- [x] 将 Hero 从“概念口号”升级为“概念 + 事实卡”
- [x] 增加关键日期、关键指标或关键判断
- [x] 优化 CTA 文案与跳转意图
- [x] 重写 Principles 数据映射
- [x] 为 `lattice / hash / code` 各补一套“直觉解释”
- [x] 为 `lattice / hash / code` 各补一套“工程意义”
- [x] 为 `lattice / hash / code` 各补一套“代表算法”
- [x] 把 Principles 演示区从占位改成真实内容
- [x] 为 Principles 准备详情层入口

交付物：

- 完整可读的 Hero
- 可教学的 Principles 页面

完成标准：

- 用户进入站点 10 秒内知道这个站在讲什么
- 用户能区分三类路线，不只是看到名词

当前结果：

- Hero 已接入 `heroNarrative` 与 `heroMetrics`
- Principles 已接入扩展后的 `principles` 数据
- 页面已完成一次真实渲染检查

回退措施：

- 若 Hero 改版破坏视觉平衡，退回现有 Hero 框架，仅追加事实卡
- 若 Principles 动画不稳定，降级为静态示意 + 文本解释

---

## P3 Algorithms

目标：

- 把算法页从“入口卡片”升级为“可比较的主页面”

优先级：

- 高

依赖：

- P1
- 建议在 P2 之后进行

Todo：

- [x] 确定算法页布局方案
- [x] 设计默认选中算法
- [x] 设计算法切换逻辑
- [x] 展示 `family / role / sizes`
- [x] 展示 `facts`
- [x] 展示 `pathSteps`
- [x] 展示 `formula`
- [x] 展示 `takeaway`
- [x] 调整弹层职责，让弹层只承接深度内容
- [x] 保证新增算法时不需要重写布局

交付物：

- 可比较的算法页
- 可扩展的算法详情展示

完成标准：

- 不打开弹层也能比较四种算法
- 打开弹层后可以看到更深一层内容

当前结果：

- 算法页已改为“左侧选择 + 右侧详情”
- 默认算法和切换逻辑已生效
- 主页面已承接基础比较，弹层仅保留附录式深度说明
- 已完成一次真实渲染检查和切换联动检查

回退措施：

- 若左右布局拥挤，退回为“上方列表 + 下方详情”
- 若信息过多压垮主页面，把公式和延伸说明移入弹层

---

## P4 Handshake 与 Migration

目标：

- 建立工程场景与迁移建议两条落地路径

优先级：

- 高

依赖：

- P1
- 建议在 P3 之后进行

Todo：

- [x] 补入 `classical TLS` 基线场景
- [x] 补入 `hybrid TLS` 详细对比信息
- [x] 补入 `IKEv2 + ML-KEM` 场景信息
- [x] 定义统一的比较指标数组
- [x] 设计对象尺寸和开销对比组件
- [x] 设计工程风险说明区
- [x] 设计系统画像输入项
- [x] 设计 Migration 结果卡结构
- [x] 设计 Migration 建议优先级或排序方式
- [x] 确保新增协议场景时不需要改主结构

交付物：

- 工程场景比较页
- 可交互的 Migration Lab

完成标准：

- 页面能回答“比传统方案大多少、影响什么、先迁什么”
- 勾选不同画像时，结果会明显变化

当前结果：

- 第四屏已升级为 `Deployment & Migration Lab`
- Handshake 已支持 `classical / hybrid / IKEv2` 三场景比较
- Migration 已支持画像勾选和结果生成
- 已完成真实渲染检查、场景切换检查和勾选联动检查

回退措施：

- 若图形化比较不稳定，先使用数值卡片 + facts grid
- 若规则排序复杂，先做固定建议组输出

---

## P5 详情层统一

目标：

- 把详情层改成真正可扩展的知识容器

优先级：

- 中高

依赖：

- P1
- 建议在 P3、P4 之后进行

Todo：

- [x] 定义 detail data 协议
- [x] 定义内容块类型
- [x] 抽离标题区、关闭逻辑、内容容器
- [x] 统一 `algorithm` 详情
- [x] 统一 `principle` 详情
- [x] 统一 `handshake` 详情
- [x] 预留 `migration` 详情接入能力
- [x] 确保新增知识类型时可以通过块类型扩展

交付物：

- 统一详情层框架
- 至少三类主题可复用同一详情机制

完成标准：

- `openDetail()` 不再堆大量 HTML 分支
- 新增一种详情内容时主要改数据，不主要改逻辑

当前结果：

- 已建立统一 `detailDocuments` 数据入口
- `summary / factGrid / bulletList` 已作为首批块类型接入
- `principle / algorithm / handshake` 已改走统一详情通道
- `migration` 详情仍预留，后续可按同一协议补入

回退措施：

- 若统一 renderer 复杂度过高，先统一外框与数据入口
- 若弹层交互受影响，优先恢复弹层稳定开合

---

## P6 导航、移动端与样式整理

目标：

- 提升交付完整度和长期维护性

优先级：

- 中

依赖：

- P2、P3、P4、P5 基本完成

Todo：

- [x] 增加键盘切页支持
- [x] 增加触摸交互或移动端降级逻辑
- [x] 处理 URL hash 同步
- [x] 修复移动端高度与 padding 问题
- [x] 提取高频布局类
- [x] 提取高频卡片类
- [x] 提取事实块、步骤块、详情块样式
- [x] 增加 favicon
- [x] 增加 meta description
- [x] 增加页脚基线与来源说明

交付物：

- 可键盘操作、可移动端浏览的站点
- 更干净的样式层

完成标准：

- 不用滚轮也能浏览
- 手机端主要内容不炸布局
- 404 favicon 消失

当前结果：

- 已补键盘导航、触摸逻辑和 URL hash 同步
- 已对移动端降级为自然滚动，并修正主要布局
- 已补 `favicon`、`meta description` 和页脚基线说明

回退措施：

- 若移动端全屏翻页体验差，移动端直接降级为自然滚动
- 若样式抽离出现视觉回归，回退对应组件的 class 抽离
- 若 URL hash 状态不稳，先保留内部状态控制

---

## 推荐执行顺序

- [ ] 先完成 P0
- [ ] 再完成 P1
- [ ] 然后做 P2
- [ ] 接着做 P3
- [ ] 再做 P4
- [ ] 然后做 P5
- [ ] 最后做 P6

---

## 最小可交付版本

如果中途需要先交付一个可展示版本，优先保证以下事项完成：

- [ ] Hero 有事实卡
- [ ] Principles 能清楚区分三条路线
- [ ] Algorithms 能比较四种算法
- [ ] Handshake 能比较 classical / hybrid / IKEv2
- [ ] 页脚写清资料基线

只要上面这五项完成，项目就已经不再是“纯样式页”，而是一个可演示的 PQC 站点。
