import { useState } from "react";
import Sidebar from "./Sidebar";

function Layout({ children, isAdmin = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="task-layout">
      <button
        type="button"
        className="task-layout-menu-button"
        onClick={() => setSidebarOpen((value) => !value)}
        aria-label="Open menu"
        title="Open menu"
      >
        <span />
        <span />
        <span />
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
      />

      <main className="task-layout-content">
        {children}
      </main>

      <style>{`
        .task-layout {
          min-height: 100vh;
          width: 100%;
          background: #071126;
          position: relative;
        }

        .task-layout-content {
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
        }

        .task-layout-menu-button {
          position: fixed;
          top: 8px;
          left: 18px;
          z-index: 1200;
          width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid rgba(145, 157, 210, 0.18);
          border-radius: 12px;
          background: rgba(11, 27, 57, 0.96);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
          cursor: pointer;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .task-layout-menu-button:hover {
          background: #5b42e8;
          border-color: rgba(150, 135, 255, 0.5);
          transform: translateY(-1px);
        }

        .task-layout-menu-button span {
          display: block;
          width: 20px;
          height: 2px;
          border-radius: 10px;
          background: #ffffff;
        }

        /*
          The hamburger is fixed at the top.
          Give all pages enough top space so their
          headings never sit underneath the button.
        */
        @media (max-width: 1200px) {
          .task-layout-content {
            padding-top: 92px;
          }

          .task-layout-menu-button {
            top: 8px;
            left: 18px;
          }
        }

        @media (max-width: 700px) {
          .task-layout-content {
            padding-top: 96px;
          }

          .task-layout-menu-button {
            top: 8px;
            left: 14px;
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 480px) {
          .task-layout-content {
            padding-top: 94px;
          }

          .task-layout-menu-button {
            left: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;