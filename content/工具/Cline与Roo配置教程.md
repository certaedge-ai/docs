---
title: "Cline / Roo 配置教程"
description: "分别设置代码助手的 OpenAI Compatible 提供商并验证读取项目。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Cline / Roo 配置教程

先准备 CertaEdge <PlatformLink to="keys">API Key</PlatformLink>和支持工具调用的<PlatformLink to="models">模型 ID</PlatformLink>。Cline 与 Roo 是两个独立扩展，使用哪一个就配置哪一个。

## 1. 安装并打开设置

在 VS Code 扩展市场安装 Cline 或 Roo Code，也可以从 [Cline 官方说明](https://docs.cline.bot/getting-started/installing-cline)与 [Roo 官方说明](https://docs.roocode.com/)进入安装链接。

打开扩展侧栏，再点击扩展自己的齿轮按钮进入 API / 模型设置，不在 VS Code 通用设置里寻找这些字段。

## 2. 设置 OpenAI Compatible

在 Cline 或 Roo 的 **API Provider** 选择 **OpenAI Compatible**，填写：

| 字段 | 内容 |
| --- | --- |
| Base URL | `https://certaedge.com/v1` |
| API Key | 从平台复制的完整密钥 |
| Model ID / Model | 支持工具调用的真实模型 ID |

若需要填写 Context Window、Max Output Tokens，按模型信息填写；不确定时先保留客户端默认设置并测试短任务，不勾选未确认支持的视觉、计算机使用等功能。

![Cline 与 Roo 的 CertaEdge 连接字段示意](/images/configuration/cline-roo.svg)

*图为公共配置字段示意，设置位置以实际版本为准。*

## 3. 保存并确认当前模式

保存设置。有的版本会分别设置 Plan 和 Act 模式使用的模型，首次测试让两个模式都选择刚配置的 CertaEdge 提供商与模型，避免切换模式后又使用旧配置。

提供连接验证按钮时先验证一次；没有该按钮时直接开始下一步的短任务。

## 4. 验证对话和工具调用

在 VS Code 打开一个用于测试的项目文件夹，发起“只列出这个项目的主要目录，不要修改文件”。按扩展提示确认读取权限。

能收到回复、完成读取目录，并在<PlatformLink to="logs">使用日志</PlatformLink>中看到请求后，再尝试正式任务。

聊天可用但工具调用失败时，检查目标模型的工具调用格式与客户端兼容性。不要把“能读取模型列表”当成 Agent 已经可用。

401、404 等错误按[排错说明](/getting-started/troubleshooting)处理。配置字段可对照 [Cline OpenAI Compatible](https://docs.cline.bot/provider-config/openai-compatible)与 [Roo OpenAI Compatible](https://docs.roocode.com/providers/openai-compatible)。
