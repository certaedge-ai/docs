import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vitepress'
import { resolveSiteLinks } from '../.vitepress/site-links.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { base, links } = resolveSiteLinks(loadEnv('production', root, ['MAIN_SITE_URL', 'DOCS_BASE']))
const sections = JSON.parse(readFileSync(resolve(root, '.vitepress/navigation.json'), 'utf8'))
const originals = ['index.html', ...sections.flatMap((section) => section.items).map((page) =>
  `${page.route.slice(1)}${page.route.endsWith('/') ? 'index' : ''}.html`)]
const files = ['', 'en/'].flatMap((prefix) => originals.map((file) => `${prefix}${file}`))
const output = resolve(root, '.vitepress/dist')
const privateData = /\/(?:Users|home)\/[^\s"'<>]+|[A-Za-z]:\\Users\\|-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/u

for (const entry of readdirSync(output, { recursive: true })) {
  if (!/\.(?:html|js|json|svg|txt)$/.test(entry)) continue
  const file = resolve(output, entry)
  assert.ok(!privateData.test(readFileSync(file, 'utf8')), `公开产物包含私人路径或凭据：${file}`)
}

for (const file of files) {
  const html = readFileSync(resolve(output, file), 'utf8')
  assert.match(html, /<h1[\s>]/, `静态正文未成功渲染：${file}`)
  assert.doesNotMatch(html, /aria-label="[^"]*\{#/, `标题读屏标签不应包含锚点语法：${file}`)
  const english = file.startsWith('en/')
  assert.ok(html.includes(`lang="${english ? 'en-US' : 'zh-CN'}"`), `页面语言标记不正确：${file}`)
  const counterpart = english ? file.slice(3) : `en/${file}`
  const counterpartPath = counterpart.replace(/index\.html$/, '')
  assert.ok(html.includes(`href="${base}${counterpartPath}"`), `缺少对应文章的语言切换链接：${file}`)
  assert.ok(html.includes(`href="${links.home}"`), `主站返回地址不正确：${file}`)
  for (const match of html.matchAll(/(href|src)="([^"]+)"/g)) {
    const [, attribute, rawURL] = match
    if (!/^[#./]/.test(rawURL) || rawURL.startsWith('//')) continue
    const url = new URL(rawURL.replaceAll('&amp;', '&'), `https://docs.test${base}${file}`)
    if (!url.pathname.startsWith(base)) continue
    const path = decodeURIComponent(url.pathname.slice(base.length))
    const target = path.endsWith('/') || !path ? `${path}index.html` : path
    assert.ok(existsSync(resolve(output, target)), `静态链接不存在：${file} → ${rawURL}`)
    if (attribute === 'href' && url.hash && target.endsWith('.html')) {
      const anchor = decodeURIComponent(url.hash.slice(1))
      const targetHTML = target === file ? html : readFileSync(resolve(output, target), 'utf8')
      assert.ok(targetHTML.includes(`id="${anchor}"`), `段落链接不存在：${file} → ${rawURL}`)
    }
  }
}

console.log(`构建检查通过：${files.length} 个中英文页面及语言切换链接，部署路径 ${base}，主站 ${links.home}`)
