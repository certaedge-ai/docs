---
title: "Codex 配置教程"
description: "安装 Codex CLI，在用户配置中添加 CertaEdge 并验证 Responses 调用。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Codex 配置教程

本篇适用于独立运行的 **Codex CLI**。先准备 CertaEdge <PlatformLink to="keys">API Key</PlatformLink>，以及支持 **Responses 和工具调用**的<PlatformLink to="models">模型 ID</PlatformLink>；Chat Completions 示例能成功，不代表该模型可用于 Codex。

## 1. 安装 CLI

安装 [Node.js 当前 LTS 版本](https://nodejs.org/)，打开新终端后执行：

```bash
node --version
npm --version
npm install -g @openai/codex
codex --version
```

看到 `codex` 版本号才继续。Windows 可以使用 PowerShell；如果在 WSL 中运行，以下配置和环境变量都应设置在同一个 WSL 环境内。更多安装方式见 [Codex 官方说明](https://developers.openai.com/codex/cli/)。

## 2. 打开用户级配置文件

| 系统 | 文件位置 |
| --- | --- |
| macOS / Linux / WSL | `~/.codex/config.toml` |
| Windows PowerShell | `%USERPROFILE%\.codex\config.toml` |

没有 `.codex` 目录或文件时手动创建。若自行设置了 `CODEX_HOME`，使用该目录下的 `config.toml`。已有配置先备份，再合并下面的字段。

**提供商配置放在用户级文件中，不放进项目目录下的 `.codex/config.toml`。** `model_provider` 和 `model` 两个顶层字段应放在文件第一个 `[表名]` 之前；避免把它们粘到已有表的末尾，也不要重复同名字段。

```toml
model_provider = "certaedge"
model = "YOUR_MODEL_ID"

[model_providers.certaedge]
name = "CertaEdge"
base_url = "https://certaedge.com/v1"
wire_api = "responses"
env_key = "CERTAEDGE_API_KEY"
```

把 `YOUR_MODEL_ID` 换成支持 Responses 的真实 ID。`env_key` 填的是环境变量名称，不是密钥本身。

![Codex 接入 CertaEdge 的配置字段示意](/images/configuration/codex.svg)

*图为字段示意，不是客户端实测截图。*

## 3. 在启动终端设置密钥

macOS / Linux / WSL：

```bash
export CERTAEDGE_API_KEY='sk-YOUR_API_KEY'
```

Windows PowerShell：

```powershell
$env:CERTAEDGE_API_KEY = 'sk-YOUR_API_KEY'
```

替换为自己的完整密钥。变量只对当前终端及其子进程生效；从桌面图标启动的应用通常不会读取这次临时设置。

## 4. 启动新会话并验证

进入准备使用的项目目录，在设置了密钥的同一终端运行：

```bash
codex
```

先发起“只概括项目的目录结构，不要修改文件”。确认当前提供商和模型正确、收到回复，并在<PlatformLink to="logs">使用日志</PlatformLink>中看到请求，再开始正式使用。

配置不会自动改变已经运行的旧会话。测试前退出旧 CLI 并重新运行，不需要删除原有登录记录。

## 遇到问题

| 现象 | 处理方式 |
| --- | --- |
| 缺少 `CERTAEDGE_API_KEY` | 在启动 Codex 的同一终端重新设置，不要只在另一个窗口设置 |
| TOML 解析或重复字段错误 | 检查顶层位置、双引号以及是否已有同名字段或表 |
| 仍使用其他提供商 | 确认编辑了用户级文件，检查 `CODEX_HOME` 和启动时是否另选了 profile |
| 401 / 404 / 工具调用失败 | 检查密钥、模型 ID、Responses 支持和权限；参考[排错说明](/getting-started/troubleshooting) |

字段依据 [OpenAI 官方配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)核对；桌面应用、扩展和云端产品需要分别确认配置支持范围。
