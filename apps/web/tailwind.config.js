/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════
        // Background Tokens
        // ═══════════════════════════════════════════════════════════
        bg: {
          DEFAULT: 'var(--bg)',
          secondary: 'var(--bg-secondary)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          subtle: 'var(--surface-subtle)',
        },
        
        // ═══════════════════════════════════════════════════════════
        // Text Tokens
        // ═══════════════════════════════════════════════════════════
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        // Geriye dönük uyumluluk için muted alias
        muted: 'var(--text-muted)',
        
        // ═══════════════════════════════════════════════════════════
        // Border Tokens
        // ═══════════════════════════════════════════════════════════
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
          strong: 'var(--border-strong)',
        },
        divider: 'var(--divider)',
        
        // ═══════════════════════════════════════════════════════════
        // Primary Accent - Yeşil
        // ═══════════════════════════════════════════════════════════
        accent: {
          DEFAULT: 'var(--accent)',
          dark: 'var(--accent-dark)',
          light: 'var(--accent-light)',
          lighter: 'var(--accent-lighter)',
          50: 'var(--accent-50)',
          100: 'var(--accent-100)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
        },
        
        // ═══════════════════════════════════════════════════════════
        // Gold - Altın
        // ═══════════════════════════════════════════════════════════
        gold: {
          DEFAULT: 'var(--gold)',
          dark: 'var(--gold-dark)',
          light: 'var(--gold-light)',
          lighter: 'var(--gold-lighter)',
          50: 'var(--gold-50)',
          100: 'var(--gold-100)',
          500: 'var(--gold-500)',
          600: 'var(--gold-600)',
          700: 'var(--gold-700)',
        },
        
        // ═══════════════════════════════════════════════════════════
        // Secondary Accent - Lacivert
        // ═══════════════════════════════════════════════════════════
        'accent-2': {
          DEFAULT: 'var(--accent-2)',
          dark: 'var(--accent-2-dark)',
          light: 'var(--accent-2-light)',
          50: 'var(--accent-2-50)',
          100: 'var(--accent-2-100)',
        },
        
        // ═══════════════════════════════════════════════════════════
        // Semantic Colors
        // ═══════════════════════════════════════════════════════════
        success: {
          DEFAULT: 'var(--success)',
          light: 'var(--success-light)',
          dark: 'var(--success-dark)',
          50: 'var(--success-50)',
          100: 'var(--success-100)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          light: 'var(--warn-light)',
          dark: 'var(--warn-dark)',
          50: 'var(--warn-50)',
          100: 'var(--warn-100)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          light: 'var(--danger-light)',
          dark: 'var(--danger-dark)',
          50: 'var(--danger-50)',
          100: 'var(--danger-100)',
        },
        info: {
          DEFAULT: 'var(--info)',
          light: 'var(--info-light)',
          dark: 'var(--info-dark)',
          50: 'var(--info-50)',
          100: 'var(--info-100)',
        },
      },
      fontFamily: {
        // Sistem fontları - Arapça uyumlu fallback
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        serif: [
          'Georgia',
          'Apple Garamond',
          'Baskerville',
          'Cambria',
          'Times New Roman',
          'Times',
          'Liberation Serif',
          'serif',
        ],
        // Monospace
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Courier New',
          'Courier',
          'monospace',
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            lineHeight: '1.8',
            color: 'var(--text)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-bold': 'var(--text)',
            '--tw-prose-links': 'var(--accent)',
            '--tw-prose-code': 'var(--text)',
            '--tw-prose-quotes': 'var(--text-secondary)',
            '--tw-prose-quote-borders': 'var(--accent)',
            '--tw-prose-hr': 'var(--border)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

