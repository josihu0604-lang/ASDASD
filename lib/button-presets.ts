// Button Presets using Design Tokens

export const buttonBase =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-[colors,transform,opacity] duration-[var(--dur-md)] ease-[var(--ease-out)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

export const buttonSizes = {
  sm: "h-9 px-3 text-sm gap-[var(--sp-1)]",
  md: "h-11 px-4 text-base gap-[var(--sp-2)]",
  lg: "h-12 px-6 text-lg gap-[var(--sp-2)]",
  icon: "h-12 w-12",
};

export const buttonVariants = {
  primary: `${buttonBase} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)] active:scale-98`,
  ghost: `${buttonBase} text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]`,
  outline: `${buttonBase} border border-[var(--brand)] text-[var(--brand)] hover:bg-[color-mix(in_oklab,var(--brand)_12%,transparent)]`,
  danger: `${buttonBase} bg-[var(--danger)] text-white hover:opacity-90 active:scale-98`,
  secondary: `${buttonBase} bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--border)] active:scale-98`,
};

export function getButtonClasses(
  variant: keyof typeof buttonVariants = 'primary',
  size: keyof typeof buttonSizes = 'md',
  className?: string
) {
  return `${buttonVariants[variant]} ${buttonSizes[size]} ${className || ''}`;
}
