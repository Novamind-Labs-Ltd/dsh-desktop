import type {} from '@deepseek-ai/cordis'

/** Validate a plain-text product name before passing it to native or browser UI. */
export function parseDesktopBrandName(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !value.trim() || value.length > 80
    || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new Error('dsh-plugin-desktop: invalid desktop brand name')
  }
  return value
}

declare module '@deepseek-ai/cordis' {
  interface Events {
    /** Queried after profile plugins settle, before the native shell is shown. */
    'desktop/brand-name'(): string | undefined
  }
}
