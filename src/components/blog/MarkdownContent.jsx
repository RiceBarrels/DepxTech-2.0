'use client'

import { useMemo } from 'react'
import './blog-content.css'

// Simple markdown parser for blog content
function parseMarkdown(content) {
  if (!content) return ''

  let html = content
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Images (must be before links since ![alt](url) contains [alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="blog-image" loading="lazy" />')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

  // Checkmarks list items
  html = html.replace(/^- ✓ (.+)$/gm, '<li class="check-item"><span class="check-icon">✓</span><span>$1</span></li>')

  // Regular unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')

  // Ordered lists (numbered)
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="numbered">$1</li>')

  // Tables - parse properly
  const tableRegex = /(\|.+\|[\r\n]+)+/g
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n').filter(row => row.trim())
    let tableHtml = '<div class="table-wrapper"><table>'

    rows.forEach((row, index) => {
      const cells = row.split('|').filter(cell => cell.trim() !== '')

      // Skip separator row
      if (cells.every(cell => /^[\s-:]+$/.test(cell))) {
        return
      }

      const isHeader = index === 0
      const tag = isHeader ? 'th' : 'td'
      const rowClass = isHeader ? 'table-header' : (index % 2 === 0 ? 'table-row-even' : 'table-row-odd')

      tableHtml += `<tr class="${rowClass}">`
      cells.forEach(cell => {
        tableHtml += `<${tag}>${cell.trim()}</${tag}>`
      })
      tableHtml += '</tr>'
    })

    tableHtml += '</table></div>'
    return tableHtml
  })

  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li class="numbered">.*?<\/li>\s*)+/g, '<ol class="numbered-list">$&</ol>')
  html = html.replace(/(<li class="check-item">.*?<\/li>\s*)+/g, '<ul class="check-list">$&</ul>')
  html = html.replace(/(<li>(?!class).*?<\/li>\s*)+/g, '<ul class="bullet-list">$&</ul>')

  // Paragraphs - wrap text blocks
  const lines = html.split('\n')
  const result = []
  let paragraphContent = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines
    if (!trimmedLine) {
      if (paragraphContent.length > 0) {
        result.push(`<p>${paragraphContent.join(' ')}</p>`)
        paragraphContent = []
      }
      continue
    }

    // Check if line is a block element
    const isBlockElement = /^<(h[1-6]|ul|ol|li|table|div|blockquote|pre|img|hr)/.test(trimmedLine)

    if (isBlockElement) {
      if (paragraphContent.length > 0) {
        result.push(`<p>${paragraphContent.join(' ')}</p>`)
        paragraphContent = []
      }
      result.push(trimmedLine)
    } else {
      paragraphContent.push(trimmedLine)
    }
  }

  // Close any remaining paragraph
  if (paragraphContent.length > 0) {
    result.push(`<p>${paragraphContent.join(' ')}</p>`)
  }

  return result.join('\n')
}

export function MarkdownContent({ content }) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content])

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
