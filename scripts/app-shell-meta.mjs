export const SITE_URL = 'https://tssprint.com'

export const APP_SHELL_ROUTES = ['/cart', '/checkout', '/order-confirmation', '/account', '/admin']

const NOINDEX_ROBOTS = 'noindex,nofollow,noarchive'

export const APP_SHELL_ROUTE_META = {
  '/cart': {
    title: 'Cart | The Sticker Smith',
    description: 'Review your saved Sticker Smith order before checkout.',
  },
  '/checkout': {
    title: 'Checkout | The Sticker Smith',
    description: 'Complete your Sticker Smith order with proof-based production, shipping, or Bay Area pickup.',
  },
  '/order-confirmation': {
    title: 'Order Confirmation | The Sticker Smith',
    description: 'Your Sticker Smith order has been received. Watch for your digital proof and next steps.',
  },
  '/account': {
    title: 'Account | The Sticker Smith',
    description: 'Private Sticker Smith customer account area.',
  },
  '/admin': {
    title: 'Admin | The Sticker Smith',
    description: 'Private Sticker Smith admin dashboard.',
  },
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function upsertHeadTag(html, regex, tag) {
  if (regex.test(html)) return html.replace(regex, tag)
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`)
}

function setTitle(html, title) {
  const safe = escapeHtml(title)
  return upsertHeadTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${safe}</title>`)
}

function setMetaName(html, name, content) {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}">`
  return upsertHeadTag(html, new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i'), tag)
}

function setMetaProperty(html, property, content) {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}">`
  return upsertHeadTag(html, new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i'), tag)
}

function setCanonical(html, url) {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}">`
  return upsertHeadTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, tag)
}

function removeStructuredData(html) {
  return html.replace(/\s*<script\s+id=["']structured-data["']\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, '')
}

export function appShellHtmlForRoute(html, route) {
  const meta = APP_SHELL_ROUTE_META[route]
  if (!meta) return html

  const canonicalUrl = `${SITE_URL}${route}`
  let out = removeStructuredData(html)
  out = setTitle(out, meta.title)
  out = setMetaName(out, 'description', meta.description)
  out = setMetaName(out, 'robots', NOINDEX_ROBOTS)
  out = setMetaProperty(out, 'og:title', meta.title)
  out = setMetaProperty(out, 'og:description', meta.description)
  out = setMetaProperty(out, 'og:url', canonicalUrl)
  out = setMetaName(out, 'twitter:title', meta.title)
  out = setMetaName(out, 'twitter:description', meta.description)
  return setCanonical(out, canonicalUrl)
}
