"use client";
import React from "react";
import { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComp,
  size = 20,
  className,
}) => <IconComp size={size} className={`text-gray-700 ${className || ""}`} />;
