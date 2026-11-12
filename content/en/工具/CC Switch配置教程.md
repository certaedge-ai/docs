---
title: "CC Switch Setup"
description: "Import a provider from the platform or configure one manually, then confirm it is active."
reviewStatus: adapted
updatedAt: "2026-10-29"
---

# CC Switch Setup {#cc-switch-配置教程}

Install the client from the [official CC Switch releases](https://github.com/farion1231/cc-switch/releases), then install the Codex CLI or Claude Code version you intend to use. CC Switch manages connection settings; you still need the tools themselves.

## Option 1: Import from CertaEdge {#方式一-从-certaedge-导入}

1. Sign in, open <PlatformLink to="keys">API Keys</PlatformLink>, and find an existing, active key.
2. Open its row actions menu and select **CC Switch**.
3. Select the target application, such as Claude or Codex. You can use `CertaEdge` as the provider name.
4. Select or enter a real model ID under **Primary model**. Codex requires Responses; Claude Code requires Messages and tool calling.
5. Click **Open CC Switch** and select the installed CC Switch application in the system prompt.
6. Review the address, key, and model on the import confirmation screen, then save.

The import link contains your API Key. Do not share it or paste it into a public webpage. If the application does not open, confirm CC Switch is installed on this computer and allow the system to open its custom link.

## Option 2: Add a provider manually {#方式二-手动添加}

1. Select the target application in CC Switch. For your first connection, use direct mode so you can test without also changing local routing rules.
2. Click **Add provider**, then select **Custom configuration**.
3. Set the name to `CertaEdge`. Use the endpoint below and the key copied from the <PlatformLink to="keys">console</PlatformLink>.
4. Enter an <PlatformLink to="models">available model ID</PlatformLink> in the application's model settings, then add the provider.

| Target application | Address | Requirements |
| --- | --- | --- |
| Claude Code | `https://certaedge.com` | Messages and tool calling |
| Codex CLI | `https://certaedge.com/v1` | Responses and tool calling |

If the form requires JSON or TOML, follow the fields in the [Claude Code](/en/tools/claude-code) or [Codex](/en/tools/codex) guide. CC Switch manages credential files, so avoid mixing its credential management with manually configured environment variables.

![CertaEdge provider fields in CC Switch](/images/configuration/en/cc-switch.svg)

*This is a field diagram. Forms may differ between versions.*

## Confirm the provider is active {#确认真正启用}

Click **Switch** or **Enable** on the CertaEdge card and confirm it shows **In use**. Saving a card or seeing a **Direct** label alone does not mean the configuration is active.

Exit and restart Codex CLI; fully quit and reopen the desktop application. Recent Claude Code versions can reload settings, but start a new session if you are unsure.

Send a short request, confirm the intended model responds, and find the request in <PlatformLink to="logs">Usage Logs</PlatformLink>. If routing or aggregation mode is still active, check the actual forwarding destination rather than relying on the tab currently displayed.
