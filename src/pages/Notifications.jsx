import { useState } from "react";
import Layout from "../components/layout/Layout";

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "task",
      title: "Task completed",
      message: "Your task “Complete project documentation” was marked as completed.",
      time: "10 minutes ago",
      unread: true,
      icon: "✓",
    },
    {
      id: 2,
      type: "reminder",
      title: "Task reminder",
      message: "You have a task due today. Don't forget to complete it.",
      time: "1 hour ago",
      unread: true,
      icon: "◷",
    },
    {
      id: 3,
      type: "activity",
      title: "Profile updated",
      message: "Your profile information was successfully updated.",
      time: "3 hours ago",
      unread: true,
      icon: "●",
    },
    {
      id: 4,
      type: "task",
      title: "New task assigned",
      message: "A new task has been added to your task list.",
      time: "Yesterday",
      unread: false,
      icon: "+",
    },
    {
      id: 5,
      type: "system",
      title: "Welcome to Task Tracker",
      message: "Your Task Tracker workspace is ready to use.",
      time: "2 days ago",
      unread: false,
      icon: "★",
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Layout>
      <div className="notifications-page">
        <div className="notifications-header">
          <div>
            <div className="notifications-eyebrow">ACCOUNT</div>

            <h1>Notifications</h1>

            <p>
              Stay updated with your tasks, account activity and reminders.
            </p>
          </div>

          <div className="notifications-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-action-button"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                className="notification-clear-button"
                onClick={clearAll}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="notifications-summary">
          <div className="notification-summary-card">
            <div className="notification-summary-icon">♢</div>

            <div>
              <strong>{notifications.length}</strong>
              <span>Total Notifications</span>
            </div>
          </div>

          <div className="notification-summary-card">
            <div className="notification-summary-icon unread-icon">
              ●
            </div>

            <div>
              <strong>{unreadCount}</strong>
              <span>Unread</span>
            </div>
          </div>

          <div className="notification-summary-card">
            <div className="notification-summary-icon">
              ✓
            </div>

            <div>
              <strong>
                {notifications.length - unreadCount}
              </strong>
              <span>Read</span>
            </div>
          </div>
        </div>

        <section className="notifications-card">
          <div className="notifications-card-header">
            <div>
              <h2>Recent Notifications</h2>
              <p>Your latest account and task activity.</p>
            </div>

            {unreadCount > 0 && (
              <span className="unread-badge">
                {unreadCount} unread
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">✓</div>

              <h3>You're all caught up</h3>

              <p>
                There are no notifications to show right now.
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.unread ? "notification-unread" : ""
                  }`}
                >
                  <div
                    className={`notification-type-icon ${notification.type}`}
                  >
                    {notification.icon}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h3>{notification.title}</h3>

                      {notification.unread && (
                        <span className="notification-dot" />
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <span className="notification-time">
                      {notification.time}
                    </span>
                  </div>

                  {notification.unread && (
                    <button
                      type="button"
                      className="mark-read-button"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .notifications-page {
          min-height: 100vh;
          padding: 52px 42px 60px;
          color: #ffffff;
          background:
            radial-gradient(
              circle at 85% 0%,
              rgba(91, 66, 232, 0.13),
              transparent 28%
            ),
            #071126;
        }

        .notifications-header {
          max-width: 1500px;
          margin: 0 auto 30px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
        }

        .notifications-eyebrow {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #927cff;
          margin-bottom: 8px;
        }

        .notifications-header h1 {
          margin: 0;
          font-size: clamp(38px, 4vw, 58px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .notifications-header p {
          margin: 14px 0 0;
          color: #8ea4d3;
          font-size: 16px;
        }

        .notifications-header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .notification-action-button,
        .notification-clear-button {
          border-radius: 10px;
          padding: 11px 15px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .notification-action-button {
          border: 1px solid rgba(130, 107, 255, 0.45);
          background: rgba(104, 72, 245, 0.1);
          color: #a796ff;
        }

        .notification-action-button:hover {
          background: #6848f5;
          color: #ffffff;
        }

        .notification-clear-button {
          border: 1px solid rgba(255, 100, 130, 0.25);
          background: rgba(255, 80, 110, 0.08);
          color: #ff8fa5;
        }

        .notification-clear-button:hover {
          background: rgba(255, 80, 110, 0.16);
        }

        .notifications-summary {
          max-width: 1500px;
          margin: 0 auto 22px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .notification-summary-card {
          min-height: 92px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px 20px;
          border-radius: 17px;
          background: linear-gradient(
            145deg,
            rgba(20, 48, 93, 0.96),
            rgba(10, 30, 63, 0.96)
          );
          border: 1px solid rgba(112, 145, 210, 0.2);
        }

        .notification-summary-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(104, 72, 245, 0.17);
          color: #9b87ff;
          font-size: 20px;
          font-weight: 800;
        }

        .unread-icon {
          color: #ff6b91;
          background: rgba(255, 90, 130, 0.12);
        }

        .notification-summary-card strong {
          display: block;
          font-size: 24px;
        }

        .notification-summary-card span {
          display: block;
          margin-top: 3px;
          color: #8198c5;
          font-size: 12px;
        }

        .notifications-card {
          max-width: 1500px;
          margin: 0 auto;
          background: linear-gradient(
            145deg,
            rgba(20, 48, 93, 0.96),
            rgba(10, 30, 63, 0.96)
          );
          border: 1px solid rgba(112, 145, 210, 0.2);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
        }

        .notifications-card-header {
          min-height: 88px;
          padding: 20px 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid rgba(126, 151, 201, 0.12);
        }

        .notifications-card-header h2 {
          margin: 0;
          font-size: 19px;
        }

        .notifications-card-header p {
          margin: 5px 0 0;
          color: #8299c8;
          font-size: 13px;
        }

        .unread-badge {
          background: rgba(255, 90, 130, 0.1) !important;
          color: #ff8da8 !important;
          border: 1px solid rgba(255, 90, 130, 0.2);
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 11px !important;
          font-weight: 700;
          white-space: nowrap;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
        }

        .notification-item {
          min-height: 105px;
          padding: 20px 25px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(126, 151, 201, 0.1);
          transition: background 0.2s ease;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.015);
        }

        .notification-unread {
          background: rgba(104, 72, 245, 0.025);
        }

        .notification-type-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 800;
        }

        .notification-type-icon.task {
          color: #4ce0ae;
          background: rgba(37, 211, 157, 0.12);
        }

        .notification-type-icon.reminder {
          color: #ffb14a;
          background: rgba(255, 177, 74, 0.12);
        }

        .notification-type-icon.activity {
          color: #9a83ff;
          background: rgba(104, 72, 245, 0.15);
        }

        .notification-type-icon.system {
          color: #66aaff;
          background: rgba(74, 145, 255, 0.12);
        }

        .notification-content {
          min-width: 0;
          flex: 1;
        }

        .notification-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-title-row h3 {
          margin: 0;
          font-size: 14px;
        }

        .notification-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ff5c86;
        }

        .notification-content p {
          margin: 6px 0;
          color: #8ca3d0;
          font-size: 12px;
          line-height: 1.5;
        }

        .notification-time {
          color: #637cae !important;
          font-size: 11px !important;
        }

        .mark-read-button {
          flex-shrink: 0;
          border: 1px solid rgba(130, 107, 255, 0.35);
          background: transparent;
          color: #a796ff;
          padding: 8px 11px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .mark-read-button:hover {
          background: rgba(104, 72, 245, 0.12);
        }

        .notifications-empty {
          padding: 80px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(37, 211, 157, 0.1);
          color: #35dba5;
          font-size: 25px;
          font-weight: 800;
        }

        .notifications-empty h3 {
          margin: 0;
          font-size: 18px;
        }

        .notifications-empty p {
          margin: 8px 0 0;
          color: #8198c5;
          font-size: 13px;
        }

        @media (max-width: 900px) {
          .notifications-page {
            padding: 80px 20px 45px;
          }

          .notifications-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .notifications-summary {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .notifications-page {
            padding: 78px 15px 35px;
          }

          .notifications-card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .notification-item {
            align-items: flex-start;
            padding: 18px;
          }

          .mark-read-button {
            display: none;
          }

          .notifications-header-actions {
            width: 100%;
          }

          .notification-action-button,
          .notification-clear-button {
            flex: 1;
          }
        }
      `}</style>
    </Layout>
  );
}

export default Notifications;