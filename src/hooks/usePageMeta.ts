import { useEffect } from 'react'
import { site } from '../config/site'

const DEFAULT_TITLE = `${site.name} | Premium FiveM Scripts`

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/** Sets the document title and description for the current page. */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : DEFAULT_TITLE
    const text = description || site.description
    document.title = fullTitle
    setMeta('meta[name="description"]', 'name', 'description', text)
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', text)
  }, [title, description])
}
