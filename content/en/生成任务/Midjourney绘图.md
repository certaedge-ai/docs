---
title: "Midjourney Images"
description: "Submit image tasks, query results, and perform follow-up actions on completed tasks."
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Midjourney Images {#midjourney-绘图}

This page applies only to Midjourney-compatible services enabled for your account. Prepare a valid API Key and access to the relevant actions. Midjourney uses its own task structure, not a Chat Completions request body. Its identifiers are not generic `task_...` IDs.

## 1. Submit an image task {#_1-提交绘图}

Create `imagine.json`:

```json
{
  "prompt": "A quiet mountain cabin at sunrise, soft natural light, cinematic composition"
}
```

Submit in a terminal where you have [set your API Key](/en/generation/#鉴权与地址):

```bash
curl -sS -X POST https://certaedge.com/mj/submit/imagine \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @imagine.json
```

The response typically includes a numeric application-level `code`, a `description`, and the task ID in `result`. Check the application-level result and save the actual `result` value. Do not rely only on HTTP status or treat `result` as an image URL.

## 2. Query the task {#_2-查询任务}

```bash
export CERTAEDGE_MJ_ID='YOUR_MJ_TASK_ID'
curl -sS "https://certaedge.com/mj/task/$CERTAEDGE_MJ_ID/fetch" \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY"
```

Check `status`, `progress`, and `failReason`. Successful tasks typically have status `SUCCESS`; read the image URL from `imageUrl`. On failure, read the reason and stop polling. The returned `buttons` indicate which actions are available.

Use the returned image URL. Do not construct a download URL from `result`. When downloading an external image, do not send your platform API Key to a host outside CertaEdge.

## 3. Upscale or create variations {#_3-放大或变体}

Create a follow-up task only after the original task completes and the action is available. This example upscales the first image from the original task. Create `change.json` and enter the actual `taskId`:

```json
{
  "taskId": "YOUR_MJ_TASK_ID",
  "action": "UPSCALE",
  "index": 1
}
```

```bash
curl -sS -X POST https://certaedge.com/mj/submit/change \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @change.json
```

Follow-up actions may create a new task ID and incur charges. Save the new response and query the new task. Variations and button actions depend on the supported version. When `customId` is required, copy it from an actual returned button rather than inventing a value.

## Other actions and tools {#其他动作与工具}

Image description, blending, and repainting actions have their own parameters and access requirements. Do not reuse the image-generation JSON above without the corresponding model instructions.

In n8n or Dify, follow the [submission and polling pattern](/en/tools/n8n#生成任务工作流), but read the submitted ID from `result`, query `/mj/task/{ID}/fetch`, and check `status`. Do not reuse the video API's `id` field, `completed` status, or download path.
