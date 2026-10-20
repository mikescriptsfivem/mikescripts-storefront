/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tebex public tokens look like "abcd-0123abcd…" (a short prefix, a dash, then a long key).
const PUBLIC_TOKEN_PATTERN = /^[a-z0-9]{3,8}-[a-z0-9]{16,}$/i

/** "/", "repo", "/repo" and "/repo/" all become a Vite base such as "/repo/". */
function normalizeBase(value: string | undefined): string {
  const trimmed = (value ?? '').trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

/**
 * Everything prefixed with VITE_ is compiled into the public JavaScript bundle.
 * Stop the build if something that looks like a private credential would end up there.
 */
function assertPublicEnv(env: Record<string, string>) {
  const risky = Object.keys(env).filter((key) => /PRIVATE|SECRET|PASSWORD|WEBHOOK/i.test(key))
  if (risky.length > 0) {
    throw new Error(
      `Refusing to build: ${risky.join(', ')} would be embedded in the public website. ` +
        'Private keys must never use the VITE_ prefix. Remove the variable and rotate the key if it was exposed.',
    )
  }
  const token = env.VITE_TEBEX_PUBLIC_TOKEN?.trim()
  if (token && !PUBLIC_TOKEN_PATTERN.test(token)) {
    throw new Error(
      'VITE_TEBEX_PUBLIC_TOKEN does not look like a Tebex public token (for example "abcd-0123…"). ' +
        'Copy the Public Token from creator.tebex.io → Developers → API Keys. Never use the private key.',
    )
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  assertPublicEnv(env)

  return {
    base: normalizeBase(env.VITE_BASE_PATH),
    plugins: [react(), tailwindcss()],
    build: {
      target: 'es2022',
      sourcemap: false,
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
