import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vitepress'
import navigation from './navigation.json'
import { tokenize } from './search-tokenizer.mjs'
import { resolveSiteLinks } from './site-links.mjs'

const pages = navigation.flatMap((section) => section.items)
const env = loadEnv(
  process.env.NODE_ENV === 'production' ? 'production' : 'development',
  fileURLToPath(new URL('../', import.meta.url)),
  ['MAIN_SITE_URL', 'DOCS_BASE'],
)
const { base, links: platformLinks } = resolveSiteLinks(env)

function localeTheme(english: boolean) {
  const prefix = english ? '/en' : ''
  return {
    siteTitle: english ? 'CertaEdge / Docs' : 'CertaEdge / 文档',
    nav: [
      { text: english ? 'Getting started' : '快速入门', link: `${prefix}/getting-started/introduction`, activeMatch: `${prefix}/getting-started/` },
      { text: english ? 'Generation APIs' : '生成任务 API', link: `${prefix}/generation/`, activeMatch: `${prefix}/generation/` },
      { text: english ? 'Tool guides' : '工具教程', link: `${prefix}/tools/`, activeMatch: `${prefix}/tools/` },
      { text: english ? 'Platform' : '平台主页', link: platformLinks.home, target: '_self' },
      { text: english ? 'Console' : '控制台', link: platformLinks.keys, target: '_self' },
    ],
    sidebar: navigation.map((section) => ({
      text: english ? section.textEn : section.text,
      collapsed: false,
      items: section.items.map((page) => ({ text: english ? page.textEn : page.text, link: `${prefix}${page.route}` })),
    })),
    outline: { label: english ? 'On this page' : '本页目录', level: [2, 3] as [number, number] },
    docFooter: { prev: english ? 'Previous page' : '上一篇', next: english ? 'Next page' : '下一篇' },
    langMenuLabel: english ? 'Change language' : '切换语言',
    darkModeSwitchLabel: english ? 'Appearance' : '切换主题',
    lightModeSwitchTitle: english ? 'Switch to light theme' : '切换到浅色',
    darkModeSwitchTitle: english ? 'Switch to dark theme' : '切换到深色',
    sidebarMenuLabel: english ? 'Menu' : '文档菜单',
    returnToTopLabel: english ? 'Return to top' : '返回顶部',
    skipToContentLabel: english ? 'Skip to content' : '跳转到正文',
  }
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'CertaEdge 文档',
  description: '从第一次 API 调用，到常用 AI 工具的图文配置教程。',
  srcDir: 'content',
  base,
  cleanUrls: false,
  appearance: true,
  locales: {
    root: { label: '简体中文', lang: 'zh-CN', themeConfig: localeTheme(false) },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'CertaEdge Docs',
      description: 'Make your first API request and connect AI models to your everyday tools.',
      themeConfig: localeTheme(true),
    },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}certaedge-mark.svg` }],
    ['meta', { name: 'robots', content: 'noindex, nofollow' }],
  ],
  rewrites: {
    '首页.md': 'index.md',
    'en/首页.md': 'en/index.md',
    ...Object.fromEntries(['', 'en/'].flatMap((prefix) => pages.map((page) => [
      `${prefix}${page.file}`,
      `${prefix}${page.route.slice(1)}${page.route.endsWith('/') ? 'index' : ''}.md`,
    ]))),
  },
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    image: { lazyLoading: true },
    config(md) {
      const renderLink = md.renderer.rules.link_open
      md.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
        const token = tokens[index]
        const label = token.attrGet('aria-label')
        // Shared heading IDs should not be read aloud as part of the title.
        if (token.attrGet('class') === 'header-anchor' && label) {
          token.attrSet('aria-label', label.replace(/\s*\{#[^}]+\}/g, ''))
        }
        return renderLink ? renderLink(tokens, index, options, env, renderer) : renderer.renderToken(tokens, index, options)
      }
    },
  },
  themeConfig: {
    platformLinks,
    logo: { src: '/certaedge-mark.svg', alt: 'CertaEdge' },
    externalLinkIcon: true,
    search: {
      provider: 'local',
      options: {
        miniSearch: { options: { tokenize } },
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详细结果',
                resetButtonTitle: '清除搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有找到相关内容',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
              },
            },
          },
        },
      },
    },
  },
})
