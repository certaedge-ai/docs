---
title: "n8n 配置教程"
description: "用最小 HTTP 工作流调用 CertaEdge，再按需配置 OpenAI 节点。"
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# n8n 配置教程

先登录已可用的 n8n 实例，准备 CertaEdge <PlatformLink to="keys">API Key</PlatformLink>和一个支持 Chat Completions 的<PlatformLink to="models">模型 ID</PlatformLink>。

## 1. 创建最小工作流

1. 新建工作流，添加 **Manual Trigger**。
2. 添加 **HTTP Request** 节点，并连接到触发节点。
3. Method 选择 **POST**，URL 填写 `https://certaedge.com/v1/chat/completions`。
4. Authentication 选择 **Generic Credential Type**，凭证类型选择 **Header Auth**。
5. 新建 Header Auth 凭证：Name 填 `Authorization`，Value 填 `Bearer sk-YOUR_API_KEY`，把占位密钥换成自己的完整密钥，注意 `Bearer` 后保留一个空格。保存并选用该凭证。

这里使用 HTTP Request 节点明确指定接口，避免 OpenAI 节点版本不同导致实际使用的协议变化。

![n8n 的 CertaEdge HTTP Request 配置示意](/images/configuration/n8n.svg)

*图为配置示意，节点界面以安装版本为准。*

## 2. 填写消息并执行

启用 **Send Body**，Body Content Type 选择 **JSON**，Specify Body 选择 **Using JSON**，填入：

```json
{
  "model": "YOUR_MODEL_ID",
  "messages": [
    {"role": "user", "content": "请用一句话介绍自己。"}
  ],
  "stream": false
}
```

将 `YOUR_MODEL_ID` 替换为真实模型 ID。若未自动生成 `Content-Type`，在请求头中补充 `Content-Type: application/json`。

点击 **Execute step**；需要触发节点数据时，先执行整个工作流。成功时 Output 中有 `choices[0].message.content`，并且<PlatformLink to="logs">使用日志</PlatformLink>中出现本次请求。这次调用会按模型价格计费。

## 3. 需要使用 OpenAI 节点时

在 OpenAI 凭证中填写 CertaEdge API Key，Base URL 填 `https://certaedge.com/v1`；**Organization ID 留空**，一般也不需要额外自定义请求头。

保存凭证会尝试读取 `/v1/models`。此测试通过只说明凭证和模型列表接口可用，仍需执行模型节点验证。

OpenAI 节点的操作和协议随版本变化：Chat Completions 操作使用支持 Chat 的模型；Responses 操作需要支持 Responses 的模型。模型下拉列表未出现目标 ID 时，尝试手动输入；无法指定匹配协议时，使用上面的 HTTP Request 工作流。

## 遇到问题

| 现象 | 检查方向 |
| --- | --- |
| 401 | Header Auth 中是否为 `Bearer` 加空格和完整密钥 |
| 404 或返回 HTML | HTTP Request 是否填了完整端点，模型 ID 是否正确 |
| 400 | 请求体是否是有效 JSON，`model` 是否已替换 |
| 429 | 按错误正文检查并发、余额和密钥额度 |

请求由 n8n 所在服务器或容器发出。确认这个运行环境能访问 CertaEdge，不把密钥写进公开的工作流 JSON。已经开通的异步生成接口另见[异步任务说明](/generation/lifecycle)；本页的 Chat Completions 工作流不直接用于视频或音乐任务。

## 生成任务工作流

以下以[视频 API](/generation/video)为例，先处理**一条输入、一个生成任务**。批量业务需要为每个任务分别保留 ID 和查询次数，不共用下面的单任务上下文。

### 提交后保存任务 ID

1. 复制前面的 HTTP Request 节点，命名为“提交视频”。
2. 保留 Header Auth，URL 改为 `https://certaedge.com/v1/videos`。
3. Body 使用视频页的 `video.json` 内容，替换真实模型和模型支持的尺寸、时长。
4. 在后面添加 **Edit Fields / Set** 节点，命名为“保存任务 ID”，添加 `task_id` 字段，用表达式选择上一步返回的 `id`。

提交节点放在循环外，仅执行一次。音乐、绘图或 Responses 使用的 ID 字段不同，按[接口对照表](/generation/lifecycle)调整。

### 有上限地等待和查询

在“保存任务 ID”后添加 Code 节点，使用 JavaScript，运行模式选择 **Run Once for All Items**。以下代码只为刚才的单个任务创建 60 次查询机会，不会创建 60 个生成任务：

```javascript
const taskId = $input.first().json.task_id;
if (typeof taskId !== 'string' || !taskId.startsWith('task_')) {
  throw new Error('提交视频后未取得有效任务 ID');
}
return Array.from({ length: 60 }, (_, index) => ({
  json: { task_id: taskId, attempt: index + 1 }
}));
```

1. 添加 **Loop Over Items**，Batch Size 设为 `1`。
2. 从它的 **loop** 输出连接 Wait 节点，等待 `15` 秒。
3. Wait 后连接 HTTP Request，Method 为 **GET**，URL 切换为表达式模式，填入下方表达式；继续使用同一 Header Auth 凭证，不发送 JSON Body。
4. 用 Switch 或 If 判断查询响应的 `status`：
   - `completed`：进入下载分支。
   - `failed`：记录 `error` 和任务 ID，结束。
   - `queued`、`in_progress`：连接回 Loop Over Items，取下一次查询机会。
   - 其他状态或 HTTP 错误：进入异常分支，不当作成功继续运行。
5. Loop Over Items 的 **done** 输出表示本轮 60 次机会已用尽。接到超时通知或记录节点，保留任务 ID，后续可继续查询原任务。

查询节点的 URL 表达式：

```text
{{ 'https://certaedge.com/v1/videos/' + $json.task_id }}
```

```text
提交视频 → 保存 ID → 准备查询次数 → Loop(loop) → Wait → 查询 → 状态分支
                                         ↑                 │
                                         └── 仍在处理中 ────┘
完成 → 下载并保存    失败 → 记录原因    Loop(done) → 等待超时
```

不要把“提交视频”连回循环，也不要在查询失败时自动重新提交生成任务。

### 下载和后续组合

在 `completed` 分支添加 GET HTTP Request，URL 使用完成响应的 `id`：

```text
{{ 'https://certaedge.com/v1/videos/' + $json.id + '/content' }}
```

使用同一凭证，Response Format 选择 **File**，然后连接自己的文件存储节点。

可以在生成前增加表格读取或提示词整理，在成功后追加通知、音频合成流程或内容存储。一个视频生成任务成功不代表音乐接口也已开通；按[音乐接口](/generation/music)另外提交和查询音乐任务。

