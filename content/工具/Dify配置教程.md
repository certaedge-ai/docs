---
title: "Dify 配置教程"
description: "安装明确的兼容插件、填写模型必填字段并验证最小应用。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Dify 配置教程

先准备已可登录的 Dify 工作空间、CertaEdge <PlatformLink to="keys">API Key</PlatformLink>，以及支持 Chat Completions 的<PlatformLink to="models">完整模型 ID</PlatformLink>。

## 1. 安装兼容提供商

打开 Dify **设置 → 模型供应商**，在待安装供应商或 Marketplace 中查找 **OpenAI-API-compatible**。选择官方维护的对应插件，安装后打开其卡片并添加模型。

这里明确使用兼容插件，不把 CertaEdge 密钥直接填入只连接 OpenAI 官方地址的配置。

## 2. 添加 LLM 模型

按当前插件表单填写：

| 字段 | 填写内容 |
| --- | --- |
| 模型类型 | LLM |
| 模型名称 | 从 CertaEdge 复制的完整模型 ID |
| API Key | 自己的完整密钥，即使插件把此项标为可选也要填写 |
| API Base URL | `https://certaedge.com/v1`，不填写完整的 `/chat/completions` |
| 对话类型 / Mode | Chat / 对话 |
| API 类型（若有） | Chat Completions |
| 模型上下文长度 | 首次短文本测试可保留插件默认值；用于实际应用前按模型规格调整，不超过模型实际窗口 |
| 最大 token 上限 | 不超过模型支持的最大输出；首次可保留插件默认值做短文本测试 |
| API endpoint 中的模型名称 | 通常留空，或填同一个真实模型 ID；不要误填显示名称 |

其他高级能力先保留默认；只在确认模型支持时再开启视觉、工具调用和多模态功能。

![Dify 接入 CertaEdge 的配置字段示意](/images/configuration/dify.svg)

*图为主要字段示意，完整必填项以插件表单为准。*

点击保存或校验。这个过程可能会调用模型验证凭证，并产生相应用量。

## 3. 在最小应用中使用

1. 新建一个简单聊天应用，或在已有工作流中选择一个 LLM 节点。
2. 在模型选择器中选择刚添加的 **OpenAI-API-compatible → 模型**。
3. 只发送一条短文本测试；先不启用知识库、工具或图片输入。
4. 在 Dify 预览中收到回复，再到<PlatformLink to="logs">使用日志</PlatformLink>核对模型与调用状态。

配置模型不代表所有应用会自动切换。如果应用未指定模型，还要检查工作空间默认模型。

## 遇到问题

- 保存失败：按提示补全上下文长度等必填项，查看具体 HTTP 错误。
- 连接成功但应用不使用：重新选择节点或应用中的模型。
- 400 参数错误：检查 Chat / Responses 选择和高级参数，不只检查密钥。
- 本机测试成功、Dify 失败：确认 Dify 服务或容器能够访问 API，按[排错说明](/getting-started/troubleshooting)检查。

更多界面说明见 [Dify 官方模型供应商文档](https://docs.dify.ai/zh/cloud/use-dify/workspace/model-providers)。

## 用工作流调用生成任务

视频或音乐接口通过 **HTTP 请求节点**调用，不把媒体生成模型注册成普通 LLM。下面采用“提交”和“查询”两个小流程，避免一个聊天请求长时间占用工作流。

### 流程一：整理提示词并提交

1. 新建 Workflow，开始节点添加 `prompt` 和 `video_model` 两个文本输入。
2. 可选：加 LLM 节点，把 `prompt` 整理成镜头描述。该节点使用已经验证可聊天的模型，不使用视频模型。
3. 创建 Secret 类型的环境变量 `CERTAEDGE_API_KEY`，保存自己的密钥；不要让最终用户在普通对话输入框填写密钥。
4. 加 **HTTP 请求**节点，Method 为 POST，URL 填 `https://certaedge.com/v1/videos`。
5. 请求头添加 `Authorization`，值为 `Bearer ` 加环境变量选择器插入的密钥；再加 `Content-Type: application/json`。
6. Body 选 JSON，将[视频示例](/generation/video)中的 `model` 替换为开始节点的 `video_model` 变量，将 `prompt` 替换为整理节点的文本或开始节点输入。使用界面的变量选择器，不手写虚构的节点 ID；其余参数按模型要求填写。

HTTP 节点的 `body` 通常是响应文本，不一定已经是可直接选取的 JSON 对象。在后面添加 Python Code 节点，把输入变量 `body` 绑定为该响应的 body：

```python
import json

def main(body: str) -> dict:
    data = json.loads(body)
    task_id = data.get("id")
    if not isinstance(task_id, str) or not task_id.startswith("task_"):
        raise ValueError("生成接口未返回有效任务 ID，请检查 HTTP 状态和错误正文")
    return {"task_id": task_id, "status": str(data.get("status", ""))}
```

为代码节点配置同名输出 `task_id` 和 `status`，类型均为 String。最后将它们连接到结束节点，让调用者保存任务 ID。HTTP 非成功响应应走错误分支，不当作生成成功。

### 流程二：查询状态并返回结果入口

1. 新建查询 Workflow，开始节点只接收 `task_id`。
2. HTTP 节点用 GET，URL 通过变量选择器拼成 `https://certaedge.com/v1/videos/` 加该 ID，使用同一 Secret 变量配置认证头。
3. 解析返回的 `status`，按[视频状态表](/generation/video)显示等待、完成或失败；失败时把可公开的错误返回给调用者。
4. 完成后才使用 `/v1/videos/{任务ID}/content` 下载。若当前工作流没有安全的文件下载或存储节点，交给后端或 n8n 使用 API Key 下载，不把 API Key 拼进返回链接。

这套方式支持“提示词整理→提交任务→稍后查询”。需要全自动等待时，可由 [n8n](/tools/n8n#生成任务工作流)或[应用脚本](/tools/custom-app#用-python-查询生成任务)调度这两个流程。

若要在 Dify 内配置 Loop，必须有可用的等待步骤和明确的最大次数；不要假设所有版本都有内置 Wait，也不要通过反复调用 LLM 来消耗等待时间。

### 更换生成服务

调用音乐、Midjourney 或后台 Responses 时，修改提交 URL 和请求体后，也要同步修改 ID 提取、查询路径和状态判断，不能只替换模型 ID。对应规则见[生成任务总览](/generation/)。

