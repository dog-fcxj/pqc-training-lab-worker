# PQC Training Lab Worker

面向网络与安全场景的 PQC 演示站点，适合直接部署到 Cloudflare Workers。

## 目录

- `public/`：静态前端资源
- `src/worker.js`：Worker 入口
- `wrangler.jsonc`：部署配置

## 本地运行

```bash
npx wrangler dev
```

## 部署

```bash
npx wrangler deploy
```

## 页面结构

- `Handshake Lab`：对比 classical TLS、hybrid TLS、IKEv2 + ML-KEM 的对象尺寸与握手口径
- `Algorithm Lab`：展示 ML-KEM、ML-DSA、SLH-DSA、HQC 的数学对象、运算路径与部署角色
- `Migration Lab`：根据系统画像生成迁移结果
