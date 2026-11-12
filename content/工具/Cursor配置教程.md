---
title: "Cursor 配置教程"
description: "在支持自定义 Base URL 的 Cursor 版本中连接 CertaEdge。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Cursor 配置教程

::: warning 先确认版本是否支持
本教程只适用于模型设置中提供 **Override OpenAI Base URL** 或同等自定义接口地址选项的 Cursor 版本。只有 OpenAI API Key 输入框、却没有地址覆盖功能时，不能按本教程直连 CertaEdge；改用 [Cherry Studio](/tools/cherry-studio)或 [Cline / Roo](/tools/cline-roo)等支持自定义地址的客户端。
:::

按 [Cursor 官网](https://cursor.com/)安装客户端并登录。准备 CertaEdge <PlatformLink to="keys">API Key</PlatformLink>和支持 **Chat Completions** 的<PlatformLink to="models">模型 ID</PlatformLink>。

## 1. 先设置自定义地址

1. 打开 **Cursor Settings → Models**，找到 OpenAI 相关配置。
2. 确认存在并启用 **Override OpenAI Base URL** 或对应选项。
3. 地址填写 `https://certaedge.com/v1`，不要填写完整的 `/chat/completions`。
4. 再在对应 API Key 字段粘贴 CertaEdge 密钥，保存或执行界面提供的验证。

先确认地址覆盖生效，再测试密钥，避免把平台密钥发送到默认 OpenAI 地址。

![Cursor 接入 CertaEdge 的配置字段示意](/images/configuration/cursor.svg)

*图为具备地址覆盖功能时的字段示意，不表示所有 Cursor 版本都有这些选项。*

## 2. 选择模型并发起请求

在当前版本允许添加自定义模型时，添加从平台复制的完整 ID 并启用。回到聊天窗口明确选择这个模型，不使用 Auto 模式做首次验证。

发送一条短消息，再打开<PlatformLink to="logs">使用日志</PlatformLink>核对。只有看到预期的模型调用，才能确认当前会话实际经过 CertaEdge。

## 功能范围与排错

- 自定义 API Key 的功能范围由 Cursor 决定；Tab 补全仍使用其内置模型，不会因此切换到 CertaEdge。
- 当前版本不能添加目标模型、没有地址覆盖选项或拒绝第三方接口时，不能通过改一个密钥字段解决。
- 401 检查密钥和覆盖选项；404 检查模型 ID 和协议；没有平台调用记录时，先检查会话实际选择的模型。

Cursor 的普通自带密钥流程见[官方 API Key 说明](https://cursor.com/help/models-and-usage/api-keys)。其中的默认 OpenAI 配置不能直接当成第三方接口配置。
