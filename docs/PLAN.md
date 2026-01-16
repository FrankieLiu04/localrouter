# LocalRouter (Cross-platform) Plan

> 目标：本地实现一个 OpenAI 兼容 API 的路由代理（localrouter），并提供跨平台桌面应用（macOS/Windows/Linux）的托盘/菜单栏与独立窗口的可视化管理。首个 Provider 仅支持 DeepSeek 官方 API，后续以插件化适配其他厂商。

## 1. 产品范围与形态
- **本地代理服务**：在用户本机提供 OpenAI 兼容 API（HTTP + SSE）。
- **跨平台 UI**：托盘/菜单栏小图标 + 独立窗口（macOS/Windows/Linux）。
- **零配置启动**：首次运行向导 + 默认端口 + 模板配置。
- **安全存储**：系统凭据存储（Keychain/Windows Credential Manager/libsecret），日志脱敏。

## 2. 核心功能（MVP）
### 2.1 OpenAI 兼容 API（必做）
- `POST /v1/chat/completions`（含流式 SSE）
- `GET /v1/models`（提供本地可用模型列表）
- 统一错误格式（OpenAI-style error）
- 基础用量统计（prompt/completion tokens）

### 2.2 Provider：DeepSeek（首发）
- 仅支持官方 API
- 模型映射：OpenAI model name ↔ DeepSeek model name
- 统一超时、重试、错误转换

### 2.3 UI（菜单栏 + 独立窗口）
- 菜单栏：运行状态、当前端口、请求数、错误数
- 独立窗口：
  - Provider 配置（DeepSeek Key、模型映射）
  - 路由策略（单 Provider）
  - 请求日志查看（可开关）
  - 健康检查与诊断

## 3. 技术方案（Electron + Node/TS）
### 3.1 架构
- **App**：Electron + TypeScript（主进程 + 渲染进程）
- **Local Server**：Node.js（HTTP + SSE）
- **数据层**：
  - 配置：本地 JSON/YAML
  - 密钥：系统凭据存储（建议使用 keytar）
- **模块化**：Provider Adapter 协议 + 可扩展 registry

### 3.2 Provider 适配器设计（草案）
- `ProviderAdapter` 协议
  - `sendChatCompletion(request)`
  - `streamChatCompletion(request)`
  - `listModels()`
- 统一的错误对象与使用统计

## 4. GitHub Actions（从 Day 1 建立）
### 4.1 必备流水线
- **CI**：
  - macOS-latest / windows-latest / ubuntu-latest 构建
  - ESLint + TypeScript 检查
  - 单元测试
- **Release**：
  - 打包签名（后续接入证书）
  - 生成 dmg/zip/exe/AppImage
  - 发布 Release

### 4.2 质量门禁
- PR 必须通过构建与测试
- 版本号与变更日志校验

## 5. 里程碑
### Milestone 1：MVP
- 本地代理 HTTP 服务（含 SSE）
- DeepSeek Adapter
- OpenAI 兼容 `chat.completions`
- 菜单栏状态展示

### Milestone 2：UI 完善
- 独立窗口配置页
- 日志与诊断
- 跨平台凭据存储接入

### Milestone 3：多 Provider 支持
- 适配器插件化
- Model router + fallback

## 6. 风险与对策
- **SSE 稳定性**：Node HTTP 流与 backpressure 处理
- **Token 统计不一致**：以 provider 响应为准，必要时可引入本地估算
- **安全问题**：系统凭据存储 + 日志脱敏 + 默认仅监听 localhost

## 7. 后续扩展（非 MVP）
- `embeddings` / `completions` / `responses` 端点
- 多 Provider 负载均衡
- 规则引擎（用户策略、路由权重）
- 自动更新（electron-updater）

## 8. 参考文档
- DeepSeek API 文档：见 [Deepseek_API_DOC.md](Deepseek_API_DOC.md)
