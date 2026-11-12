---
title: "Dify Setup"
description: "Install the compatible provider plugin, complete required model fields, and verify a minimal app."
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# Dify Setup {#dify-配置教程}

Have an accessible Dify workspace, your CertaEdge <PlatformLink to="keys">API Key</PlatformLink>, and a <PlatformLink to="models">complete model ID</PlatformLink> that supports Chat Completions ready.

## 1. Install the compatible provider {#_1-安装兼容提供商}

Open Dify **Settings → Model Providers** and look for **OpenAI-API-compatible** in the available providers or Marketplace. Install the corresponding officially maintained plugin, open its card, and add a model.

Use the compatible plugin explicitly. Do not enter your CertaEdge key into a configuration that only connects to the official OpenAI address.

## 2. Add an LLM model {#_2-添加-llm-模型}

Complete the fields in your current plugin version:

| Field | Value |
| --- | --- |
| Model type | LLM |
| Model name | The complete model ID copied from CertaEdge |
| API Key | Your complete key, even if the plugin marks this field as optional |
| API Base URL | `https://certaedge.com/v1`, without the complete `/chat/completions` path |
| Conversation type / Mode | Chat |
| API type, if available | Chat Completions |
| Model context length | Keep the plugin default for an initial short-text test if needed; adjust to the model's specifications before regular use, without exceeding its actual context window |
| Maximum tokens | Do not exceed the model's maximum output; the plugin default can be used for an initial short-text test |
| Model name in API endpoint | Usually leave empty or enter the same real model ID; do not enter a display name by mistake |

Keep other advanced capabilities at their defaults first. Enable vision, tool calling, or multimodal features only after confirming the model supports them.

![Dify connection fields for CertaEdge](/images/configuration/en/dify.svg)

*This diagram shows the main fields. Follow your plugin's form for all required fields.*

Click save or validate. This may call the model to verify credentials and incur usage charges.

## 3. Use the model in a minimal app {#_3-在最小应用中使用}

1. Create a simple chat app, or select an LLM node in an existing workflow.
2. In the model selector, choose **OpenAI-API-compatible → your model**.
3. Send one short text message. Leave knowledge bases, tools, and image input disabled for this test.
4. After receiving a reply in Dify's preview, check the model and request status in <PlatformLink to="logs">Usage Logs</PlatformLink>.

Adding a model does not switch all applications automatically. If an app does not specify a model, also check the workspace's default model.

## Troubleshooting {#遇到问题}

- Saving fails: complete required fields such as context length and inspect the specific HTTP error.
- Connection succeeds but the app does not use it: select the model again in the node or app.
- 400 parameter error: check the Chat / Responses selection and advanced parameters, as well as the key.
- Local testing succeeds but Dify fails: confirm the Dify service or container can reach the API, then follow the [troubleshooting guide](/en/getting-started/troubleshooting).

For more interface details, see the [official Dify model-provider documentation](https://docs.dify.ai/en/cloud/use-dify/workspace/model-providers).

## Call generation APIs from a workflow {#用工作流调用生成任务}

Use **HTTP Request nodes** for video or music APIs. Do not register media generation models as ordinary LLMs. The example below separates submission and querying into two small workflows so a chat request does not occupy one workflow for a long time.

### Workflow 1: Refine a prompt and submit {#流程一-整理提示词并提交}

1. Create a Workflow and add two text inputs to the Start node: `prompt` and `video_model`.
2. Optionally add an LLM node to turn `prompt` into a shot description. Use a model already verified for chat, rather than a video model.
3. Create a Secret environment variable named `CERTAEDGE_API_KEY` for your key. Do not ask end users to enter a key in an ordinary chat input.
4. Add an **HTTP Request** node, set Method to POST, and enter `https://certaedge.com/v1/videos` as its URL.
5. Add an `Authorization` header containing `Bearer ` followed by the key inserted with the environment-variable selector. Also add `Content-Type: application/json`.
6. Choose JSON for the body. In the [video example](/en/generation/video), replace `model` with the Start node's `video_model` variable and `prompt` with the refinement node's text or Start input. Use the interface's variable selector rather than typing invented node IDs. Set other parameters according to the model's requirements.

An HTTP node's `body` is usually response text, rather than a JSON object whose fields you can immediately select. Add a Python Code node after it and bind the input variable `body` to that response body:

```python
import json

def main(body: str) -> dict:
    data = json.loads(body)
    task_id = data.get("id")
    if not isinstance(task_id, str) or not task_id.startswith("task_"):
        raise ValueError("The generation API returned no valid task ID; check the HTTP status and error body")
    return {"task_id": task_id, "status": str(data.get("status", ""))}
```

Configure outputs named `task_id` and `status`, both of type String. Connect them to the End node so the caller can save the task ID. Non-success HTTP responses must go to an error branch and must not be treated as successful generation.

### Workflow 2: Query status and return the result entry point {#流程二-查询状态并返回结果入口}

1. Create a query Workflow whose Start node accepts only `task_id`.
2. Use GET in the HTTP node. Build the URL with the variable selector by joining `https://certaedge.com/v1/videos/` and the ID. Configure the authorization header with the same Secret variable.
3. Parse the returned `status` and display pending, completed, or failed according to the [video status table](/en/generation/video). On failure, return an error safe to share with the caller.
4. Download from `/v1/videos/{task_id}/content` only after completion. If your workflow has no secure download or storage node, let your backend or n8n download using the API Key. Do not include the key in a returned link.

This supports “refine prompt → submit task → query later.” For fully automated waiting, schedule these two workflows with [n8n](/en/tools/n8n#生成任务工作流) or an [application script](/en/tools/custom-app#用-python-查询生成任务).

If you configure a Loop in Dify, provide a working wait step and a clear maximum iteration count. Do not assume every version has a built-in Wait node, and do not repeatedly call an LLM merely to pass the time.

### Switch generation services {#更换生成服务}

When using music, Midjourney, or background Responses, update ID extraction, the query path, and status handling along with the submission URL and request body. Changing only the model ID is not enough. See the [generation overview](/en/generation/) for the corresponding rules.
