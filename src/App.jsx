import { useEffect, useMemo, useRef, useState } from 'react'

const ROUTE_TO_FILE = {
  '/': '/content/index.html',
  '/about': '/content/about.html',
  '/works': '/content/works.html',
  '/events': '/content/events.html',
  '/tributes': '/content/tributes.html',
  '/contact': '/content/contact.html',
}

const HREF_TO_ROUTE = {
  'index.html': '/',
  'about.html': '/about',
  'works.html': '/works',
  'events.html': '/events',
  'tributes.html': '/tributes',
  'contact.html': '/contact',
  '/': '/',
  '/about': '/about',
  '/works': '/works',
  '/events': '/events',
  '/tributes': '/tributes',
  '/contact': '/contact',
}

function parseRouteFromHash() {
  const hash = window.location.hash || ''
  if (!hash || hash === '#') return '/'

  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash
  const path = withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`
  const [routeOnly] = path.split('?')

  return ROUTE_TO_FILE[routeOnly] ? routeOnly : '/'
}

function navigateToRoute(route) {
  if (!ROUTE_TO_FILE[route]) return

  const nextHash = route === '/' ? '#/' : `#${route}`
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash
  }
}

function App() {
  const containerRef = useRef(null)
  const pendingAnchorRef = useRef('')
  const [route, setRoute] = useState(parseRouteFromHash)
  const [pageHtml, setPageHtml] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const sourceFile = useMemo(() => ROUTE_TO_FILE[route] ?? ROUTE_TO_FILE['/'], [route])

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRouteFromHash())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function loadPage() {
      setIsLoading(true)

      const response = await fetch(sourceFile, { cache: 'force-cache' })
      const text = await response.text()
      if (isCancelled) return

      const doc = new DOMParser().parseFromString(text, 'text/html')

      const title = doc.querySelector('title')?.textContent
      if (title) document.title = title

      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')
      if (description) {
        let descriptionMeta = document.querySelector('meta[name="description"]')
        if (!descriptionMeta) {
          descriptionMeta = document.createElement('meta')
          descriptionMeta.setAttribute('name', 'description')
          document.head.appendChild(descriptionMeta)
        }
        descriptionMeta.setAttribute('content', description)
      }

      doc.querySelectorAll('script').forEach((script) => script.remove())

      setPageHtml(doc.body?.innerHTML ?? '')
      setIsLoading(false)
    }

    loadPage().catch(() => {
      if (isCancelled) return
      setPageHtml('<main><section class="container"><p>Unable to load content.</p></section></main>')
      setIsLoading(false)
    })

    return () => {
      isCancelled = true
    }
  }, [sourceFile])

  useEffect(() => {
    if (!pageHtml) return

    const container = containerRef.current
    if (!container) return

    const onContainerClick = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
        return
      }

      const [pathPart, hashPart] = href.split('#')
      const routePath = HREF_TO_ROUTE[pathPart]
      if (!routePath) return

      event.preventDefault()
      pendingAnchorRef.current = hashPart || ''
      navigateToRoute(routePath)
    }

    container.addEventListener('click', onContainerClick)

    const hamburger = container.querySelector('#hamburger')
    const navLinks = container.querySelector('#navLinks')
    let onHamburgerClick
    let onHamburgerKeydown
    let navLinkHandlers = []

    if (hamburger && navLinks) {
      onHamburgerClick = () => {
        hamburger.classList.toggle('active')
        navLinks.classList.toggle('open')
      }

      onHamburgerKeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          hamburger.click()
        }
      }

      hamburger.addEventListener('click', onHamburgerClick)
      hamburger.addEventListener('keydown', onHamburgerKeydown)

      navLinkHandlers = Array.from(navLinks.querySelectorAll('a')).map((link) => {
        const handler = () => {
          hamburger.classList.remove('active')
          navLinks.classList.remove('open')
        }
        link.addEventListener('click', handler)
        return [link, handler]
      })
    }

    const revealElements = container.querySelectorAll('.reveal')
    const checkReveal = () => {
      const windowHeight = window.innerHeight
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < windowHeight - 80) {
          el.classList.add('visible')
        }
      })
    }

    let scrollTimeout = null
    const onScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        checkReveal()
        scrollTimeout = null
      }, 50)
    }

    checkReveal()
    window.addEventListener('scroll', onScroll)

    const nav = container.querySelector('nav')
    const onNavScroll = () => {
      if (!nav) return
      if (window.scrollY > 10) {
        nav.style.boxShadow = '0 3px 20px rgba(42, 24, 16, 0.4)'
      } else {
        nav.style.boxShadow = '0 3px 15px rgba(42, 24, 16, 0.3)'
      }
    }

    window.addEventListener('scroll', onNavScroll)
    onNavScroll()

    const contactForm = container.querySelector('#contactForm')
    let onContactSubmit
    if (contactForm) {
      onContactSubmit = (event) => {
        event.preventDefault()
        const button = contactForm.querySelector('.btn')
        if (!button) return

        button.textContent = 'Message Sent. Thank you!'
        button.style.background = 'var(--color-forest)'

        setTimeout(() => {
          button.textContent = 'Send Message'
          button.style.background = ''
          contactForm.reset()
        }, 3000)
      }

      contactForm.addEventListener('submit', onContactSubmit)
    }

    return () => {
      container.removeEventListener('click', onContainerClick)

      if (hamburger && onHamburgerClick) {
        hamburger.removeEventListener('click', onHamburgerClick)
      }
      if (hamburger && onHamburgerKeydown) {
        hamburger.removeEventListener('keydown', onHamburgerKeydown)
      }

      navLinkHandlers.forEach(([link, handler]) => {
        link.removeEventListener('click', handler)
      })

      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onNavScroll)

      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
        scrollTimeout = null
      }

      if (contactForm && onContactSubmit) {
        contactForm.removeEventListener('submit', onContactSubmit)
      }
    }
  }, [pageHtml])

  useEffect(() => {
    if (!pendingAnchorRef.current) return
    const container = containerRef.current
    if (!container) return

    const anchorTarget = container.querySelector(`#${CSS.escape(pendingAnchorRef.current)}`)
    if (anchorTarget) {
      anchorTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    pendingAnchorRef.current = ''
  }, [pageHtml, route])

  return (
    <div ref={containerRef} suppressHydrationWarning>
      {isLoading ? <main><section className="container"><p>Loading...</p></section></main> : <div dangerouslySetInnerHTML={{ __html: pageHtml }} />}
    </div>
  )
}

export default App
