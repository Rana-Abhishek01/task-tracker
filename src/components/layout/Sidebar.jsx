import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ isOpen, onClose, isAdmin = false }) {
  const navigate = useNavigate();

  const mainItems = [
    { label: "Home", path: "/dashboard", icon: "⌂" },
    { label: "My Tasks", path: "/tasks", icon: "☷" },
    { label: "Calendar", path: "/calendar", icon: "□" },
    ...(isAdmin
      ? [{ label: "All Users", path: "/users", icon: "♙" }]
      : []),
    { label: "Analytics", path: "/analytics", icon: "▥" },
    { label: "Settings", path: "/settings", icon: "⚙" },
  ];

  const accountItems = [
    { label: "Profile", path: "/profile", icon: "◉" },
    { label: "Notifications", path: "/notifications", icon: "♢", badge: 3 },
    { label: "Help & Support", path: "/help", icon: "?" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("taskTrackerToken");
    onClose?.();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `task-sidebar-link${isActive ? " active" : ""}`;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="task-sidebar-overlay"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}

      <aside className={`task-sidebar${isOpen ? " open" : ""}`}>
        <div className="task-sidebar-brand">
          <div className="task-sidebar-brand-icon">✓</div>
          <div>
            <div className="task-sidebar-brand-name">
              Task<span>Tracker</span>
            </div>
            <div className="task-sidebar-brand-sub">
              Plan • Focus • Achieve
            </div>
          </div>
        </div>

        <nav className="task-sidebar-nav" aria-label="Main navigation">
          <div className="task-sidebar-section-title">MENU</div>

          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
              onClick={onClose}
            >
              <span className="task-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="task-sidebar-section-title account-title">
            ACCOUNT
          </div>

          {accountItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
              onClick={onClose}
            >
              <span className="task-sidebar-icon">{item.icon}</span>
              <span className="task-sidebar-label">{item.label}</span>
              {item.badge ? (
                <span className="task-sidebar-badge">{item.badge}</span>
              ) : null}
            </NavLink>
          ))}

          <button
            type="button"
            className="task-sidebar-link task-sidebar-logout"
            onClick={handleLogout}
          >
            <span className="task-sidebar-icon">↪</span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="task-sidebar-footer">
          <div className="task-sidebar-footer-title">
            Small Steps
          </div>
          <div className="task-sidebar-footer-sub">
            Big Results!
          </div>
        </div>
      </aside>

      <style>{`
        .task-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 1090;
          width: 100%;
          height: 100%;
          border: 0;
          padding: 0;
          background: rgba(2, 8, 23, 0.55);
          backdrop-filter: blur(3px);
          cursor: pointer;
        }

        .task-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1100;
          width: 270px;
          height: 100vh;
          padding: 24px 14px 18px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #08142f 0%, #050f23 100%);
          border-right: 1px solid rgba(148, 163, 184, 0.14);
          box-shadow: 18px 0 45px rgba(0, 0, 0, 0.22);
          transform: translateX(-105%);
          transition: transform 0.25s ease;
          overflow-y: auto;
        }

        .task-sidebar.open {
          transform: translateX(0);
        }

        .task-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 24px;
        }

        .task-sidebar-brand-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #745cff, #4e3bd8);
          color: #fff;
          font-size: 20px;
          font-weight: 900;
          box-shadow: 0 10px 25px rgba(92, 68, 255, 0.35);
        }

        .task-sidebar-brand-name {
          color: #fff;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .task-sidebar-brand-name span {
          color: #7968ff;
        }

        .task-sidebar-brand-sub {
          margin-top: 3px;
          color: #7181a8;
          font-size: 10px;
        }

        .task-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .task-sidebar-section-title {
          padding: 8px 12px 7px;
          color: #68799f;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .task-sidebar-section-title.account-title {
          margin-top: 15px;
        }

        .task-sidebar-link {
          width: 100%;
          min-height: 46px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #aab6d0;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          text-align: left;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .task-sidebar-link:hover {
          background: rgba(121, 104, 255, 0.1);
          color: #fff;
        }

        .task-sidebar-link.active {
          background: linear-gradient(90deg, #6049eb, #745cff);
          color: #fff;
          box-shadow: 0 9px 24px rgba(92, 68, 255, 0.24);
        }

        .task-sidebar-icon {
          width: 24px;
          flex: 0 0 24px;
          text-align: center;
          font-size: 18px;
        }

        .task-sidebar-label {
          flex: 1;
        }

        .task-sidebar-badge {
          min-width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          padding: 0 6px;
          border-radius: 20px;
          background: #ff5c8a;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
        }

        .task-sidebar-logout {
          margin-top: 5px;
        }

        .task-sidebar-footer {
          margin-top: auto;
          margin-left: 5px;
          margin-right: 5px;
          padding: 18px;
          border: 1px solid rgba(126, 143, 186, 0.13);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
        }

        .task-sidebar-footer-title {
          color: #fff;
          font-size: 13px;
          font-weight: 800;
        }

        .task-sidebar-footer-sub {
          margin-top: 4px;
          color: #7888ae;
          font-size: 11px;
        }

        @media (max-width: 900px) {
          .task-sidebar {
            width: min(290px, 86vw);
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;
