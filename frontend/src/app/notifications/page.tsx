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
  AlertCircle,
  Loader2
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
    recipientType: "all",
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
    const initData = async () => {
      console.log("Initializing notifications data...", { isAdmin, userId: user?.id });
      await fetchNotifications();
      if (isAdmin) {
        console.log("User is admin, fetching events and members...");
        await Promise.all([fetchEvents(), fetchMembers()]);
      }
    };

    if (user) {
      initData();
    }
  }, [user, isAdmin]);

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
      const data = response.data?.data || response.data || response || [];
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

      const notificationData: any = {
        deliveryMethod: notificationForm.deliveryMethod.toUpperCase(),
        subject: notificationForm.subject,
        message: notificationForm.message,
      };

      let recipients = [];
      if (notificationForm.recipientType === "user" && notificationForm.recipientId) {
        const selectedMember = members.find(m => m.id === notificationForm.recipientId);
        notificationData.recipientId = notificationForm.recipientId;
        notificationData.recipientEmail = selectedMember?.email;
        notificationData.recipientPhone = selectedMember?.phoneNumber;
      } else if (notificationForm.recipientType === "event" && notificationForm.recipientId) {
        const response: any = await api.get(`/registrations?eventId=${notificationForm.recipientId}`);
        const registrations = response.data?.data || response.data || [];
        recipients = registrations
          .filter((r: any) => r.member)
          .map((r: any) => ({
            id: r.member.id,
            email: r.member.email,
            phone: r.member.phoneNumber || r.member.phone
          }));
        if (recipients.length === 0) {
          toast.error("No registered members found for this event");
          setSendLoading(false);
          return;
        }
      } else {
        recipients = members.map(m => ({
          id: m.id,
          email: m.email,
          phone: m.phoneNumber || m.phone
        }));
        if (recipients.length === 0) {
          toast.error("No members found to send notifications to");
          setSendLoading(false);
          return;
        }
      }

      const result: any = await (notificationForm.recipientType === "user" && notificationForm.recipientId
        ? notificationsApi.send(notificationData)
        : notificationsApi.sendBatch({ ...notificationData, recipients }));

      if (result.data?.sent === 0 && result.data?.failed > 0) {
        toast.error(`Failed to send notifications. ${result.data.failed} failed.`);
      } else {
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
      }
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(error.message || "Failed to send notification");
    } finally {
      setSendLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getHistory();
      const data = (response as any).data || response;
      const notificationsList = Array.isArray(data) ? data : (data as any).data;
      setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterStatus === "all") return true;
    return n.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const stats = {
    total: Array.isArray(notifications) ? notifications.length : 0,
    sent: Array.isArray(notifications) ? notifications.filter(n => ["SENT", "DELIVERED", "sent", "delivered"].includes(n.status)).length : 0,
    pending: Array.isArray(notifications) ? notifications.filter(n => ["PENDING", "pending"].includes(n.status)).length : 0,
    failed: Array.isArray(notifications) ? notifications.filter(n => ["FAILED", "failed"].includes(n.status)).length : 0,
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Sent", value: stats.total, icon: Bell, border: "border-blue-100", bg: "bg-blue-50", text: "text-blue-600" },
                { label: "Delivered", value: stats.sent, icon: CheckCircle, border: "border-green-100", bg: "bg-green-50", text: "text-green-600" },
                { label: "Pending", value: stats.pending, icon: Clock, border: "border-yellow-100", bg: "bg-yellow-50", text: "text-yellow-600" },
                { label: "Failed", value: stats.failed, icon: AlertCircle, border: "border-red-100", bg: "bg-red-50", text: "text-red-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.border} border`}>
                    <stat.icon className={`w-5 h-5 ${stat.text}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions - Admin Only */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Email", desc: "Batch Email Updates", icon: Mail, from: "from-blue-500", to: "to-blue-600", type: "email" },
                { label: "SMS", desc: "Direct Text Messaging", icon: MessageSquare, from: "from-green-500", to: "to-green-600", type: "sms" },
                { label: "Push", desc: "Browser Notifications", icon: Bell, from: "from-purple-500", to: "to-purple-600", type: "push" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setNotificationForm(prev => ({ ...prev, deliveryMethod: action.type as any }));
                    setShowSendModal(true);
                  }}
                  className={`bg-gradient-to-br ${action.from} ${action.to} rounded-xl shadow-md p-4 transition-all hover:shadow-lg hover:-translate-y-1 flex items-center gap-4 text-left group`}
                >
                  <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg group-hover:bg-white/30 transition-colors">
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{action.label}</h3>
                    <p className="text-white/80 text-xs">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {["all", "sent", "pending", "failed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filterStatus === status
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-20 text-center border border-gray-100">
              <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No notifications found</h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                {isAdmin ? "Configure and send your first global or targeted notification to members." : "You have no notifications at this time."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-5 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 leading-tight">{notification.subject || "No Subject"}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${["SENT", "DELIVERED", "sent", "delivered"].includes(notification.status) ? "bg-green-100 text-green-700" :
                            ["PENDING", "pending"].includes(notification.status) ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                            }`}>
                            {notification.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{notification.message}</p>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400">
                          <span className="flex items-center gap-1.5 uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(notification.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1.5 uppercase tracking-wider">
                            {notification.deliveryMethod.toLowerCase() === "email" && <Mail className="w-3.5 h-3.5 text-blue-400" />}
                            {notification.deliveryMethod.toLowerCase() === "sms" && <MessageSquare className="w-3.5 h-3.5 text-green-400" />}
                            {notification.deliveryMethod.toLowerCase() === "push" && <Bell className="w-3.5 h-3.5 text-purple-400" />}
                            {notification.deliveryMethod}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Send Notification</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                disabled={sendLoading}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipient</label>
                  <select
                    value={notificationForm.recipientType}
                    onChange={(e) => setNotificationForm({ ...notificationForm, recipientType: e.target.value, recipientId: "" })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">Every Member</option>
                    <option value="event">By Event</option>
                    <option value="user">Single User</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</label>
                  <select
                    value={notificationForm.deliveryMethod}
                    onChange={(e) => setNotificationForm({ ...notificationForm, deliveryMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                  </select>
                </div>
              </div>

              {(notificationForm.recipientType === "event" || notificationForm.recipientType === "user") && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {notificationForm.recipientType === "event" ? "Target Event" : "Select User"}
                  </label>
                  <select
                    value={notificationForm.recipientId}
                    onChange={(e) => setNotificationForm({ ...notificationForm, recipientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose {notificationForm.recipientType}...</option>
                    {(notificationForm.recipientType === "event" ? events : members).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.title || `${item.firstName} ${item.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject Line</label>
                <input
                  type="text"
                  value={notificationForm.subject}
                  onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a descriptive title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Body</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Draft your message content here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 resize-none h-24"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                disabled={sendLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={sendLoading}
                className="flex-[2] px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
