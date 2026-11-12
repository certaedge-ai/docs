---
title: "CC Switch 配置教程"
description: "使用平台导入入口或自定义提供商配置，并确认实际启用状态。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# CC Switch 配置教程

先从 [CC Switch 官方发布页](https://github.com/farion1231/cc-switch/releases)安装客户端，再安装准备使用的 Codex CLI 或 Claude Code。CC Switch 管理连接配置，不代替这些工具本身。

## 方式一：从 CertaEdge 导入

1. 登录后打开<PlatformLink to="keys">API 密钥</PlatformLink>页面，找到已创建且可用的密钥。
2. 打开该行操作菜单，选择 **CC Switch**。
3. 选择目标应用，例如 Claude 或 Codex，名称可改为 `CertaEdge`。
4. 在“主模型”选择或手动填写真实模型 ID。Codex 需要 Responses，Claude Code 需要 Messages 与工具调用。
5. 点击“打开 CC Switch”，在系统提示中选择已安装的 CC Switch。
6. 在导入确认界面检查地址、密钥与模型，确认后保存。

导入链接包含密钥，不要分享链接或把它粘到公开网页。没有唤起应用时，确认 CC Switch 安装在当前电脑上，并允许系统打开其专用链接。

## 方式二：手动添加

1. 在 CC Switch 选择目标应用。首次接入优先使用直连方式，避免同时改动本地路由规则。
2. 点击“添加供应商”，选择“自定义配置”。
3. 名称填写 `CertaEdge`，按下表填写端点和从<PlatformLink to="keys">控制台</PlatformLink>复制的密钥。
4. 在该应用的模型设置中填写<PlatformLink to="models">实际可用模型 ID</PlatformLink>，再点击添加。

| 目标应用 | 地址 | 要求 |
| --- | --- | --- |
| Claude Code | `https://certaedge.com` | Messages 与工具调用 |
| Codex CLI | `https://certaedge.com/v1` | Responses 与工具调用 |

表单要求编辑 JSON/TOML 时，分别参照 [Claude Code](/tools/claude-code)与 [Codex](/tools/codex)的字段；注意 CC Switch 会管理凭证写入，手工配置环境变量与 CC Switch 的管理方式不要混用。

![CC Switch 中 CertaEdge 提供商的字段示意](/images/configuration/cc-switch.svg)

*图为字段示意。不同版本的表单可能不同。*

## 确认真正启用

点击 CertaEdge 卡片上的“切换”或“启用”，确认显示“使用中”。仅保存卡片或查看“直连”标签，不代表配置已经生效。

Codex CLI 退出后重新运行；桌面版需要彻底退出再打开。Claude Code 新版本可热加载，无法确认时重开会话再测试。

发送一条简短请求，确认目标模型返回，并在<PlatformLink to="logs">使用日志</PlatformLink>中找到记录。如果当前仍处于路由或聚合模式，先核对实际转发目标，不只看正在查看的标签页。
