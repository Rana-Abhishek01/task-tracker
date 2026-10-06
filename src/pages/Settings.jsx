import { useState } from "react";
import Layout from "../components/layout/Layout";

function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-label="Toggle setting"
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "20px",
        border: "none",
        padding: "3px",
        background: checked ? "#6848f5" : "#25375d",
        cursor: "pointer",
        transition: "0.2s ease",
        display: "flex",
        justifyContent: checked ? "flex-end" : "flex-start",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#fff",
          display: "block",
          boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-header">
          <div>
            <div className="settings-eyebrow">PREFERENCES</div>

            <h1>Settings</h1>

            <p>
              Manage your workspace preferences and notifications.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          {/* Appearance */}
          <section className="settings-card">
            <div className="settings-card-title">
              <div className="settings-icon">◐</div>

              <div>
                <h2>Appearance</h2>
                <p>Customize how Task Tracker looks.</p>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <strong>Dark Mode</strong>
                <span>
                  Use the dark theme across the application.
                </span>
              </div>

              <Toggle
                checked={darkMode}
                onChange={setDarkMode}
              />
            </div>
          </section>

          {/* Notifications */}
          <section className="settings-card">
            <div className="settings-card-title">
              <div className="settings-icon">♢</div>

              <div>
                <h2>Notifications</h2>
                <p>Choose what notifications you receive.</p>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <strong>Email Notifications</strong>
                <span>
                  Receive important updates by email.
                </span>
              </div>

              <Toggle
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <strong>Task Reminders</strong>
                <span>
                  Get reminders about upcoming tasks.
                </span>
              </div>

              <Toggle
                checked={taskReminders}
                onChange={setTaskReminders}
              />
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <strong>Weekly Summary</strong>
                <span>
                  Receive a weekly productivity summary.
                </span>
              </div>

              <Toggle
                checked={weeklySummary}
                onChange={setWeeklySummary}
              />
            </div>
          </section>

          {/* Workspace */}
          <section className="settings-card">
            <div className="settings-card-title">
              <div className="settings-icon">▦</div>

              <div>
                <h2>Workspace</h2>
                <p>Manage your workspace preferences.</p>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <strong>Default Task View</strong>
                <span>
                  Choose how your tasks are displayed.
                </span>
              </div>

              <select
                defaultValue="list"
                className="settings-select"
              >
                <option value="list">List</option>
                <option value="board">Board</option>
                <option value="calendar">Calendar</option>
              </select>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <strong>Default Task Priority</strong>
                <span>
                  Priority assigned to newly created tasks.
                </span>
              </div>

              <select
                defaultValue="Medium"
                className="settings-select"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </section>

          {/* Security */}
          <section className="settings-card">
            <div className="settings-card-title">
              <div className="settings-icon">⌘</div>

              <div>
                <h2>Security</h2>
                <p>Manage your account security.</p>
              </div>
            </div>

            <div className="security-item">
              <div>
                <strong>Password</strong>
                <span>
                  Keep your account password secure.
                </span>
              </div>

              <button
                type="button"
                className="settings-outline-button"
                onClick={() => {
                  window.location.href = "/forgot-password";
                }}
              >
                Change Password
              </button>
            </div>

            <div className="settings-divider" />

            <div className="security-item">
              <div>
                <strong>Active Session</strong>
                <span>
                  You are currently logged in on this device.
                </span>
              </div>

              <span className="session-badge">
                Active
              </span>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .settings-page {
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

        .settings-header {
          max-width: 1500px;
          margin: 0 auto 30px;
        }

        .settings-eyebrow {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #927cff;
          margin-bottom: 8px;
        }

        .settings-header h1 {
          margin: 0;
          font-size: clamp(38px, 4vw, 58px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .settings-header p {
          margin: 14px 0 0;
          color: #8ea4d3;
          font-size: 16px;
        }

        .settings-grid {
          max-width: 1500px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .settings-card {
          background: linear-gradient(
            145deg,
            rgba(20, 48, 93, 0.96),
            rgba(10, 30, 63, 0.96)
          );
          border: 1px solid rgba(112, 145, 210, 0.2);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
        }

        .settings-card-title {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 24px;
        }

        .settings-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(104, 72, 245, 0.17);
          color: #9b87ff;
          font-size: 22px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .settings-card-title h2 {
          margin: 0;
          font-size: 19px;
        }

        .settings-card-title p {
          margin: 5px 0 0;
          color: #8299c8;
          font-size: 13px;
        }

        .settings-row,
        .security-item {
          min-height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .settings-row strong,
        .security-item strong {
          display: block;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .settings-row span,
        .security-item span {
          display: block;
          color: #8198c5;
          font-size: 12px;
          line-height: 1.5;
        }

        .settings-divider {
          height: 1px;
          background: rgba(126, 151, 201, 0.12);
          margin: 7px 0;
        }

        .settings-select {
          min-width: 125px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(127, 153, 210, 0.25);
          background: #10264c;
          color: #ffffff;
          outline: none;
          cursor: pointer;
        }

        .settings-outline-button {
          border: 1px solid rgba(130, 107, 255, 0.5);
          background: rgba(104, 72, 245, 0.1);
          color: #a796ff;
          padding: 10px 15px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .settings-outline-button:hover {
          background: #6848f5;
          color: #ffffff;
        }

        .session-badge {
          background: rgba(36, 211, 157, 0.12) !important;
          color: #28d69f !important;
          border: 1px solid rgba(36, 211, 157, 0.25);
          padding: 6px 11px;
          border-radius: 999px;
          font-weight: 700;
          white-space: nowrap;
        }

        /*
          The hamburger menu is fixed near the top-left.
          Keep extra space above the page content so it
          never overlaps the Settings heading.
        */
        @media (max-width: 900px) {
          .settings-page {
            padding: 120px 18px 40px;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 901px) {
          .settings-page {
            padding-top: 95px;
          }
        }

        @media (max-width: 560px) {
          .settings-page {
            padding: 120px 16px 40px;
          }

          .settings-card {
            padding: 20px;
          }

          .settings-row,
          .security-item {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-select,
          .settings-outline-button {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}

export default Settings;