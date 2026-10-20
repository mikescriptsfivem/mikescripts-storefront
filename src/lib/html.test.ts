import { describe, expect, it } from 'vitest'
import { htmlToText, summaryFromHtml, truncate } from './html'

describe('summaryFromHtml (live description shapes)', () => {
  it('skips Markdown headings and short labels to find the first real paragraph', () => {
    const fire = '<h1>🔥 MikeScript Fire — MS_Fire</h1><p>A complete fire alarm and firefighter system for FiveM. Real Fire Alarm Control Panel.</p>'
    expect(summaryFromHtml(fire)).toBe('A complete fire alarm and firefighter system for FiveM. Real Fire Alarm Control Panel.')
  })

  it('strips Markdown bold and ignores bare links', () => {
    expect(summaryFromHtml('<p>**A full-size private jet you can actually walk through, even in the air.**</p><p>**Exterior**</p>')).toBe(
      'A full-size private jet you can actually walk through, even in the air.',
    )
    expect(summaryFromHtml('<p>🎥 Showcase: https://youtu.be/abc</p><p>Turn flying into a full roleplay career. One drop-in resource.</p>')).toBe(
      'Turn flying into a full roleplay career. One drop-in resource.',
    )
  })

  it('keeps sentences that wrap across source newlines together', () => {
    expect(summaryFromHtml('<p>Built for serious roleplay servers that need an air support package\ntheir officers can rely on.</p>')).toBe(
      'Built for serious roleplay servers that need an air support package their officers can rely on.',
    )
  })

  it('joins hard-wrapped paragraphs (one <p> per line)', () => {
    expect(
      summaryFromHtml('<h3>Title</h3><p>Built for <strong>serious</strong> servers that need an air support package</p><p>their officers can rely on.</p><p>Just a clean resource.</p>'),
    ).toBe('Built for serious servers that need an air support package their officers can rely on.')
  })

  it('truncates long text at a word boundary', () => {
    expect(truncate('one two three four five six', 14)).toBe('one two three…')
  })
})

describe('htmlToText', () => {
  it('removes block markers, tables and entities', () => {
    expect(htmlToText('<p>## Towing</p><p>- **Wheel-lift** &amp; hitch</p><p>| a | b |</p><p>Done&nbsp;now</p>')).toBe('Towing Wheel-lift & hitch Done now')
  })
})
