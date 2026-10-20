// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { enhanceDescription } from './enhance-description'
import { sanitizeHtml } from './sanitize'

const render = (html: string) => enhanceDescription(sanitizeHtml(html))

describe('enhanceDescription (snippets from live MikeScripts descriptions)', () => {
  it('turns Markdown headings and dash lists typed into paragraphs into real HTML', () => {
    const html = render(
      '<p>## Towing</p><p>- **Wheel-lift**: lock a vehicle\'s wheels in the forks.</p><p>- **Trailer hitch** on the wheel-lift</p><p><br /></p><p>## Requirements</p>',
    )
    expect(html).toBe(
      '<h2>Towing</h2><ul><li><strong>Wheel-lift</strong>: lock a vehicle\'s wheels in the forks.</li><li><strong>Trailer hitch</strong> on the wheel-lift</li></ul><h2>Requirements</h2>',
    )
  })

  it('builds ordered lists and inline code', () => {
    expect(render('<p>1. Put the `MS_HwyWrk` folder in your `resources` folder</p><p>2. Restart the server</p>')).toBe(
      '<ol><li>Put the <code>MS_HwyWrk</code> folder in your <code>resources</code> folder</li><li>Restart the server</li></ol>',
    )
  })

  it('builds tables written one row per paragraph, keeping inline formatting in cells', () => {
    const html = render(
      '<p>| Framework \u00a0 \u00a0| Supported |</p><p>| -------------------- | --------- |</p><p>| <strong>ESX Legacy</strong> 1.10+ | ✅ \u00a0 \u00a0|</p><p>| <strong>Qbox</strong> \u00a0 | ✅ (ace permission) |</p>',
    )
    expect(html).toBe(
      '<table><thead><tr><th scope="col">Framework</th><th scope="col">Supported</th></tr></thead><tbody><tr><td><strong>ESX Legacy</strong> 1.10+</td><td>✅</td></tr><tr><td><strong>Qbox</strong></td><td>✅ (ace permission)</td></tr></tbody></table>',
    )
  })

  it('builds tables written as several lines inside one paragraph', () => {
    const html = render('<p>| Command | What it does |\n|---|---|\n| <code>/firesetup</code> | Open the device-placement UI |\n| <code>/firemenu</code> | Building overview |</p>')
    expect(html).toContain('<thead><tr><th scope="col">Command</th><th scope="col">What it does</th></tr></thead>')
    expect(html).toContain('<tr><td><code>/firesetup</code></td><td>Open the device-placement UI</td></tr>')
    expect(html).not.toContain('|')
  })

  it('turns bold-only and ALL CAPS label lines into sub-headings', () => {
    expect(render('<p>**Exterior**</p><p>WHAT YOU GET</p><p><strong>Features:</strong></p>')).toBe(
      '<h3>Exterior</h3><h3>WHAT YOU GET</h3><p><strong>Features:</strong></p>',
    )
  })

  it('links bare URLs without swallowing trailing punctuation, and keeps line breaks within a paragraph', () => {
    const html = render('<p>💬 <strong>Discord:</strong> https://discord.gg/abc.\nTicket channel access is automatic.</p>')
    expect(html).toBe(
      '<p>💬 <strong>Discord:</strong> <a href="https://discord.gg/abc" target="_blank" rel="noopener noreferrer">https://discord.gg/abc</a>.<br>Ticket channel access is automatic.</p>',
    )
  })

  it('handles italics and leaves real HTML structure and code blocks alone', () => {
    expect(render('<p>*Original MikeScripts design.*</p>')).toBe('<p><em>Original MikeScripts design.</em></p>')
    const realHtml = '<h2>✅ Multi-Framework</h2><ul><li>Auto-detects <strong>ESX</strong></li></ul><pre><code>Config.Jobs = { **x** }</code></pre>'
    expect(render(realHtml)).toBe(realHtml)
  })

  it('collapses the blank line the editor adds after every code line', () => {
    expect(render("<pre><code>\nConfig.Framework = 'auto'\n\n\n\n\nConfig.Jobs = {\n\n    ['police'] = true,\n\n}</code></pre>")).toBe(
      "<pre><code>Config.Framework = 'auto'\n\nConfig.Jobs = {\n    ['police'] = true,\n}</code></pre>",
    )
  })

  it('re-joins hard-wrapped lines into one paragraph or list item', () => {
    expect(
      render('<p>Built for <strong>serious roleplay servers</strong> that need an air support package</p><p>their officers can actually rely on.</p><p>Next paragraph.</p>'),
    ).toBe('<p>Built for <strong>serious roleplay servers</strong> that need an air support package their officers can actually rely on.</p><p>Next paragraph.</p>')
    expect(render('<ul><li><strong>Gimbal</strong> — the view stays level no matter how the</li></ul><p>\u00a0 pilot banks, yaws, or pitches.</p>')).toBe(
      '<ul><li><strong>Gimbal</strong> — the view stays level no matter how the pilot banks, yaws, or pitches.</li></ul>',
    )
  })

  it('continues list items that wrap their text in <p>, merges split lists and joins code-only continuations', () => {
    const html = render(
      '<ul><li><p><strong>Seat hand-off</strong>: state is persisted</p></li></ul><p>on the statebag every 250 ms.</p><ul><li><p>Q to rappel via the native</p></li></ul><p><code>TASK_RAPPEL_FROM_HELI</code>.</p><ul><li>Synced with **receiver-side\ninterpolation** for smooth motion.</li></ul>',
    )
    expect(html).toBe(
      '<ul><li><p><strong>Seat hand-off</strong>: state is persisted on the statebag every 250 ms.</p></li><li><p>Q to rappel via the native <code>TASK_RAPPEL_FROM_HELI</code>.</p></li><li>Synced with <strong>receiver-side\ninterpolation</strong> for smooth motion.</li></ul>',
    )
  })

  it('converts bold that spans a joined line break', () => {
    expect(render('<ul><li><p>Synced with **receiver-side</p></li></ul><p>interpolation** for smooth motion.</p>')).toBe(
      '<ul><li><p>Synced with <strong>receiver-side interpolation</strong> for smooth motion.</p></li></ul>',
    )
  })

  it('does not glue a separate sentence onto a list item', () => {
    expect(render('<p>- Cfx Asset Escrow</p><p>*Original MikeScripts design.*</p>')).toBe(
      '<ul><li>Cfx Asset Escrow</li></ul><p><em>Original MikeScripts design.</em></p>',
    )
  })

  it('never turns text into markup', () => {
    const html = render('<p>- &lt;img src=x onerror=alert(1)&gt; **&lt;b&gt;**</p>')
    expect(html).toBe('<ul><li>&lt;img src=x onerror=alert(1)&gt; <strong>&lt;b&gt;</strong></li></ul>')
  })
})

describe('sanitizeHtml', () => {
  it('removes scripts, event handlers, inline styles and unknown iframes', () => {
    const html = sanitizeHtml(
      '<p style="color:black" onclick="x()">Hi<script>alert(1)</script></p><iframe src="https://evil.test/x"></iframe><iframe src="https://www.youtube.com/embed/abc"></iframe><a href="javascript:alert(1)">bad</a>',
    )
    expect(html).not.toMatch(/script|onclick|style=|evil\.test|javascript:/)
    expect(html).toContain('<p>Hi</p>')
    expect(html).toContain('src="https://www.youtube.com/embed/abc"')
  })

  it('opens external links in a new tab safely', () => {
    expect(sanitizeHtml('<a href="https://discord.gg/x">Discord</a>')).toBe(
      '<a href="https://discord.gg/x" target="_blank" rel="noopener noreferrer">Discord</a>',
    )
  })
})
