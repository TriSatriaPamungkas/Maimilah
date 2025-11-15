"use client";
import React from "react";
import { Users, CalendarDays, ClipboardList } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: "users" | "calendar" | "list";
  color?: string;
}

const iconMap = {
  users: <Users className="w-6 h-6 text-blue-600" />,
  calendar: <CalendarDays className="w-6 h-6 text-green-600" />,
  list: <ClipboardList className="w-6 h-6 text-purple-600" />,
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon = "users",
  color = "bg-white",
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl shadow-md border border-gray-200 ${color} hover:shadow-lg transition`}
    >
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{value}</h2>
      </div>
      <div className="bg-gray-100 p-3 rounded-xl">{iconMap[icon]}</div>
    </div>
  );
};
