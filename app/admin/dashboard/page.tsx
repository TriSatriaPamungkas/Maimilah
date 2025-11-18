/* eslint-disable react-hooks/set-state-in-effect */
// app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useEventStore } from "@/src/store/useEventStore";
import { useFeedbackStore } from "@/src/store/useFeedbackStore";
import { useActivityStore } from "@/src/store/useActivityStore";
import { ActivityModel } from "@/src/models/activity";
import { Calendar, Users, MessageSquare, TrendingUp } from "lucide-react";

const AdminDashboardPage: React.FC = () => {
  const { events, fetchEvents, getParticipantsCount } = useEventStore();
  const { feedbacks, fetchFeedbacks } = useFeedbackStore();
  const { activities, checkAndClearDaily } = useActivityStore();
  const [totalParticipants, setTotalParticipants] = useState(0);

  // ✅ Check for daily reset on component mount and periodically
  useEffect(() => {
    checkAndClearDaily();

    // Check every minute for midnight reset
    const interval = setInterval(() => {
      checkAndClearDaily();
    }, 60000); // Check every 1 minute

    return () => clearInterval(interval);
  }, [checkAndClearDaily]);

  useEffect(() => {
    fetchEvents();
    fetchFeedbacks();
  }, [fetchEvents, fetchFeedbacks]);

  useEffect(() => {
    // Hitung total partisipan dari semua event
    const total = events.reduce((sum, event) => {
      const eventId = event._id || event.id;
      return sum + (eventId ? getParticipantsCount(eventId) : 0);
    }, 0);
    setTotalParticipants(total);
  }, [events, getParticipantsCount]);

  // Calculate stats
  const totalEvents = events.length;
  const totalFeedbacks = feedbacks.length;

  // ✅ Get recent activities - limit to 7
  const displayedActivities = useMemo(() => {
    return activities.slice(0, 7);
  }, [activities]);

  // ✅ Calculate remaining activities
  const remainingActivities = Math.max(0, activities.length - 7);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome,{" "}
            <span className="text-green-600 font-semibold">
              Administrator Maimilah
            </span>
            !
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Events */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {totalEvents}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">TOTAL EVENTS</div>
            <div className="text-xs text-gray-500">Active events</div>
          </div>

          {/* Total Participants */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {totalParticipants}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">TOTAL PARTICIPANTS</div>
            <div className="text-xs text-gray-500">Registered users</div>
          </div>

          {/* Total Feedbacks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {totalFeedbacks}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">TOTAL FEEDBACKS</div>
            <div className="text-xs text-gray-500">User messages</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activity
            </h2>
            {activities.length > 0 && (
              <span className="ml-auto text-xs text-gray-500">
                Today • {activities.length} total
              </span>
            )}
          </div>

          {displayedActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">Belum ada aktivitas terbaru</p>
              <p className="text-xs mt-1">
                Aktivitas akan muncul saat ada event baru, pendaftaran, atau
                feedback
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {displayedActivities.map((activity) => {
                  const icon = ActivityModel.getActivityIcon(activity.type);
                  const colorClass = ActivityModel.getActivityColor(
                    activity.type
                  );
                  const timeAgo = ActivityModel.getRelativeTime(
                    activity.createdAt
                  );

                  return (
                    <div
                      key={activity._id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colorClass}`}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium">
                          {activity.description}
                        </p>
                        {activity.metadata && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {activity.metadata.eventTitle && (
                              <span>Event: {activity.metadata.eventTitle}</span>
                            )}
                            {activity.metadata.participantName && (
                              <span>
                                {" "}
                                • {activity.metadata.participantName}
                              </span>
                            )}
                            {activity.metadata.userName && (
                              <span> • {activity.metadata.userName}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs text-gray-400">{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ✅ Show remaining activities count */}
              {remainingActivities > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-medium">
                      +{remainingActivities} activit
                      {remainingActivities === 1 ? "y" : "ies"}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
