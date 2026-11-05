import React from "react";
import { ColorCode, COLOR_CONFIG } from "@/lib/fifo/color-rules";
import { AlertTriangle, RotateCw, Box } from "lucide-react";

interface BadgeProps {
  colorCode: ColorCode;
  customText?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function ColorBadge({
  colorCode,
  customText,
  size = "md",
  showIcon = true,
}: BadgeProps) {
  const config = COLOR_CONFIG[colorCode];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5 font-medium",
    lg: "text-base px-4 py-2 gap-2 font-bold",
  };

  const renderIcon = () => {
    const iconProps = { className: size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4" };
    switch (config.iconName) {
      case "AlertTriangle":
        return <AlertTriangle {...iconProps} />;
      case "RotateCw":
        return <RotateCw {...iconProps} />;
      case "Box":
        return <Box {...iconProps} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm tracking-wide ${sizeClasses[size]} ${config.badgeClass}`}
      style={{ backgroundColor: config.hex }}
    >
      {showIcon && renderIcon()}
      <span>{customText || config.label}</span>
    </span>
  );
}

