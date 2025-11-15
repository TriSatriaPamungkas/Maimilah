"use client";
import React from "react";

interface LabelProps {
  text: string;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ text, required }) => (
  <label className="text-sm font-medium text-gray-700">
    {text}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);
