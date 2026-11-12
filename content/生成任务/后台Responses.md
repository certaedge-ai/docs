---
title: "后台 Responses"
description: "为支持后台模式的生成模型提交 Responses 请求并按响应 ID 查询。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# 后台 Responses

本页用于**明确支持 Responses 后台模式的任务模型**。它把生成任务包装成 Responses 格式，不表示普通聊天模型都能通过添加 `background` 变成异步任务。

## 1. 提交后台请求

创建 `background.json`。下面是支持文本提示词的生成模型最小示例，目标模型需要同时支持该输入格式和后台模式：

```json
{
  "model": "YOUR_BACKGROUND_MODEL_ID",
  "input": "生成一段日出湖面的平稳视频，远处有薄雾。",
  "background": true,
  "stream": false
}
```

```bash
curl -sS -X POST https://certaedge.com/v1/responses \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @background.json
```

支持的后台模式会先返回等待中的响应，而不是一直等待最终文件。保存：

- `id`：Responses 标识，形式为 `resp_...`。
- `metadata.task_id`：对应的通用公开任务 ID，形式为 `task_...`。
- `metadata.retrieval_path`：再次查询这个响应的路径。

字段以真实响应为准，不手动转换或猜测 ID。模型不支持后台模式时，应根据错误改用其支持的接口。

## 2. 按响应 ID 查询

```bash
export CERTAEDGE_RESPONSE_ID='resp_EXAMPLE'
curl -sS "https://certaedge.com/v1/responses/$CERTAEDGE_RESPONSE_ID" \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY"
```

`queued`、`in_progress` 时等待后查询同一个响应；`completed` 时读取 `output`；`failed` 或 `incomplete` 时保存错误并停止正常轮询。

普通任务查询路径不能直接填 `resp_...`，要使用提交响应中实际提供的 `metadata.task_id`。

## 3. 使用结果

完成响应中的 `output` 按真实类型解析，生成结果可能以消息、文本或包含媒体链接的内容表示。不要假定所有任务都返回单个普通聊天字符串。

需要规范化下载文件时，用保留的任务 ID 调用[通用产物列表](/generation/tasks#列出和下载产物)。若服务未提供文件产物，按实际响应处理。

## 与流式输出的区别

本页首次采用 `background: true`、`stream: false`，便于工具先取得 ID 再查询。`stream: true` 是事件流，不能当作单个 JSON 响应交给普通 HTTP JSON 解析；SSE 与后台查询也不是同一个概念。

希望在工具中组合时，可使用 [Dify 的 HTTP 工作流](/tools/dify#用工作流调用生成任务)或 [n8n](/tools/n8n#生成任务工作流)，将 ID 提取和成功状态改成 Responses 的字段。
