# PQC Training Lab 基线确认

## 1. 本轮开发基线

当前内容回灌与结构扩展工作，以当前主分支最新模块化版本为代码基线：

- 当前基线提交：`ea07ae4`
- 含义：页面已完成模块化拆分，现有代码结构已基本稳定

历史上的关键视觉重写节点：

- `71f36a2`
  将站点重写为全屏沉浸式实验室 UI
- `389ffad` 至 `a7786e4`
  主要围绕背景、导航、视觉稳定性和布局做连续修正
- `ea07ae4`
  将最终样式重构结果收束为 `app + components + data + visuals` 结构

结论：

- 本轮不再把“重新设计一套新 UI”作为目标
- 本轮以“在当前视觉骨架中重新注入知识内容和工程判断”为目标

## 2. 内容来源清单

### 2.1 原版知识来源

主要参考仓库：

- `/home/zzzx/Documents/pqc-sharing-kit`

优先使用内容：

- `notes/cheatsheet.md`
  用于首屏基础定义、关键时间点、迁移优先级
- `notes/speaker_notes.md`
  用于普通工程受众的讲述顺序
- `notes/expert_speaker_notes.md`
  用于技术深度和工程解释主线
- `notes/sources.md`
  用于事实口径维护基线

### 2.2 可直接迁入的数据来源

主要参考文件：

- `pqc-sharing-kit/demo/public/app.js`
- `pqc-explorer.zip` 中的 `src/data.ts`

当前确认可直接迁入的内容：

- `handshakeMetrics`
- `handshakeScenarios`
- `algorithms`
- `migrationRules`

这些内容已经比当前项目中的 `public/data.js` 更完整，可作为 `P1` 的主要输入。

## 3. 当前项目中必须保留的视觉特征

本轮内容回灌过程中，以下视觉方向默认保留：

- 全屏翻页式主轴结构
- 深色科幻 / 实验室风格背景
- 左侧极简圆点导航
- 大号 Hero 标题与视觉网络图
- 玻璃卡片 + 赛博角标语言
- 详情层从底部滑入的沉浸式体验

允许调整的范围：

- 卡片内部信息密度
- 页面中的局部布局
- 各屏内容组织方式
- 详情层内部内容结构

默认不优先修改的范围：

- 整体配色方向
- 页面总导航形式
- Hero 核心视觉风格
- 全站沉浸式语气

## 4. 本轮优先补的内容

当前优先级明确如下：

1. 建立可扩展数据模型
2. 补齐 Hero 与 Principles 的认知入口
3. 重做 Algorithms 为真正可比较页面
4. 重做 Handshake 并加入 Migration
5. 统一详情层的内容承载方式

暂不优先：

- 彻底样式翻新
- 技术栈迁移
- 后端功能

## 5. P1 的直接输入

P1 数据层重建时，建议先迁入以下内容：

### Hero

从 `cheatsheet.md` 与讲稿中提取：

- PQC 一句话定义
- 三个关键日期
- HNDL 风险说明
- 迁移时间尺度提示

### Principles

从专家讲稿中提取：

- lattice / hash / code 三条路线的直觉解释
- 各自代表算法
- 各自工程含义

### Algorithms

从 `src/data.ts` 迁入：

- 算法家族
- 角色
- 对象尺寸
- facts
- pathSteps
- formula
- takeaway

### Handshake / Migration

从 `src/data.ts` 迁入：

- classical TLS / hybrid TLS / IKEv2 + ML-KEM
- compare 指标
- facts
- notes
- migrationRules

## 6. 本轮开发的边界

为了避免目标再次漂移，本轮默认边界如下：

- 目标是“内容回灌 + 结构扩展”
- 不是“再做一轮纯样式重构”
- 不是“把站点先改成 React 再说”
- 不是“引入复杂在线数据源”

## 7. 下一步

P0 结束后，直接进入 `P1 数据与内容底座`：

- 先改 `public/data.js`
- 先兼容旧组件
- 再逐步升级每个页面的消费方式
