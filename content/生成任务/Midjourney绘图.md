---
title: "Midjourney 绘图"
description: "提交绘图、查询结果，并对已完成任务执行后续操作。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Midjourney 绘图

本页只用于账号已开放的 Midjourney 兼容服务。先准备有效密钥与对应动作权限；Midjourney 使用自己的任务结构，不走 Chat Completions 请求体，也不把 ID 当成通用 `task_...`。

## 1. 提交绘图

创建 `imagine.json`：

```json
{
  "prompt": "A quiet mountain cabin at sunrise, soft natural light, cinematic composition"
}
```

在[已设置密钥](/generation/#鉴权与地址)的终端提交：

```bash
curl -sS -X POST https://certaedge.com/mj/submit/imagine \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @imagine.json
```

通常返回数字业务 `code`、说明 `description` 和任务 ID `result`。检查业务结果并保存真实 `result`，不能只看 HTTP 状态或把 `result` 当作图片地址。

## 2. 查询任务

```bash
export CERTAEDGE_MJ_ID='YOUR_MJ_TASK_ID'
curl -sS "https://certaedge.com/mj/task/$CERTAEDGE_MJ_ID/fetch" \
  -H "Authorization: Bearer $CERTAEDGE_API_KEY"
```

检查 `status`、`progress` 和 `failReason`。成功时通常为 `SUCCESS`，图片读取 `imageUrl`；失败时读取原因并停止轮询。实际可用操作可从返回的 `buttons` 中确认。

请使用返回的图片地址，不用 `result` 拼造下载 URL。下载外部图片时，不向非 CertaEdge 主机附带平台 API Key。

## 3. 放大或变体

只有原任务完成且该动作可用时，才创建后续任务。下面示例放大原任务中的第 1 张图，创建 `change.json` 并替换真实 `taskId`：

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

后续操作可能产生新任务 ID 和费用，保存新响应，再查询新任务。变体、按钮操作与版本支持有关；需要使用 `customId` 时从真实返回的按钮中复制，不自己编造按钮值。

## 其他动作与工具

图片描述、混图、重绘等动作有各自参数与权限。没有对应模型说明时不直接套用上面的绘图 JSON。

在 n8n 或 Dify 中可按[通用提交与轮询模式](/tools/n8n#生成任务工作流)组合，但需把提交 ID 改读 `result`，查询使用 `/mj/task/{ID}/fetch` 并检查 `status`。不要沿用视频接口的 `id`、`completed` 和下载路径。
