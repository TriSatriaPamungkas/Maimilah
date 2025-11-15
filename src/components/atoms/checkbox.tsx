"use client";
import React from "react";
import clsx from "clsx";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean, value?: string) => void;
  label?: string;
  value?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  value,
  disabled = false,
  size = "md",
}) => {
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <label
      className={clsx(
        "flex items-center gap-2 cursor-pointer select-none text-sm",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.checked, e.target.value)}
        className={clsx(
          sizeClass,
          "accent-blue-600 rounded focus:ring-2 focus:ring-blue-400 transition"
        )}
      />
      {label && <span>{label}</span>}
    </label>
  );
};
