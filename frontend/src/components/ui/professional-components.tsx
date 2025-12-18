/**
 * Professional UI Components
 * Enterprise-grade components with proper styling
 */

"use client";

import React from "react";
import { LucideIcon, TrendingUp, Users, Calendar, CheckCircle2 } from "lucide-react";

// ============================================================
// STAT CARD - KPI Display
// ============================================================
interface StatCardProps {
  title: string;
  value: string | number;
  metric?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "info";
}

export function StatCard({
  title,
  value,
  metric,
  icon: Icon,
  trend,
  color = "primary",
}: StatCardProps) {
  const colorClasses = {
    primary: "bg-[#010030] text-white", // FCS Midnight Blue
    success: "bg-[#1F7A63] text-white", // Ministry Green
    warning: "bg-[#D97706] text-white", // Warm Amber
    info: "bg-[#2563EB] text-white", // Digital Blue
  };

  return (
    <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#475569] mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0F172A]">{value}</span>
            {metric && <span className="text-sm text-[#64748B]">{metric}</span>}
          </div>
          {trend && (
            <div className={`mt-2 text-xs font-medium ${trend.isPositive ? "text-[#1F7A63]" : "text-[#B91C1C]"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EVENT CARD - Event Preview
// ============================================================
interface EventCardProps {
  title: string;
  date: string;
  location: string;
  registrations: number;
  capacity: number;
  participationMode: "ONLINE" | "ON_SITE" | "HYBRID";
  status: "draft" | "published" | "active" | "completed";
}

export function EventCard({
  title,
  date,
  location,
  registrations,
  capacity,
  participationMode,
  status,
}: EventCardProps) {
  // FCS Design System v2.1 - Participation Mode Colors
  const modeClasses = {
    ONLINE: "bg-[#EFF6FF] text-[#1D4ED8]", // Digital Blue
    ON_SITE: "bg-[#FFFBEB] text-[#F59E0B]", // Warm Amber
    HYBRID: "bg-[#F3E8FF] text-[#6D28D9]", // Royal Purple
  };

  const statusClasses = {
    draft: "bg-[#F1F5F9] text-[#334155]",
    published: "bg-[#EFF6FF] text-[#2563EB]",
    active: "bg-[#E8F5F1] text-[#1F7A63]",
    completed: "bg-[#F1F5F9] text-[#334155]",
  };

  const capacityPercent = (registrations / capacity) * 100;

  return (
    <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-1">{title}</h3>
          <p className="text-sm text-[#475569]">{date}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[#475569]">Location</p>
          <p className="font-medium text-[#0F172A]">{location}</p>
        </div>
        <div>
          <p className="text-[#475569]">Mode</p>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${modeClasses[participationMode]}`}>
            {participationMode === "ONLINE" ? "Online" : participationMode === "ON_SITE" ? "On-Site" : "Hybrid"}
          </span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-[#334155]">Registrations</p>
          <p className="text-sm text-[#475569]">
            {registrations} / {capacity}
          </p>
        </div>
        <div className="w-full bg-[#E2E8F0] rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              capacityPercent > 90 ? "bg-[#B91C1C]" : capacityPercent > 70 ? "bg-[#D97706]" : "bg-[#1F7A63]"
            }`}
            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MEMBER CARD - Member Profile Preview
// ============================================================
interface MemberCardProps {
  name: string;
  email: string;
  phone: string;
  memberCode: string;
  joinDate: string;
  status: "primary" | "secondary" | "tertiary" | "associate";
  avatar?: string;
}

export function MemberCard({
  name,
  email,
  phone,
  memberCode,
  joinDate,
  status,
}: MemberCardProps) {
  const statusClasses = {
    primary: "bg-[#F3E8FF] text-[#6D28D9]", // Royal Purple
    secondary: "bg-[#EFF6FF] text-[#2563EB]", // Digital Blue
    tertiary: "bg-[#E8F5F1] text-[#1F7A63]", // Ministry Green
    associate: "bg-[#F1F5F9] text-[#334155]", // Neutral
  };

  return (
    <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-sm p-6 space-y-4">
      {/* Avatar & Name */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0F172A]">{name}</h3>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${statusClasses[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-[#475569]">Email</p>
          <p className="text-[#0F172A] font-medium">{email}</p>
        </div>
        <div>
          <p className="text-[#475569]">Phone</p>
          <p className="text-[#0F172A] font-medium">{phone}</p>
        </div>
      </div>

      {/* Member Info */}
      <div className="border-t border-[#CBD5E1] pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#475569]">Member Code</span>
          <span className="font-mono font-medium text-[#0F172A]">{memberCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#475569]">Joined</span>
          <span className="text-[#0F172A]">{joinDate}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ATTENDANCE BADGE
// ============================================================
interface AttendanceBadgeProps {
  attended: number;
  registered: number;
  compact?: boolean;
}

export function AttendanceBadge({
  attended,
  registered,
  compact = false,
}: AttendanceBadgeProps) {
  const percentage = Math.round((attended / registered) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#1F7A63]" />
        <span className="text-sm font-medium text-[#0F172A]">
          {attended}/{registered} ({percentage}%)
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-[#E8F5F1] rounded-lg p-3 border border-[#1F7A63]">
      <div>
        <p className="text-sm text-[#1F7A63] font-medium">Attendance Rate</p>
        <p className="text-2xl font-bold text-[#1F7A63]">{percentage}%</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-[#1F7A63]">{attended} attended</p>
        <p className="text-sm text-[#1F7A63]">{registered} registered</p>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 bg-[#F1F5F9] rounded-lg mb-4">
        <Icon className="w-8 h-8 text-[#475569]" />
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-[#475569] max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button className="px-4 py-2 bg-[#010030] text-white rounded-lg font-medium hover:opacity-90 transition-opacity" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

// ============================================================
// LOADING SKELETON
// ============================================================
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-sm p-6 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-[#E2E8F0] rounded w-1/3"></div>
        <div className="h-10 w-10 bg-[#E2E8F0] rounded-lg"></div>
      </div>
      <div className="h-8 bg-[#E2E8F0] rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-4 bg-[#E2E8F0] rounded w-full"></div>
        <div className="h-4 bg-[#E2E8F0] rounded w-3/4"></div>
      </div>
    </div>
  );
}
