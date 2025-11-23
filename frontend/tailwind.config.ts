import type { Config } from "tailwindcss";

import tailwindcss_animate from "tailwindcss-animate";

const config: Config = {
  	darkMode: ["class"],
  	content: [
    	"./pages/**/*.{js,ts,jsx,tsx,mdx}",
    	"./components/**/*.{js,ts,jsx,tsx,mdx}",
    	"./app/**/*.{js,ts,jsx,tsx,mdx}",
  	],
  	theme: {
  		extend: {
  			colors: {
				background: {
					DEFAULT: 'rgb(var(--background-100) / <alpha-value>)',
					100: 'rgb(var(--background-100) / <alpha-value>)',
					200: 'rgb(var(--background-200) / <alpha-value>)',
					300: 'rgb(var(--background-300) / <alpha-value>)',
					m: 'rgb(var(--background-m) / <alpha-value>)',
				},
				foreground: {
					DEFAULT: 'rgb(var(--foreground-100) / <alpha-value>)',
					200: 'rgb(var(--foreground-200) / <alpha-value>)',
				},
				bg: {
					light: {
						100: 'rgb(var(--color-bg-light-100) / <alpha-value>)',
						200: 'rgb(var(--color-bg-light-200) / <alpha-value>)',
						300: 'rgb(var(--color-bg-light-300) / <alpha-value>)',
						m: 'rgb(var(--color-bg-light-m) / <alpha-value>)',
					},
					dark: {
						100: 'rgb(var(--color-bg-dark-100) / <alpha-value>)',
						200: 'rgb(var(--color-bg-dark-200) / <alpha-value>)',
						300: 'rgb(var(--color-bg-dark-300) / <alpha-value>)',
						m: 'rgb(var(--color-bg-dark-m) / <alpha-value>)',
					},
				},
				fg: {
					light: {
						100: 'rgb(var(--color-fg-light-100) / <alpha-value>)',
						200: 'rgb(var(--color-fg-light-200) / <alpha-value>)',
					},
					dark: {
						100: 'rgb(var(--color-fg-dark-100) / <alpha-value>)',
						200: 'rgb(var(--color-fg-dark-200) / <alpha-value>)',
					},
				},
				primary: {
					DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
					foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
				},
				error: {
					DEFAULT: 'rgb(var(--error) / <alpha-value>)',
					foreground: 'rgb(var(--error-foreground) / <alpha-value>)',
				},
				love: {
					DEFAULT: 'rgb(var(--love) / <alpha-value>)',
					foreground: 'rgb(var(--love-foreground) / <alpha-value>)',
				},
				close: {
					DEFAULT: 'rgb(var(--close-friend) / <alpha-value>)',
					foreground: 'rgb(var(--close-friend-foreground) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
			},
			fontFamily: {
				poppins: [
					'var(--font-poppins)'
				]
			},
			boxShadow: {
				'drop-1': '0px 10px 30px 0px rgba(66, 71, 97, 0.1)',
				'drop-2': '0 8px 30px 0 rgba(65, 89, 214, 0.3)',
				'drop-3': '0 8px 30px 0 rgba(65, 89, 214, 0.1)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'caret-blink': {
					'0%,70%,100%': {
						opacity: '1'
					},
					'20%,50%': {
						opacity: '0'
					}
				}
			},
			animation: {
				'caret-blink': 'caret-blink 1.25s ease-out infinite'
			}
  		}
  	},
  	plugins: [tailwindcss_animate],
};
export default config;