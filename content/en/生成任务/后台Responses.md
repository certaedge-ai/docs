---
title: "Background Responses"
description: "Submit Responses requests for generation models that support background mode, then query by response ID."
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Background Responses {#后台-responses}

This page applies to **task models that explicitly support Responses background mode**. It wraps generation tasks in Responses format. Adding `background` does not turn every ordinary chat model into an asynchronous task.

## 1. Submit a background request {#_1-提交后台请求}

Create `background.json`. This is a minimal example for a generation model that accepts text prompts. The target model must support both this input format and background mode:

```json
{
  "model": "YOUR_BACKGROUND_MODEL_ID",
  "input": "Generate a steady video of a lake at sunrise, with light mist in the distance.",
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

Supported background mode returns a pending response without waiting for the final file. Save these fields:

- `id`: the Responses identifier, in `resp_...` format.
- `metadata.task_id`: the corresponding generic public task ID, in `task_...` format.
- `metadata.retrieval_path`: the path for querying this response again.

Use the fields from the actual response; do not convert or guess IDs yourself. If the model does not support background mode, follow the error details and use an endpoint it supports.

## 2. Query by response ID {#_2-按响应-id-查询}

```bash
export CERTAEDGE_RESPONSE_ID='resp_EXAMPLE'
curl -sS "https://certaedge.com/v1/responses/$CERTAEDGE_RESPONSE_ID" \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY"
```

For `queued` or `in_progress`, wait and query the same response again. For `completed`, read `output`. For `failed` or `incomplete`, save the error details and stop normal polling.

Do not put `resp_...` directly in a generic task query path. Use the actual `metadata.task_id` supplied by the submission response.

## 3. Use the result {#_3-使用结果}

Parse the completed response's `output` according to its actual types. Generated results may be represented as messages, text, or content containing media links. Do not assume every task returns a single plain chat string.

For normalized file downloads, use the saved task ID to retrieve the [generic artifact list](/en/generation/tasks#列出和下载产物). If the service provides no file artifacts, handle the actual response accordingly.

## How this differs from streaming {#与流式输出的区别}

The initial request here uses `background: true` and `stream: false`, so a tool can obtain an ID before querying it. `stream: true` returns an event stream; do not pass it to an ordinary HTTP JSON parser as a single JSON response. SSE and background polling are also distinct concepts.

To combine these endpoints in your tools, use a [Dify HTTP workflow](/en/tools/dify#用工作流调用生成任务) or [n8n](/en/tools/n8n#生成任务工作流), adjusting ID extraction and success checks to the Responses fields.
