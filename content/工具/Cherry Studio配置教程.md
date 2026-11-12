---
title: "Cherry Studio 配置教程"
description: "按 Cherry Studio 2.1.10 的自定义提供商设置接入 CertaEdge，选择模型并检测启用。"
reviewStatus: adapted
updatedAt: "2026-11-05"
---

# Cherry Studio 配置教程

本教程按 **Cherry Studio 2.1.10**（2026-10-31 发布的稳定版）编写。先通过 **OpenAI / Chat Completions** 完成一次普通对话，再添加其他协议。

## 1. 安装和准备

从 [Cherry Studio 官方稳定版发布页](https://github.com/CherryHQ/cherry-studio/releases/latest)安装与你的系统匹配的版本。已有客户端时，在 **设置 → 关于**核对版本，升级后再按下面的步骤操作。

准备以下两项：

- CertaEdge <PlatformLink to="keys">完整 API Key</PlatformLink>，以及可用的账号余额和密钥额度。
- <PlatformLink to="models">模型目录</PlatformLink>中**有可用渠道且支持 Chat Completions** 的完整模型 ID。不要选择仅供展示、无可用渠道的模型，也不要用显示名称代替 ID。

## 2. 添加服务商

1. 打开 **设置 → 模型服务**，点击 **添加服务商**，进入 **添加自定义提供商**。
2. 按下表填写。**从预设创建（可选）** 保持空白，本教程使用自定义端点。

| 字段 | 填写内容 |
| --- | --- |
| 提供商名称 | `CertaEdge` |
| API 密钥 | 从控制台复制的完整密钥；只填密钥本身，不加 `Bearer `，不填打码文本 |
| 端点设置 → OpenAI | `https://certaedge.com` |
| 默认端点 | 保持 OpenAI 为“默认” |
| Anthropic、更多设置中的其他端点 | 首次配置先留空 |

3. 核对 **OpenAI** 地址下方的**请求路径**，应显示 `https://certaedge.com/v1/chat/completions`，再点击 **添加**。若下一步要求 API 密钥，在同一配置流程中填入上面的完整密钥。

地址填写规则：

- 推荐直接复制 `https://certaedge.com`，客户端会为 OpenAI 端点补齐 `/v1/chat/completions`。
- 2.1.10 也能识别已经带 `/v1` 的地址；它不是另一套接口。本教程统一使用根地址，便于区分不同协议的版本路径。
- 不要把 `/chat/completions`、`/models` 或网页地址 `/pricing` 填进端点字段，也不要在末尾加 `#`。这些特殊写法会改变请求路径。

![Cherry Studio 接入 CertaEdge 的配置字段示意](/images/configuration/cherry-studio.svg)

*图为 2.1.10 自定义提供商的字段示意，不是软件实拍截图。“OpenAI”是端点字段；Python SDK 的 `base_url` 仍使用 `https://certaedge.com/v1`。*

## 3. 添加并启用模型

添加服务商后，可能直接进入 **选择模型** 引导；也可以从服务商详情页点击 **获取模型列表**。

1. 从返回列表中选择刚才确认可调用的模型。引导页勾选模型后点击 **下一步**；详情页的模型管理列表则点击模型右侧的 `+` 加入。仅获取列表还没有完成添加。
2. 列表为空或获取失败时，点击 **手动添加模型**。**模型 ID**粘贴平台提供的完整 ID；**模型名称**仅供显示；若要求选择**模型用途 / 对话协议 / 端点类型**，选择 **对话 → OpenAI**，对应 Chat Completions。
3. 在引导页点击 **检测并启用**，等待“验证模型可用性”和“启用服务商”完成，再点击 **完成**。从详情页操作时，点击 **检测**选择该模型，检测成功后确认右上角启用开关已打开。

检测会发送模型请求，可能产生费用。出现错误时先按下方说明处理，不要把“获取到模型列表”当成已经可以对话，也不要通过“跳过”代替验证。

## 4. 开始对话

返回聊天页，新建普通聊天，在模型选择器中明确选择 **CertaEdge → 刚添加的模型**，发送“请用一句话介绍自己”。

确认以下三项，再继续配置自己的工作流：

- 收到模型的文本回复。
- <PlatformLink to="logs">使用日志</PlatformLink>中出现这次调用，模型 ID 与所选模型一致。
- 该条记录的状态、用量和费用正常。聊天窗口有回复但平台没有对应记录时，先检查是否选到了其他服务商。

**需要其他协议时：** 在服务商的端点设置中按需添加；OpenAI Responses、Anthropic、Gemini 的地址均可填写根地址 `https://certaedge.com`。对应请求路径分别为 `/v1/responses`、`/v1/messages`、`/v1beta/models/模型ID:generateContent`。同时将模型的对话协议设为对应端点，并确认平台模型支持该协议。只支持 Responses 或 Messages 的模型不能强行用 OpenAI / Chat Completions 检测。

## 遇到问题

| 现象 | 检查与处理 |
| --- | --- |
| 地址栏下方不是 `/v1/chat/completions` | 确认填写的是自定义提供商的 OpenAI 端点，按上表恢复根地址，检查是否残留完整路径或 `#` |
| 获取到模型，但聊天中找不到 | 在引导中选中模型并完成检测启用，或在模型列表点 `+`；确认服务商启用开关已打开 |
| 模型列表为空 / 获取失败 | 先核对密钥与地址，再用平台模型目录中的真实 ID 手动添加；模型必须有可用渠道 |
| 401 | 检查是否复制了完整、未过期且启用的密钥；API 密钥字段不加 `Bearer ` |
| 余额、额度或分组权限错误 | 分别检查账号余额、密钥独立额度、分组和模型限制；充值不会自动提高密钥额度 |
| 404 / 模型不支持此接口 | 同时核对请求路径、完整模型 ID 和对话协议；Responses、Messages 与 Chat Completions 不能互换 |
| 429 / 请求过于频繁 | 读取完整错误信息，检查限流和上游容量，等待后重试；不要只按余额不足处理 |
| 连接失败、TLS 错误或返回 HTML | 检查域名、HTTPS、代理和端点地址；页面能打开不代表模型接口已连通 |
| 已保存但仍使用其他服务商 | 在当前聊天的模型选择器里重新选择 CertaEdge，并用平台日志核对实际请求 |

字段与操作参照 [官方自定义服务商说明](https://github.com/CherryHQ/cherry-studio-docs/blob/main/pre-basic/providers/zi-ding-yi-fu-wu-shang.md)和[官方模型服务设置](https://github.com/CherryHQ/cherry-studio-docs/blob/main/pre-basic/settings/providers.md)。后续版本的按钮名称可能变化，可先核对本文顶部的适用版本。
