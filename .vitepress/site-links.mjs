export function resolveSiteLinks(env) {
  const mainSite = new URL(env.MAIN_SITE_URL?.trim() || 'https://certaedge.com/')
  if (!['http:', 'https:'].includes(mainSite.protocol) || mainSite.search || mainSite.hash) {
    throw new Error('MAIN_SITE_URL must be an HTTP(S) website URL without a query or fragment')
  }
  mainSite.pathname = `${mainSite.pathname.replace(/\/+$/, '')}/`

  const basePath = (env.DOCS_BASE?.trim() || '/docs/').replace(/^\/+|\/+$/g, '')
  if (!/^[\w./-]*$/.test(basePath) || basePath.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('DOCS_BASE must be a website path, for example /docs/ or /')
  }
  const base = basePath ? `/${basePath}/` : '/'
  const links = Object.fromEntries(Object.entries({
    home: '',
    support: '#support',
    keys: 'keys',
    models: 'pricing',
    signUp: 'sign-up',
    wallet: 'wallet',
    logs: 'usage-logs/common',
    tasks: 'usage-logs/task',
  }).map(([key, path]) => [key, new URL(path, mainSite).href]))
  return { base, links }
}
