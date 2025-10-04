// components/Button.tsx
import React, { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "alternative";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void; // onClick typé
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles =
    "group relative w-full mx-auto flex items-center justify-center py-2 px-4 text-sm font-medium rounded-4xl disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-secondary text-black border-transparent",
    secondary: "bg-white text-primary border-2 border-primary",
    alternative: "bg-alternative text-black border-transparent",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick} // <-- onClick appliqué
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
