import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Breadcrumbs } from "../../components/common/Breadcrumbs";
import { EmptyState } from "../../components/common/EmptyState";
import { Bell, Check, Clock, ExternalLink } from "lucide-react";
import { api } from "../../services/api";
import { NotificationItem } from "../../types";

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    api
      .getNotifications()
      .then((data) => setNotifications(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "Notifications & Alerts" }]} />

      <div>
        <h1 className="font-serif text-3xl font-bold text-midnight">Notifications & Alerts</h1>
        <p className="text-xs text-muted-slate mt-1">
          Review real-time updates regarding application reviews, buyer consent, and confirmed blockchain transactions.
        </p>
      </div>

      <Card>
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-6 h-6" />}
            title="No Notifications Yet"
            description="You will receive alerts here when your land applications or transfer requests undergo state changes."
          />
        ) : (
          <div className="divide-y divide-ivory-200">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`py-4 px-2 flex items-start justify-between gap-4 transition-colors ${
                  !n.isRead ? "bg-gold/5" : ""
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-midnight">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-slate leading-relaxed">{n.message}</p>
                  <div className="flex items-center space-x-4 pt-1 text-[11px] text-muted-slate">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-muted-slate" />
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.actionUrl && (
                      <Link
                        to={n.actionUrl}
                        className="text-gold-dark hover:underline flex items-center font-medium"
                      >
                        View Details <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>

                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(n.id)}
                    className="shrink-0 text-xs text-muted-slate hover:text-midnight"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Mark read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
