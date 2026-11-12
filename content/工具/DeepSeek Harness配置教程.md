---
title: "DeepSeek Harness 配置教程"
description: "启动 Web UI，添加 CertaEdge 自定义模型 API 并运行首个会话。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# DeepSeek Harness 配置教程

本篇对应 DeepSeek 官方的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，使用 Web UI 的 **Custom model API** 接入 CertaEdge，不把 CertaEdge 密钥填进内置 DeepSeek 官方密钥栏。

## 1. 启动 Web UI

安装 [Node.js](https://nodejs.org/) **24.9.0 或更新版本**。在终端进入准备使用的项目目录，然后执行：

```bash
node --version
npx @deepseek-ai/dsh web
```

首次运行按终端提示确认下载。保持该终端运行，打开它打印的地址，默认是 `http://127.0.0.1:3080`。端口被占用或在远程服务器运行时，以终端输出为准。

## 2. 添加 CertaEdge 自定义接口

打开 **Settings → Models → Add model provider**，切换到 **Custom model API**，填写：

| 字段 | 填写内容 |
| --- | --- |
| Provider ID | `certaedge`，创建后不随意改名 |
| 显示名称 | `CertaEdge` |
| Base URL | `https://certaedge.com/v1` |
| API protocol | **OpenAI Chat Completions** |
| API Key / Credential | 在<PlatformLink to="keys">控制台</PlatformLink>复制的完整密钥 |
| Model catalog | 至少添加一个支持 Chat Completions 和工具调用的真实模型 ID |

可点击 **Fetch available models** 获取模型，在列表中选择后点击 **Add selected**；拉取失败时可手动添加<PlatformLink to="models">模型目录</PlatformLink>中的完整 ID。最后保存提供商，仅获取列表不会自动保存配置。

![DeepSeek Harness 的 CertaEdge 自定义模型配置示意](/images/configuration/deepseek-harness.svg)

*图为字段示意，设置名称以当前官方版本为准。*

## 3. 选择工作区和模型

点击 **Choose workspace**，添加并选中准备使用的项目目录。未选择工作区时，会话输入区不能正常开始工作。

新建会话，在模型选择器中选择 `CertaEdge` 下刚添加的模型。先发送“概括这个项目的目录结构，不要修改文件”，确认回复与<PlatformLink to="logs">调用记录</PlatformLink>都正常，再开始实际任务。

## 遇到问题

- 启动失败：确认 Node.js 版本满足要求，再按终端提示检查安装或端口。
- 保存后密钥变成隐藏状态：这是凭证保护，不表示密钥丢失，先发起简短请求验证。
- 能获取模型但无法执行任务：检查模型是否支持工具调用，且会话选中了正确模型。
- 要使用 Responses 或 Messages：新增对应协议的提供商配置，地址也随协议调整，不只修改协议名称。

进一步说明见 [官方快速开始](https://deepseek-harness.github.io/deepseek-harness/en/guide/quickstart)与[自定义模型配置](https://deepseek-harness.github.io/deepseek-harness/en/guide/providers)。
