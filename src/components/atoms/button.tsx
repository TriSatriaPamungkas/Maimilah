"use client";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  type = "button",
}: ButtonProps) => {
  const base =
    " px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none";
  const styles =
    variant === "primary"
      ? "bg-green-600 hover:bg-green-800 text-white"
      : "bg-gray-300 hover:bg-gray-500 text-gray-800 hover:text-white";
  const width = fullWidth ? "w-full" : "w-auto";
  const disabledStyle = disabled ? "opacity-100 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${width} ${disabledStyle}`}
    >
      {children}
    </button>
  );
};
