---
title: "n8n Setup"
description: "Call CertaEdge with a minimal HTTP workflow, then configure OpenAI nodes if needed."
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# n8n Setup {#n8n-配置教程}

Sign in to a working n8n instance. Have your CertaEdge <PlatformLink to="keys">API Key</PlatformLink> and a <PlatformLink to="models">model ID</PlatformLink> that supports Chat Completions ready.

## 1. Create a minimal workflow {#_1-创建最小工作流}

1. Create a workflow and add a **Manual Trigger**.
2. Add an **HTTP Request** node and connect it to the trigger.
3. Set Method to **POST** and URL to `https://certaedge.com/v1/chat/completions`.
4. Select **Generic Credential Type** for Authentication, then **Header Auth** as the credential type.
5. Create a Header Auth credential: set Name to `Authorization` and Value to `Bearer sk-YOUR_API_KEY`. Replace the placeholder with your complete key and keep one space after `Bearer`. Save and select the credential.

The HTTP Request node lets you choose the endpoint explicitly, avoiding protocol differences between versions of the OpenAI node.

![CertaEdge HTTP Request settings in n8n](/images/configuration/en/n8n.svg)

*This is a configuration diagram. Node interfaces depend on the installed version.*

## 2. Enter a message and execute {#_2-填写消息并执行}

Enable **Send Body**, select **JSON** for Body Content Type and **Using JSON** for Specify Body, then enter:

```json
{
  "model": "YOUR_MODEL_ID",
  "messages": [
    {"role": "user", "content": "Introduce yourself in one sentence."}
  ],
  "stream": false
}
```

Replace `YOUR_MODEL_ID` with a real model ID. If `Content-Type` is not generated automatically, add `Content-Type: application/json` to the headers.

Click **Execute step**. If the node needs data from the trigger, execute the entire workflow first. On success, Output contains `choices[0].message.content` and the request appears in <PlatformLink to="logs">Usage Logs</PlatformLink>. This call is billed at the model's price.

## 3. Use an OpenAI node if needed {#_3-需要使用-openai-节点时}

Enter your CertaEdge API Key in the OpenAI credential and set Base URL to `https://certaedge.com/v1`. **Leave Organization ID empty**; additional custom headers are usually unnecessary.

Saving the credential attempts to read `/v1/models`. Passing this test only verifies the credential and model-list endpoint. You still need to execute a model node.

OpenAI node operations and protocols vary by version. Use a Chat-compatible model for Chat Completions and a Responses-compatible model for Responses. If the target ID is missing from the dropdown, try entering it manually. If you cannot select the matching protocol, use the HTTP Request workflow above.

## Troubleshooting {#遇到问题}

| Symptom | What to check |
| --- | --- |
| 401 | Header Auth must contain `Bearer`, one space, and the complete key |
| 404 or an HTML response | Check the complete HTTP Request endpoint and model ID |
| 400 | Check that the body is valid JSON and `model` has been replaced |
| 429 | Use the error body to check concurrency, balance, and key quota |

Requests originate from the server or container running n8n. Confirm that environment can reach CertaEdge, and keep keys out of public workflow JSON. For enabled asynchronous generation APIs, see [task lifecycle](/en/generation/lifecycle). The Chat Completions workflow on this page is not directly applicable to video or music tasks.

## Generation task workflow {#生成任务工作流}

The following [video API](/en/generation/video) example handles **one input and one generation task** first. Batch applications must retain a separate ID and query count for every task rather than sharing the single-task context below.

### Save the task ID after submission {#提交后保存任务-id}

1. Copy the earlier HTTP Request node and name it “Submit video.”
2. Keep Header Auth and change the URL to `https://certaedge.com/v1/videos`.
3. Use the video page's `video.json` as the body, replacing the model, size, and duration with values supported by your model.
4. Add an **Edit Fields / Set** node named “Save task ID.” Add a `task_id` field and use an expression to select the `id` returned by the preceding node.

Keep submission outside the loop and execute it only once. Music, image generation, and Responses use different ID fields; adjust them using the [API comparison](/en/generation/lifecycle).

### Wait and query with a limit {#有上限地等待和查询}

After “Save task ID,” add a JavaScript Code node in **Run Once for All Items** mode. This code creates 60 query opportunities for that single task, rather than creating 60 generation tasks:

```javascript
const taskId = $input.first().json.task_id;
if (typeof taskId !== 'string' || !taskId.startsWith('task_')) {
  throw new Error('Video submission did not return a valid task ID');
}
return Array.from({ length: 60 }, (_, index) => ({
  json: { task_id: taskId, attempt: index + 1 }
}));
```

1. Add **Loop Over Items** and set Batch Size to `1`.
2. Connect its **loop** output to a Wait node set to `15` seconds.
3. Connect Wait to an HTTP Request node using **GET**. Switch URL to expression mode and enter the expression below. Keep the same Header Auth credential and do not send a JSON body.
4. Use Switch or If to branch on the query response's `status`:
   - `completed`: continue to download.
   - `failed`: record `error` and the task ID, then stop.
   - `queued`, `in_progress`: connect back to Loop Over Items for the next query opportunity.
   - Other statuses or HTTP errors: take an exception branch rather than continuing as if successful.
5. Loop Over Items' **done** output means all 60 opportunities have been used. Connect it to a timeout notification or logging node and retain the task ID so you can query the same task later.

URL expression for the query node:

```text
{{ 'https://certaedge.com/v1/videos/' + $json.task_id }}
```

```text
Submit video → Save ID → Prepare attempts → Loop(loop) → Wait → Query → Status branch
                                            ↑                           │
                                            └──── Still processing ─────┘
Completed → Download and save    Failed → Record error    Loop(done) → Wait timed out
```

Do not connect “Submit video” back into the loop, or automatically resubmit generation when querying fails.

### Download and extend the workflow {#下载和后续组合}

On the `completed` branch, add a GET HTTP Request node using the completion response's `id`:

```text
{{ 'https://certaedge.com/v1/videos/' + $json.id + '/content' }}
```

Use the same credential, set Response Format to **File**, and connect your file-storage node.

You can read a spreadsheet or refine prompts before generation, then send notifications, run an audio workflow, or store content after success. A successful video task does not mean the music API is enabled too. Submit and query music separately using the [music API](/en/generation/music).
