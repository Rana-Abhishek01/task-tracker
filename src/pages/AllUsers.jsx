import { useMemo, useState } from "react";
import Layout from "../components/layout/Layout";

function AllUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const users = [
    {
      id: 1,
      name: "Abhishek Admin",
      email: "abhishek@test.com",
      role: "Admin",
      joined: "06 Oct 2026",
      status: "Active",
    },
    {
      id: 2,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "User",
      joined: "04 Oct 2026",
      status: "Active",
    },
    {
      id: 3,
      name: "Priya Singh",
      email: "priya@example.com",
      role: "User",
      joined: "02 Oct 2026",
      status: "Active",
    },
    {
      id: 4,
      name: "Aman Kumar",
      email: "aman@example.com",
      role: "User",
      joined: "29 Sep 2026",
      status: "Inactive",
    },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.role === "Admin").length;
  const totalRegularUsers = users.filter(
    (user) => user.role === "User"
  ).length;
  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  return (
    <Layout>
      <div className="all-users-page">
        <header className="users-header">
          <div>
            <div className="users-eyebrow">ADMINISTRATION</div>

            <h1>All Users</h1>

            <p>
              Manage and monitor all registered users from one place.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            ↻ Refresh
          </button>
        </header>

        <section className="user-stats">
          <div className="stat-card">
            <div className="stat-icon purple">♙</div>

            <div>
              <span>Total Users</span>
              <strong>{totalUsers}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">♛</div>

            <div>
              <span>Administrators</span>
              <strong>{totalAdmins}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">♙</div>

            <div>
              <span>Regular Users</span>
              <strong>{totalRegularUsers}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink">✓</div>

            <div>
              <span>Active Users</span>
              <strong>{activeUsers}</strong>
            </div>
          </div>
        </section>

        <section className="users-panel">
          <div className="panel-top">
            <div>
              <h2>User Management</h2>
              <p>View and manage registered accounts.</p>
            </div>

            <div className="user-count">
              {filteredUsers.length} users
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="role-filters">
              {["All", "Admin", "User"].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={
                    roleFilter === role ? "filter active" : "filter"
                  }
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{user.name}</strong>
                            <small>ID #{user.id}</small>
                          </div>
                        </div>
                      </td>

                      <td className="email-cell">{user.email}</td>

                      <td>
                        <span
                          className={
                            user.role === "Admin"
                              ? "role-badge admin"
                              : "role-badge user"
                          }
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="joined-cell">{user.joined}</td>

                      <td>
                        <span
                          className={
                            user.status === "Active"
                              ? "status-badge active"
                              : "status-badge inactive"
                          }
                        >
                          <span className="status-dot" />
                          {user.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="action-button"
                          title="View user"
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-icon">⌕</div>

                        <h3>No users found</h3>

                        <p>
                          Try changing your search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <style>{`
          .all-users-page {
            min-height: 100vh;
            padding: 36px 32px 50px;
            color: #f5f7ff;
            background:
              radial-gradient(
                circle at 80% 0%,
                rgba(94, 76, 255, 0.12),
                transparent 28%
              ),
              #071126;
            font-family:
              Inter,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .users-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 24px;
            padding-left: 70px;
          }

          .users-eyebrow {
            color: #8494c7;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
            margin-bottom: 8px;
          }

          .users-header h1 {
            margin: 0;
            font-size: clamp(34px, 4vw, 50px);
            line-height: 1;
            letter-spacing: -1.8px;
          }

          .users-header p {
            margin: 10px 0 0;
            color: #8fa2d5;
            font-size: 15px;
          }

          .refresh-button {
            border: 1px solid rgba(125, 145, 205, 0.25);
            border-radius: 12px;
            background: #12294f;
            color: #f3f6ff;
            padding: 12px 18px;
            font-weight: 800;
            cursor: pointer;
          }

          .refresh-button:hover {
            background: #1a3768;
          }

          .user-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 18px;
          }

          .stat-card {
            display: flex;
            align-items: center;
            gap: 14px;
            min-height: 105px;
            padding: 18px;
            border: 1px solid rgba(123, 145, 205, 0.18);
            border-radius: 17px;
            background:
              linear-gradient(
                145deg,
                rgba(20, 45, 91, 0.96),
                rgba(8, 24, 53, 0.98)
              );
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            border-radius: 14px;
            font-size: 22px;
            font-weight: 800;
          }

          .stat-icon.purple {
            background: rgba(111, 82, 246, 0.2);
            color: #9a86ff;
          }

          .stat-icon.blue {
            background: rgba(50, 145, 255, 0.18);
            color: #5aa7ff;
          }

          .stat-icon.green {
            background: rgba(43, 207, 155, 0.15);
            color: #3cddb0;
          }

          .stat-icon.pink {
            background: rgba(255, 64, 137, 0.15);
            color: #ff5795;
          }

          .stat-card span {
            display: block;
            color: #8396c9;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 5px;
          }

          .stat-card strong {
            font-size: 27px;
            color: #f4f6ff;
          }

          .users-panel {
            border: 1px solid rgba(123, 145, 205, 0.18);
            border-radius: 20px;
            background:
              linear-gradient(
                145deg,
                rgba(15, 37, 77, 0.98),
                rgba(7, 23, 51, 0.98)
              );
            overflow: hidden;
          }

          .panel-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 22px 22px 18px;
          }

          .panel-top h2 {
            margin: 0;
            font-size: 20px;
          }

          .panel-top p {
            margin: 6px 0 0;
            color: #8195c8;
            font-size: 13px;
          }

          .user-count {
            padding: 8px 13px;
            border-radius: 10px;
            background: rgba(103, 76, 241, 0.12);
            color: #a694ff;
            font-size: 13px;
            font-weight: 800;
          }

          .filters {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 0 22px 18px;
          }

          .search-box {
            width: min(480px, 100%);
            height: 44px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 14px;
            border: 1px solid rgba(123, 145, 205, 0.2);
            border-radius: 11px;
            background: #142e5c;
          }

          .search-box span {
            color: #8295c8;
            font-size: 22px;
          }

          .search-box input {
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: #fff;
            font-size: 14px;
          }

          .search-box input::placeholder {
            color: #7488bb;
          }

          .role-filters {
            display: flex;
            gap: 8px;
          }

          .filter {
            border: 1px solid rgba(123, 145, 205, 0.2);
            border-radius: 10px;
            background: #10274f;
            color: #91a4d4;
            padding: 9px 15px;
            font-weight: 700;
            cursor: pointer;
          }

          .filter.active {
            background: linear-gradient(135deg, #6549f5, #795bff);
            border-color: transparent;
            color: white;
          }

          .users-table-wrapper {
            overflow-x: auto;
          }

          .users-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 850px;
          }

          .users-table th {
            padding: 13px 22px;
            border-top: 1px solid rgba(123, 145, 205, 0.13);
            border-bottom: 1px solid rgba(123, 145, 205, 0.13);
            color: #7185b7;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
            text-align: left;
          }

          .users-table td {
            padding: 15px 22px;
            border-bottom: 1px solid rgba(123, 145, 205, 0.1);
            color: #dce4ff;
            font-size: 13px;
          }

          .users-table tbody tr:hover {
            background: rgba(82, 107, 169, 0.07);
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 11px;
          }

          .avatar {
            width: 39px;
            height: 39px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: linear-gradient(135deg, #7656ff, #a07fff);
            color: white;
            font-size: 14px;
            font-weight: 900;
          }

          .user-info strong {
            display: block;
            color: #f3f6ff;
            font-size: 13px;
          }

          .user-info small {
            display: block;
            margin-top: 3px;
            color: #7286b8;
            font-size: 10px;
          }

          .email-cell,
          .joined-cell {
            color: #8ea1d1 !important;
          }

          .role-badge,
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
          }

          .role-badge.admin {
            background: rgba(117, 88, 255, 0.15);
            color: #a796ff;
          }

          .role-badge.user {
            background: rgba(57, 160, 255, 0.12);
            color: #68adff;
          }

          .status-badge.active {
            background: rgba(50, 211, 165, 0.1);
            color: #40d8ad;
          }

          .status-badge.inactive {
            background: rgba(255, 168, 79, 0.1);
            color: #ffb064;
          }

          .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
          }

          .action-button {
            width: 32px;
            height: 32px;
            border: 1px solid rgba(123, 145, 205, 0.18);
            border-radius: 8px;
            background: #12294f;
            color: #9badde;
            font-size: 18px;
            cursor: pointer;
          }

          .empty-state {
            padding: 70px 20px;
            text-align: center;
          }

          .empty-icon {
            width: 50px;
            height: 50px;
            display: grid;
            place-items: center;
            margin: 0 auto 12px;
            border-radius: 50%;
            background: rgba(106, 76, 245, 0.14);
            color: #927cff;
            font-size: 24px;
          }

          .empty-state h3 {
            margin: 0;
            color: #eef2ff;
          }

          .empty-state p {
            margin: 7px 0 0;
            color: #8094c6;
          }

          @media (max-width: 1050px) {
            .user-stats {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 800px) {
            .all-users-page {
              padding: 28px 18px 45px;
            }

            .users-header {
              padding-left: 58px;
            }

            .filters {
              flex-direction: column;
              align-items: stretch;
            }

            .search-box {
              width: auto;
            }

            .role-filters {
              overflow-x: auto;
            }
          }

          @media (max-width: 560px) {
            .users-header {
              flex-direction: column;
            }

            .refresh-button {
              width: 100%;
            }

            .user-stats {
              grid-template-columns: 1fr;
            }

            .panel-top {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}

export default AllUsers;