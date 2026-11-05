import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "outline";
  size?: "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Touch target mínimo de 48px para entornos de almacén
  const sizeClasses = {
    md: "min-h-[48px] px-4 py-2.5 text-base font-semibold",
    lg: "min-h-[56px] px-6 py-3 text-lg font-bold",
    xl: "min-h-[64px] px-8 py-4 text-xl font-extrabold",
  };

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-[0.98]",
    secondary: "bg-zinc-700 hover:bg-zinc-800 text-white shadow active:scale-[0.98]",
    danger: "bg-[#E53E3E] hover:bg-red-700 text-white shadow-md active:scale-[0.98]",
    warning: "bg-[#D69E2E] hover:bg-amber-600 text-zinc-950 shadow-md font-bold active:scale-[0.98]",
    success: "bg-[#38A169] hover:bg-emerald-700 text-white shadow-md active:scale-[0.98]",
    outline: "bg-white border-2 border-zinc-300 text-zinc-800 hover:bg-zinc-100",
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:pointer-events-none select-none ${
        fullWidth ? "w-full" : ""
      } ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

