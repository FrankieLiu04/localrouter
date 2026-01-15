# LocalRouter

本地 OpenAI 兼容 API 路由器（DeepSeek 首发），提供跨平台桌面应用（macOS / Windows / Linux）与本地代理服务。

## About
LocalRouter 运行在本机，向外提供 OpenAI 兼容的 Base URL，并把请求转发到指定 Provider。当前首发支持 DeepSeek，后续会以适配器形式扩展更多 Provider。

## 亮点
- OpenAI 兼容接口：`/v1/chat/completions`、`/v1/models`
- 本地 API Key：保护本机代理接口
- DeepSeek Provider（首发）
- 托盘菜单 + 独立窗口配置
- 本地余额查询：`/v1/balance`

## 运行截图
> TODO：补充截图

## 快速开始（开发模式）
1. 安装依赖：`npm install`
2. 启动开发：`npm run dev`

## 本地 API 用法
- Base URL：`http://127.0.0.1:8787/v1`
- 需要本地 API Key：`Authorization: Bearer <Local API Key>`

## 配置说明
- Provider：当前仅 DeepSeek
- DeepSeek API Key：用于上游请求
- Local API Key：用于访问本机代理

## 打包（Package）
- 开发构建：`npm run build`
- 生成安装包：`npm run dist`

## 发布（Release）
- 创建 Git Tag：`v*` 会触发 GitHub Actions Release 流程
- Release 产物：macOS `.dmg`、Windows `.exe`、Linux `.AppImage`

## 开源协议
MIT
