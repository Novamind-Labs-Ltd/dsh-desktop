import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { DesktopFrameTitlebar, type DesktopFrameTitlebarProps } from '../src/client/ExtendedTitlebar.tsx'
import { parseDesktopBrandName } from '../src/branding.ts'
import { parseDesktopClientEnvironment } from '../src/client/environment.ts'

vi.mock('react-dom', async importOriginal => ({
  ...await importOriginal<typeof import('react-dom')>(),
  createPortal: (children: import('react').ReactNode) => children,
}))

describe('Desktop profile branding', () => {
  it('renders the supplied brand as escaped text instead of the default name', () => {
    vi.stubGlobal('document', { body: {} })
    try {
      const html = renderToStaticMarkup(createElement(DesktopFrameTitlebar, {
        environment: { brandName: 'Example & Co Desktop', version: '2.0.3', mode: 'extended', platform: 'darwin', material: 'off', micaSupported: false },
        api: { checkForUpdates: async () => {} },
        setMode: async () => {},
        t: (key: string) => key,
      } as unknown as DesktopFrameTitlebarProps))
      expect(html).toContain('<span class="dshDesktopFrameProduct">Example &amp; Co Desktop</span>')
      expect(html).not.toContain('DSH Desktop')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('accepts plain text and reads the encoded name from the Host URL', () => {
    expect(parseDesktopBrandName(undefined)).toBeUndefined()
    const name = 'Example & Co Desktop'
    expect(parseDesktopBrandName(name)).toBe(name)
    const params = new URLSearchParams({
      'dsh-desktop-mode': 'extended', 'dsh-desktop-platform': 'darwin',
      'dsh-desktop-version': '2.0.3', 'dsh-desktop-material': 'off',
      'dsh-desktop-brand-name': name,
    })
    expect(parseDesktopClientEnvironment(params.toString())?.brandName).toBe(name)
  })

  it.each(['', '   ', 'a'.repeat(81), 'Desktop\nTitle', 123])('rejects invalid brand name %j', value => {
    expect(() => parseDesktopBrandName(value)).toThrow('invalid desktop brand name')
  })
})
