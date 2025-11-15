// src/components/atoms/badge.tsx
"use client";
import React from "react";
import clsx from "clsx";

interface BadgeProps {
  label?: string;
  text?: string; // backward compatibility
  variant?: "success" | "warning" | "error" | "info";
  color?: "green" | "gray" | "red" | "yellow" | "blue"; // tambahkan color option
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  text,
  variant = "info",
  color,
}) => {
  const getColorClasses = () => {
    // Jika color diberikan, gunakan color
    if (color) {
      const colorMap = {
        green: "bg-green-100 text-green-700 border border-green-200",
        gray: "bg-gray-100 text-gray-700 border border-gray-200",
        red: "bg-red-100 text-red-700 border border-red-200",
        yellow: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        blue: "bg-blue-100 text-blue-700 border border-blue-200",
      };
      return colorMap[color] || colorMap.gray;
    }

    // Jika tidak, gunakan variant
    const variantMap = {
      success: "bg-green-100 text-green-700 border border-green-200",
      warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      error: "bg-red-100 text-red-700 border border-red-200",
      info: "bg-blue-100 text-blue-700 border border-blue-200",
    };
    return variantMap[variant];
  };

  return (
    <span
      className={clsx(
        "inline-block px-3 py-1 text-xs font-semibold rounded-full select-none whitespace-nowrap",
        getColorClasses()
      )}
    >
      {label || text}
    </span>
  );
};
