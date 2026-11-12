import { toRaw } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ToolGrid from './ToolGrid.vue'
import PlatformLink from './PlatformLink.vue'
import { tokenize } from '../search-tokenizer.mjs'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, siteData }) {
    // Fail static builds instead of publishing partially rendered articles.
    if (import.meta.env.SSR) app.config.throwUnhandledErrorInProduction = true
    app.component('ToolGrid', ToolGrid)
    app.component('PlatformLink', PlatformLink)
    // Functions in site config are omitted from the client JSON.
    toRaw(siteData.value.themeConfig.search.options.miniSearch.options).tokenize = tokenize
  },
} satisfies Theme
