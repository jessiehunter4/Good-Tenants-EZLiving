import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				},
				brand: {
					DEFAULT: 'hsl(var(--brand) / <alpha-value>)',
					foreground: 'hsl(var(--brand-foreground) / <alpha-value>)'
				},
				success: {
					DEFAULT: 'hsl(var(--success) / <alpha-value>)',
					foreground: 'hsl(var(--success-foreground) / <alpha-value>)'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
					foreground: 'hsl(var(--warning-foreground) / <alpha-value>)'
				},
				info: {
					DEFAULT: 'hsl(var(--info) / <alpha-value>)',
					foreground: 'hsl(var(--info-foreground) / <alpha-value>)'
				},
				sand: {
					DEFAULT: 'hsl(var(--sand) / <alpha-value>)',
					deep: 'hsl(var(--sand-deep) / <alpha-value>)'
				},
				clay: {
					DEFAULT: 'hsl(var(--clay) / <alpha-value>)',
					soft: 'hsl(var(--clay-soft) / <alpha-value>)'
				},
				espresso: {
					DEFAULT: 'hsl(var(--espresso) / <alpha-value>)',
					muted: 'hsl(var(--espresso-muted) / <alpha-value>)'
				},
				cta: {
					browse: {
						DEFAULT: 'hsl(var(--cta-browse) / <alpha-value>)',
						foreground: 'hsl(var(--cta-browse-foreground) / <alpha-value>)',
						/* Darkened, for small text on a white surface. */
						ink: 'hsl(var(--cta-browse-ink, var(--cta-browse)) / <alpha-value>)'
					},
					qualify: {
						DEFAULT: 'hsl(var(--cta-qualify) / <alpha-value>)',
						foreground: 'hsl(var(--cta-qualify-foreground) / <alpha-value>)',
						ink: 'hsl(var(--cta-qualify-ink, var(--cta-qualify)) / <alpha-value>)'
					}
				},
				landlord: {
					navy: {
						DEFAULT: 'hsl(var(--landlord-navy, var(--espresso)) / <alpha-value>)',
						foreground: 'hsl(var(--landlord-navy-foreground, var(--sand)) / <alpha-value>)'
					}
				},
				role: {
					tenant: {
						DEFAULT: 'hsl(var(--role-tenant) / <alpha-value>)',
						foreground: 'hsl(var(--role-tenant-foreground) / <alpha-value>)'
					},
					landlord: {
						DEFAULT: 'hsl(var(--role-landlord) / <alpha-value>)',
						foreground: 'hsl(var(--role-landlord-foreground) / <alpha-value>)'
					},
					agent: {
						DEFAULT: 'hsl(var(--role-agent) / <alpha-value>)',
						foreground: 'hsl(var(--role-agent-foreground) / <alpha-value>)'
					}
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background) / <alpha-value>)',
					foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
					primary: 'hsl(var(--sidebar-primary) / <alpha-value>)',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground) / <alpha-value>)',
					accent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
					border: 'hsl(var(--sidebar-border) / <alpha-value>)',
					ring: 'hsl(var(--sidebar-ring) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
