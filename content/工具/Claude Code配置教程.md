---
title: "Claude Code 配置教程"
description: "安装 Claude Code，通过 Messages 接口配置密钥、模型并验证会话。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Claude Code 配置教程

先准备 CertaEdge <PlatformLink to="keys">API Key</PlatformLink>和支持 **Anthropic Messages 与工具调用**的<PlatformLink to="models">模型 ID</PlatformLink>。

## 1. 安装并检查

官方原生安装方式不要求先安装 Node.js。按系统选择一组命令。

macOS / Linux / WSL：

```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

Windows PowerShell：

```powershell
irm https://claude.ai/install.ps1 | iex
claude --version
```

安装后找不到 `claude` 时先打开新终端，再检查版本。Windows 使用 Git Bash 功能时，按[官方安装说明](https://code.claude.com/docs/en/setup)安装 Git for Windows；WSL 的安装和配置在 WSL 内完成。

## 2. 设置当前终端的连接信息

先用临时环境变量测试。把密钥与模型两个占位值换成自己的配置，服务地址不追加 `/v1/messages`。

macOS / Linux / WSL：

```bash
export ANTHROPIC_BASE_URL='https://certaedge.com'
export ANTHROPIC_AUTH_TOKEN='sk-YOUR_API_KEY'
export ANTHROPIC_MODEL='YOUR_MODEL_ID'
claude
```

Windows PowerShell：

```powershell
$env:ANTHROPIC_BASE_URL = 'https://certaedge.com'
$env:ANTHROPIC_AUTH_TOKEN = 'sk-YOUR_API_KEY'
$env:ANTHROPIC_MODEL = 'YOUR_MODEL_ID'
claude
```

在同一终端启动；换终端后需重新设置。若曾配置其他服务商，不要混用它的地址、密钥与模型设置。

![Claude Code 连接 CertaEdge 的环境变量示意](/images/configuration/claude-code.svg)

*图为字段示意，不是客户端实测截图。*

## 3. 验证会话

进入准备用于测试的项目目录，先询问“解释这个项目的目录结构，不要修改文件”。确认能收到回复，并在<PlatformLink to="logs">使用日志</PlatformLink>中找到对应调用。

只有主对话成功、后台子任务却请求不可用模型时，检查该版本支持的 `ANTHROPIC_DEFAULT_HAIKU_MODEL`、`ANTHROPIC_DEFAULT_SONNET_MODEL`、`ANTHROPIC_DEFAULT_OPUS_MODEL` 映射；分别填写账号可用且兼容的模型 ID。不要把客户端默认的模型别名当成平台已经开放的 ID。

## 4. 需要持久保存时

测试成功后，可将连接字段合并到**用户目录**的配置文件：macOS/Linux 为 `~/.claude/settings.json`，Windows 为 `%USERPROFILE%\.claude\settings.json`。

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://certaedge.com",
    "ANTHROPIC_AUTH_TOKEN": "sk-YOUR_API_KEY",
    "ANTHROPIC_MODEL": "YOUR_MODEL_ID"
  }
}
```

已有 `env` 对象时只添加或更新其中的这三个字段，不再创建第二个 `env`。保存标准 JSON，不加入注释，保留其他已有设置；包含真实密钥的配置不要提交到公共仓库。修改后开启新会话验证。

## 遇到问题

401 时检查完整令牌；404 时检查 Messages 协议和地址；工具调用失败时检查模型能力。完整排查顺序见[常见问题](/getting-started/troubleshooting)。官方说明见 [Claude Code 自定义网关配置](https://code.claude.com/docs/en/llm-gateway)。
