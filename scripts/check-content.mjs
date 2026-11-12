import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMarkdownRenderer } from 'vitepress'
import { tokenize } from '../.vitepress/search-tokenizer.mjs'
import { resolveSiteLinks } from '../.vitepress/site-links.mjs'

const nestedSite = resolveSiteLinks({ MAIN_SITE_URL: 'https://platform.example.test/app/', DOCS_BASE: '/manual/' })
assert.equal(nestedSite.links.home, 'https://platform.example.test/app/')
assert.equal(nestedSite.links.support, 'https://platform.example.test/app/#support')
assert.equal(nestedSite.links.keys, 'https://platform.example.test/app/keys')
assert.equal(nestedSite.links.logs, 'https://platform.example.test/app/usage-logs/common')
assert.equal(nestedSite.links.tasks, 'https://platform.example.test/app/usage-logs/task')
assert.equal(nestedSite.base, '/manual/')
assert.equal(resolveSiteLinks({ DOCS_BASE: '/' }).base, '/')
assert.equal(resolveSiteLinks({ DOCS_BASE: 'manual' }).base, '/manual/')
assert.throws(() => resolveSiteLinks({ MAIN_SITE_URL: 'javascript:alert(1)' }))
assert.throws(() => resolveSiteLinks({ DOCS_BASE: 'https://example.test/' }))
assert.throws(() => resolveSiteLinks({ DOCS_BASE: '/../manual/' }))

assert.deepEqual(tokenize('创建令牌 API Key'), ['创建', '令牌', 'API', 'Key'], '中文和英文应分别按词索引')
assert.deepEqual(tokenize('，。 / '), [], '标点不能成为搜索词')
assert.deepEqual(tokenize('API keys and models'), ['API', 'keys', 'and', 'models'], '英文分词应与构建和客户端保持一致')

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const renderer = await createMarkdownRenderer(resolve(root, 'content'))
const sections = JSON.parse(readFileSync(resolve(root, '.vitepress/navigation.json'), 'utf8'))
assert.equal(sections.length, 3, '文档分为快速入门、生成任务 API、工具教程三大板块')

for (const section of sections) {
  assert.match(section.textEn, /[a-z]/i, `缺少英文栏目名：${section.text}`)
  for (const page of section.items) assert.match(page.textEn, /[a-z]/i, `缺少英文菜单名：${page.file}`)
}
const originals = [{ file: '首页.md', route: '/' }, ...sections.flatMap((section) => section.items)]
const pages = ['', 'en/'].flatMap((prefix) => originals.map((page) => ({
  ...page,
  file: `${prefix}${page.file}`,
  route: `${prefix ? '/en' : ''}${page.route}`,
})))
const routes = new Set(pages.map((page) => page.route))
assert.equal(routes.size, pages.length, '页面网址不能重复')
const publicPageFiles = new Set(pages.map((page) => page.file))
for (const file of readdirSync(resolve(root, 'content'), { recursive: true })) {
  if (file.endsWith('.md')) assert.ok(publicPageFiles.has(file), `存在未列入公开菜单的 Markdown：${file}`)
}
let images = 0

for (const page of pages) {
  const filename = resolve(root, 'content', page.file)
  assert.ok(existsSync(filename), `页面不存在：${page.file}`)
  assert.match(page.file, /[\u4e00-\u9fff]/u, `Markdown 文件应使用中文名称：${page.file}`)
  const markdown = readFileSync(filename, 'utf8')
  if (page.file.startsWith('en/')) {
    const visible = markdown.replace(/\{#[^}]+\}/g, '').replace(/(?:\]\(|href=")[^)"\n]+/g, '')
    assert.doesNotMatch(visible, /[\u4e00-\u9fff]/u, `英文页面仍包含未翻译内容：${page.file}`)
    const original = readFileSync(resolve(root, 'content', page.file.slice(3)), 'utf8')
    assert.equal((markdown.match(/^```/gm) || []).length, (original.match(/^```/gm) || []).length, `英文示例代码块缺失：${page.file}`)
    const headings = (text) => renderer.parse(text.replace(/^---\n[\s\S]*?\n---\n/, ''), {}).filter((token) => token.type === 'heading_open').map((token) => [token.tag, token.attrGet('id')])
    assert.deepEqual(headings(markdown), headings(original), `语言切换需要保留对应段落锚点：${page.file}`)
  }
  assert.doesNotMatch(markdown, /^source(?:Url|Title|UpdatedAt):/m, `来源元数据应仅保留在维护目录：${page.file}`)
  assert.doesNotMatch(markdown, /MAIN_SITE_URL|PUBLIC_DOCS_URL|DOCS_BASE/, `站点维护配置不应出现在用户教程：${page.file}`)
  assert.match(markdown, /^---\n[\s\S]+?\n---\n/, `缺少页面信息：${page.file}`)
  assert.match(markdown, /^# .+/m, `缺少文章标题：${page.file}`)
  const prose = markdown.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')

  for (const match of prose.matchAll(/(!?)\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const [, image, raw] = match
    if (image) {
      assert.ok(raw.startsWith('/images/'), `图片应保存到本地：${page.file} → ${raw}`)
      assert.ok(existsSync(resolve(root, 'content/public', raw.slice(1))), `图片不存在：${raw}`)
      if (page.file.startsWith('en/') && raw.startsWith('/images/configuration/')) {
        assert.ok(raw.startsWith('/images/configuration/en/'), `英文页面应使用英文配置图：${page.file}`)
        assert.doesNotMatch(readFileSync(resolve(root, 'content/public', raw.slice(1)), 'utf8'), /[\u4e00-\u9fff]/u, `英文配置图仍包含中文：${raw}`)
      }
      images++
    } else if (raw.startsWith('/') && !raw.startsWith('//')) {
      const target = raw.split(/[?#]/)[0]
      assert.ok(routes.has(target), `站内链接不存在：${page.file} → ${target}`)
      assert.equal(target.startsWith('/en/'), page.route.startsWith('/en/'), `正文链接跨越语言：${page.file} → ${target}`)
    }
  }

}

console.log(`内容检查通过：${pages.length} 个中英文页面，${images} 处本地图片引用，每种语言三个板块。`)
