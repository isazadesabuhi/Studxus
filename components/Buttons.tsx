// components/Button.tsx
import React, { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "alternative" | "ghost";

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
    "group relative w-full mx-auto flex items-center justify-center py-[8px] px-4 text-sm font-medium rounded-[18px] disabled:opacity-50 disabled:cursor-not-allowed text-[#FAB818]";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#1A3A60] text-[#FAB818] border-transparent",
    secondary: "bg-white text-primary border-2 border-primary",
    alternative: "bg-alternative text-black border-transparent",
    ghost: "bg-transparent hover:bg-gray-100",
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
