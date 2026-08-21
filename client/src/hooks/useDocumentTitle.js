import { useEffect } from 'react'

/**
 * Sets document.title for the current page.
 *
 * In the original each .html file carried its own <title>; a SPA has one
 * shell document, so each page declares its title here instead.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
  }, [title])
}
