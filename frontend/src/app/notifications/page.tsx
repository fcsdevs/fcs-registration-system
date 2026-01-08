"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api/client";
import { notificationsApi } from "@/lib/api/notifications";
import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  X,
  Users,
  Calendar,
  User,
  Filter,
  Download,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [notificationForm, setNotificationForm] = useState({
    recipientType: "all", // all, event, user
    recipientId: "",
    deliveryMethod: "email",
    subject: "",
    message: "",
  });

  const isAdmin = user?.roles?.some((r: any) => {
    const role = r.toLowerCase();
    return role.includes('admin') || role === 'leader';
  });

  useEffect(() => {
    fetchNotifications();
    if (isAdmin) {
      fetchEvents();
      fetchMembers();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getHistory();
      const data = response.data?.data || (response as any).data?.items || response.data || response || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get<any>("/events");
      const data = response.data || response || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get<any>("/members");
      const data = response.data || response || [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.subject || !notificationForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSendLoading(true);

      // Prepare the notification data
      const notificationData: any = {
        deliveryMethod: notificationForm.deliveryMethod,
        subject: notificationForm.subject,
        message: notificationForm.message,
      };

      // Handle different recipient types
      if (notificationForm.recipientType === "user" && notificationForm.recipientId) {
        notificationData.recipientId = notificationForm.recipientId;
        await notificationsApi.send(notificationData);
      } else if (notificationForm.recipientType === "event" && notificationForm.recipientId) {
        // Send to all event participants
        await notificationsApi.sendBatch({
          ...notificationData,
          eventId: notificationForm.recipientId,
        });
      } else {
        // Send to all members
        await notificationsApi.sendBatch(notificationData);
      }

      toast.success("Notification sent successfully!");
      setShowSendModal(false);
      setNotificationForm({
        recipientType: "all",
        recipientId: "",
        deliveryMethod: "email",
        subject: "",
        message: "",
      });
      fetchNotifications();
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(error.response?.data?.message || "Failed to send notification");
    } finally {
      setSendLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterStatus === "all") return true;
    return n.status === filterStatus;
  });

  const stats = {
    total: Array.isArray(notifications) ? notifications.length : 0,
    sent: Array.isArray(notifications) ? notifications.filter(n => n.status === "sent" || n.status === "delivered").length : 0,
    pending: Array.isArray(notifications) ? notifications.filter(n => n.status === "pending").length : 0,
    failed: Array.isArray(notifications) ? notifications.filter(n => n.status === "failed").length : 0,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-gray-600 mt-2">
                  {isAdmin ? "Manage and send notifications to your members" : "View your notifications"}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowSendModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Send className="w-5 h-5" />
                  Send Notification
                </button>
              )}
            </div>
          </div>

          {/* Stats - Admin Only */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Bell className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.sent}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Types - Admin Only */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-blue-100 text-sm">Send email notifications</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg">SMS</h3>
                    <p className="text-green-100 text-sm">Send SMS notifications</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg">Push</h3>
                    <p className="text-purple-100 text-sm">Send push notifications</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                {["all", "sent", "pending", "failed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === status
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">
                {isAdmin ? "Start sending notifications to your members" : "You have no notifications"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.subject || notification.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            {notification.deliveryMethod === "email" && <Mail className="w-4 h-4" />}
                            {notification.deliveryMethod === "sms" && <MessageSquare className="w-4 h-4" />}
                            {notification.deliveryMethod === "push" && <Bell className="w-4 h-4" />}
                            {notification.deliveryMethod}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${notification.status === "sent" || notification.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : notification.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {notification.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Send Notification</h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, recipientType: "all", recipientId: "" })}
                    className={`p-4 rounded-xl border-2 transition-all ${notificationForm.recipientType === "all"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">All Members</p>
                  </button>
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, recipientType: "event", recipientId: "" })}
                    className={`p-4 rounded-xl border-2 transition-all ${notificationForm.recipientType === "event"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Event</p>
                  </button>
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, recipientType: "user", recipientId: "" })}
                    className={`p-4 rounded-xl border-2 transition-all ${notificationForm.recipientType === "user"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Specific User</p>
                  </button>
                </div>
              </div>

              {/* Recipient Selection */}
              {notificationForm.recipientType === "event" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event
                  </label>
                  <select
                    value={notificationForm.recipientId}
                    onChange={(e) => setNotificationForm({ ...notificationForm, recipientId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose an event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {notificationForm.recipientType === "user" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <select
                    value={notificationForm.recipientId}
                    onChange={(e) => setNotificationForm({ ...notificationForm, recipientId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a user...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, deliveryMethod: "email" })}
                    className={`p-4 rounded-xl border-2 transition-all ${notificationForm.deliveryMethod === "email"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <Mail className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Email</p>
                  </button>
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, deliveryMethod: "sms" })}
                    className={`p-4 rounded-xl border-2 transition-all ${notificationForm.deliveryMethod === "sms"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">SMS</p>
                  </button>
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, deliveryMethod: "push" })}
                    className={`p-4 rounded-xl border-2 transition-all ${notificationForm.deliveryMethod === "push"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <Bell className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Push</p>
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={notificationForm.subject}
                  onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })}
                  placeholder="Enter notification subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sendLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sendLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Send Notification
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
