import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `;

  const sizeStyles = {
    small: 'padding: 8px 16px; font-size: 14px;',
    medium: 'padding: 12px 24px; font-size: 16px;',
    large: 'padding: 16px 32px; font-size: 18px;',
  };

  const variantStyles = {
    primary: `
      background: #2196f3;
      color: white;
    `,
    secondary: `
      background: #e0e0e0;
      color: #212121;
    `,
    danger: `
      background: #f44336;
      color: white;
    `,
    success: `
      background: #4caf50;
      color: white;
    `,
  };

  const disabledStyles = disabled
    ? 'opacity: 0.5; cursor: not-allowed;'
    : '';

  const style = {
    ...parseStyles(baseStyles),
    ...parseStyles(sizeStyles[size]),
    ...parseStyles(variantStyles[variant]),
    ...parseStyles(disabledStyles),
  };

  return (
    <button
      className={className}
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function parseStyles(cssString: string): React.CSSProperties {
  const style: Record<string, string> = {};
  cssString
    .split(';')
    .filter(Boolean)
    .forEach((rule) => {
      const [property, value] = rule.split(':').map((s) => s.trim());
      if (property && value) {
        const camelCaseProperty = property.replace(/-([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        style[camelCaseProperty] = value;
      }
    });
  return style as React.CSSProperties;
}
