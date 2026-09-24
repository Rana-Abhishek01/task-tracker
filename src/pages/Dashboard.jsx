import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [activeNav, setActiveNav] = useState("Dashboard");

  // --------------------------------
  // LOGOUT
  // --------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem("taskTrackerToken");
    localStorage.removeItem("taskTrackerUser");
    localStorage.removeItem("isLoggedIn");

    navigate("/login");
  }, [navigate]);

  // --------------------------------
  // LOAD TASKS
  // --------------------------------
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tasks");
      const backendTasks = response.data?.tasks || [];

      const formattedTasks = backendTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
        createdAt: task.createdAt,
        completed: task.status === "completed",
        userId: task.userId,
      }));

      setTasks(formattedTasks);
    } catch (err) {
      console.error("Load tasks error:", err);

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load tasks from backend."
      );
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // --------------------------------
  // LOAD USERS - ADMIN
  // --------------------------------
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);

      const response = await api.get("/users");
      setUsers(response.data?.users || []);
    } catch (err) {
      console.error("Load users error:", err);

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setUsersLoading(false);
    }
  }, [logout]);

  // --------------------------------
  // CHECK LOGIN
  // --------------------------------
  useEffect(() => {
    const token = localStorage.getItem("taskTrackerToken");
    const savedUser = localStorage.getItem("taskTrackerUser");

    if (!token) {
      navigate("/login");
      return;
    }

    let parsedUser = null;

    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("taskTrackerUser");
      }
    }

    loadTasks();

    if (parsedUser?.role === "admin") {
      loadUsers();
    }
  }, [navigate, loadTasks, loadUsers]);

  // --------------------------------
  // PROFILE
  // --------------------------------
  const openProfileEditor = useCallback(() => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setProfileOpen(true);
    setSettingsOpen(false);
  }, [user]);

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!profileName.trim()) {
      setError("Name is required.");
      return;
    }

    if (!profileEmail.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setProfileSaving(true);
      setError("");
      setProfileOpen(false);

      const response = await api.put("/users/me", {
        name: profileName.trim(),
        email: profileEmail.trim().toLowerCase(),
      });

      const updatedUser = response.data?.user;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("taskTrackerUser", JSON.stringify(updatedUser));
      }

    } catch (err) {
      console.error("Profile update error:", err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // --------------------------------
  // ADD TASK
  // --------------------------------
  const handleAddTask = async (event) => {
    event.preventDefault();

    if (!taskTitle.trim()) {
      setError("Please enter a task.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/tasks", {
        title: taskTitle.trim(),
        description: "",
        status: "pending",
        priority,
        dueDate: dueDate || null,
      });

      const newTask = response.data?.task;

      if (newTask) {
        setTasks((previousTasks) => [
          {
            id: newTask.id,
            title: newTask.title,
            description: newTask.description || "",
            status: newTask.status || "pending",
            priority: newTask.priority || priority,
            dueDate: newTask.dueDate || dueDate || "",
            createdAt: newTask.createdAt,
            completed: newTask.status === "completed",
            userId: newTask.userId,
          },
          ...previousTasks,
        ]);
      } else {
        await loadTasks();
      }

      setTaskTitle("");
      setPriority("Medium");
      setDueDate("");
    } catch (err) {
      console.error("Add task error:", err);

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to create task."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // COMPLETE / UNDO
  // --------------------------------
  const handleToggleTask = async (task) => {
    try {
      setError("");

      const newStatus =
        task.status === "completed"
          ? "pending"
          : "completed";

      const response = await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description || "",
        status: newStatus,
        priority: task.priority || "Medium",
        dueDate: task.dueDate || null,
      });

      const updatedTask = response.data?.task;

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status:
                  updatedTask?.status || newStatus,
                completed: newStatus === "completed",
              }
            : item
        )
      );
    } catch (err) {
      console.error("Update task error:", err);

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to update task."
      );
    }
  };

  // --------------------------------
  // EDIT TASK
  // --------------------------------
  const handleEditTask = async (task) => {
    const newTitle = window.prompt(
      "Enter new task title:",
      task.title
    );

    if (newTitle === null) {
      return;
    }

    if (!newTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    const currentPriority = task.priority || "Medium";

    const newPriorityInput = window.prompt(
      "Enter priority (Low, Medium, or High):",
      currentPriority
    );

    if (newPriorityInput === null) {
      return;
    }

    const normalizedPriority =
      newPriorityInput.trim().charAt(0).toUpperCase() +
      newPriorityInput.trim().slice(1).toLowerCase();

    if (!['Low', 'Medium', 'High'].includes(normalizedPriority)) {
      setError("Invalid priority. Please use Low, Medium, or High.");
      return;
    }

    const currentDueDate = task.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 10)
      : "";

    const newDueDate = window.prompt(
      "Enter due date (YYYY-MM-DD). Leave blank to remove it:",
      currentDueDate
    );

    if (newDueDate === null) {
      return;
    }

    const trimmedDueDate = newDueDate.trim();

    if (trimmedDueDate) {
      const parsedDate = new Date(`${trimmedDueDate}T00:00:00`);

      if (
        Number.isNaN(parsedDate.getTime()) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDueDate)
      ) {
        setError(
          "Invalid due date. Please use YYYY-MM-DD."
        );
        return;
      }
    }

    try {
      setError("");

      const response = await api.put(`/tasks/${task.id}`, {
        title: newTitle.trim(),
        description: task.description || "",
        status: task.status || "pending",
        priority: normalizedPriority,
        dueDate: trimmedDueDate || null,
      });

      const updatedTask = response.data?.task;

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                title:
                  updatedTask?.title ||
                  newTitle.trim(),
                dueDate:
                  updatedTask?.dueDate ||
                  "",
                priority:
                  updatedTask?.priority ||
                  normalizedPriority,
                status:
                  updatedTask?.status ||
                  item.status,
                completed:
                  (updatedTask?.status ||
                    item.status) === "completed",
              }
            : item
        )
      );
    } catch (err) {
      console.error("Edit task error:", err);

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to edit task."
      );
    }
  };

  // --------------------------------
  // DELETE TASK
  // --------------------------------
  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/tasks/${taskId}`);

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task.id !== taskId
        )
      );
    } catch (err) {
      console.error("Delete task error:", err);

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to delete task."
      );
    }
  };

  // --------------------------------
  // DELETE USER - ADMIN
  // --------------------------------
  const handleDeleteUser = async (userId, userName) => {
    if (Number(userId) === Number(user?.id)) {
      setError("Admin cannot delete their own account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/users/${userId}`);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) => item.id !== userId
        )
      );

      await loadTasks();
    } catch (err) {
      console.error("Delete user error:", err);

      if (err.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };

  // --------------------------------
  // HELPERS
  // --------------------------------
  const isOverdue = (task) => {
    if (
      !task.dueDate ||
      task.status === "completed"
    ) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatShortDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  // --------------------------------
  // FILTER / SEARCH / SORT
  // --------------------------------
  const visibleTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === "pending") {
      result = result.filter(
        (task) => task.status !== "completed"
      );
    }

    if (filter === "completed") {
      result = result.filter(
        (task) => task.status === "completed"
      );
    }

    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter((task) =>
        task.title
          .toLowerCase()
          .includes(searchText)
      );
    }

    if (sortBy === "high") {
      const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3,
      };

      result.sort(
        (a, b) =>
          (priorityOrder[a.priority] || 2) -
          (priorityOrder[b.priority] || 2)
      );
    }

    if (sortBy === "due") {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return (
          new Date(a.dueDate) -
          new Date(b.dueDate)
        );
      });
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
      );
    }

    if (sortBy === "overdue") {
      result.sort((a, b) => {
        const aOverdue = isOverdue(a) ? 0 : 1;
        const bOverdue = isOverdue(b) ? 0 : 1;

        return aOverdue - bOverdue;
      });
    }

    return result;
  }, [tasks, filter, search, sortBy]);

  // --------------------------------
  // STATS
  // --------------------------------
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingTasks =
    totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  const dueTodayTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "completed") {
      return false;
    }

    const today = new Date();
    const due = new Date(task.dueDate);

    return (
      today.getFullYear() === due.getFullYear() &&
      today.getMonth() === due.getMonth() &&
      today.getDate() === due.getDate()
    );
  });

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const displayTasks = visibleTasks.slice(0, 7);

  const notifications = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    return tasks
      .filter((task) => {
        if (task.status === "completed" || !task.dueDate) return false;
        const due = new Date(task.dueDate);
        return due <= now || due.toDateString() === now.toDateString();
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  const notificationCount = notifications.length;

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div
      className={darkMode ? "tt-app dark" : "tt-app"}
    >
      <aside className="tt-sidebar">
        <div className="tt-brand">
          <div className="tt-brand-icon">✓</div>

          <div>
            <div className="tt-brand-name">
              Task<span>Tracker</span>
            </div>

            <div className="tt-brand-sub">
              Plan • Focus • Achieve
            </div>
          </div>
        </div>

        <nav className="tt-nav">
          {[
            ["⌂", "Dashboard"],
            ["☷", "My Tasks"],
            ["□", "Calendar"],
            ["♙", "All Users"],
            ["▥", "Analytics"],
            ["⚙", "Settings"],
          ].map(([icon, label]) => {
            const hidden =
              label === "All Users" &&
              user?.role !== "admin";

            if (hidden) {
              return null;
            }

            return (
              <button
                key={label}
                type="button"
                className={
                  activeNav === label
                    ? "tt-nav-item active"
                    : "tt-nav-item"
                }
                onClick={() => {
                  setActiveNav(label);

                  if (label === "My Tasks") {
                    document
                      .getElementById("tasks-section")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }

                  if (label === "All Users") {
                    document
                      .getElementById("users-section")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }

                  if (label === "Calendar") {
                    document
                      .getElementById("calendar-section")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }

                  if (label === "Settings") {
                    setSettingsOpen((value) => !value);
                  } else {
                    setSettingsOpen(false);
                  }
                }}
              >
                <span className="tt-nav-icon">
                  {icon}
                </span>

                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="tt-sidebar-bottom">
          <div className="tt-small-steps">
            <div className="tt-small-title">
              Small
              <br />
              Steps
            </div>

            <div className="tt-small-sub">
              Big Results!
            </div>

            <div className="tt-small-line" />

            <div className="tt-small-moon">●</div>
          </div>
        </div>
      </aside>

      <main className="tt-main">
        <header className="tt-topbar">
          <div className="tt-welcome">
            <div className="tt-welcome-kicker">
              <span className="tt-welcome-dot" />
              WORKSPACE
            </div>

            <h1>
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}
              , {user?.name || "User"}! <span>👋</span>
            </h1>

            <p>
              Stay organized, stay productive.
            </p>
          </div>

          <div className="tt-top-actions">
            <label className="tt-search" aria-label="Search tasks">
              <span className="tt-search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search tasks, users..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              <kbd>⌘ K</kbd>
            </label>

            <button
              type="button"
              className={`tt-theme-toggle ${darkMode ? "dark" : "light"}`}
              onClick={() => setDarkMode((value) => !value)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="tt-theme-sun" aria-hidden="true">☀</span>
              <span className="tt-theme-thumb" aria-hidden="true">
                {darkMode ? "☾" : "☀"}
              </span>
            </button>

            <div className="tt-notification-wrap">
              <button
                type="button"
                className={`tt-round-button notification ${notificationCount ? "has-notifications" : ""}`}
                title={notificationCount ? `${notificationCount} notification${notificationCount === 1 ? "" : "s"}` : "No notifications"}
                aria-label={notificationCount ? `${notificationCount} notifications` : "No notifications"}
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((value) => !value)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="tt-notification-icon"
                >
                  <path
                    d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8.2 12h4.4a2.2 2.2 0 0 1-4.4 0Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {notificationCount > 0 && <span>{notificationCount}</span>}
              </button>

              {showNotifications && (
                <div className="tt-notification-panel">
                  <div className="tt-notification-head">
                    <div>
                      <strong>Notifications</strong>
                      <small>{notificationCount ? `${notificationCount} task${notificationCount === 1 ? "" : "s"} need attention` : "You're all caught up"}</small>
                    </div>
                    <button type="button" onClick={() => setShowNotifications(false)} aria-label="Close notifications">×</button>
                  </div>

                  {notificationCount === 0 ? (
                    <div className="tt-notification-empty">
                      <span>✓</span>
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    <div className="tt-notification-list">
                      {notifications.map((item) => {
                        const due = item.dueDate ? new Date(item.dueDate) : null;
                        const startOfToday = new Date();
                        startOfToday.setHours(0, 0, 0, 0);
                        const isOverdue = due && due < startOfToday;

                        return (
                          <button
                            type="button"
                            className="tt-notification-item"
                            key={item.id}
                            onClick={() => {
                              setShowNotifications(false);
                              document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                          >
                            <span className={`tt-notification-dot ${isOverdue ? "overdue" : "today"}`} />
                            <span className="tt-notification-copy">
                              <strong>{item.title}</strong>
                              <small>{isOverdue ? "Overdue task" : "Due today"}</small>
                            </span>
                            <span className="tt-notification-arrow">›</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="tt-profile">
              <div className="tt-avatar">
                {(user?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="tt-profile-text">
                <strong>
                  {user?.name || "User"}
                </strong>

                <small>
                  {user?.role === "admin"
                    ? "Administrator"
                    : "Workspace member"}
                </small>
              </div>

              <button
                type="button"
                className="tt-profile-menu"
                onClick={logout}
                title="Logout"
                aria-label="Logout"
              >
                ˅
              </button>
            </div>
          </div>
        </header>

        {settingsOpen && (
          <div className="tt-settings-panel">
            <div className="tt-settings-head">
              <div><strong>Settings</strong><small>Manage your account</small></div>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button>
            </div>
            <button type="button" className="tt-settings-action" onClick={openProfileEditor}>
              <span className="tt-settings-action-icon">✎</span>
              <span><strong>Edit Profile</strong><small>Update your name and email</small></span>
              <span>›</span>
            </button>
            <button type="button" className="tt-settings-action logout" onClick={logout}>
              <span className="tt-settings-action-icon">↪</span>
              <span><strong>Logout</strong><small>Sign out of your account</small></span>
              <span>›</span>
            </button>
          </div>
        )}

        {profileOpen && (
          <div className="tt-modal-backdrop" onMouseDown={() => setProfileOpen(false)}>
            <div className="tt-profile-modal" onMouseDown={(event) => event.stopPropagation()}>
              <div className="tt-modal-head">
                <div><span className="tt-modal-kicker">ACCOUNT</span><h2>Edit Profile</h2><p>Update your profile information.</p></div>
                <button type="button" onClick={() => setProfileOpen(false)} aria-label="Close profile editor">×</button>
              </div>
              <form onSubmit={handleProfileSave} className="tt-profile-form">
                <label><span>Name</span><input value={profileName} onChange={(event) => setProfileName(event.target.value)} autoComplete="name" /></label>
                <label><span>Email</span><input type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} autoComplete="email" /></label>
                <div className="tt-profile-form-actions">
                  <button type="button" className="tt-modal-cancel" onClick={() => setProfileOpen(false)}>Cancel</button>
                  <button type="submit" className="tt-modal-save" disabled={profileSaving}>{profileSaving ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {error && (
          <div className="tt-error">
            <span>!</span>
            {error}
            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        <section className="tt-dashboard-grid">
          <div className="tt-content">
            <div className="tt-stat-grid">
              <StatCard
                icon="☷"
                title="Total Tasks"
                value={totalTasks}
                subtitle="All tasks created"
                className="blue"
                onClick={() => {
                  setFilter("all");
                  document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />

              <StatCard
                icon="✓"
                title="Completed"
                value={completedTasks}
                subtitle={`${progress}% completed`}
                className="green"
                onClick={() => {
                  setFilter("completed");
                  document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />

              <StatCard
                icon="◷"
                title="Pending"
                value={pendingTasks}
                subtitle="Keep going!"
                className="orange"
                onClick={() => {
                  setFilter("pending");
                  document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />

              <StatCard
                icon="□"
                title="Due Today"
                value={dueTodayTasks.length}
                subtitle="Stay on track!"
                className="pink"
                onClick={() => {
                  setFilter("pending");
                  document.getElementById("tasks-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </div>

            <section className="tt-progress-card">
              <div className="tt-progress-icon">
                ◉
              </div>

              <div className="tt-progress-content">
                <h2>Your Progress</h2>

                <p>
                  {completedTasks} of {totalTasks}{" "}
                  tasks completed
                </p>

                <div className="tt-progress-bar">
                  <div
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              <strong>{progress}%</strong>

              <div className="tt-quote">
                “Discipline today
                <br />
                leads to success tomorrow.”
                <small>— Unknown</small>
              </div>
            </section>

            <section className="tt-add-card">
              <div className="tt-section-title">
                <span className="tt-plus">+</span>

                <div>
                  <h2>Add New Task</h2>
                  <p>Create a new task quickly</p>
                </div>
              </div>

              <form
                onSubmit={handleAddTask}
                className="tt-add-form"
              >
                <input
                  type="text"
                  placeholder="What do you want to do?"
                  value={taskTitle}
                  onChange={(event) =>
                    setTaskTitle(event.target.value)
                  }
                />

                <div className="tt-priority-field">
                  <span
                    className={`tt-priority-icon ${priority.toLowerCase()}`}
                    aria-hidden="true"
                  >
                    ⚑
                  </span>

                  <select
                    className="tt-priority-select"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value)
                    }
                    aria-label="Task priority"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                />

                <button
                  type="submit"
                  disabled={saving}
                >
                  +
                  {saving ? " Saving..." : " Add Task"}
                </button>
              </form>
            </section>

            <section
              className="tt-tasks-card"
              id="tasks-section"
            >
              <div className="tt-task-header">
                <div>
                  <h2>
                    <span className="tt-title-plus">
                      +
                    </span>
                    All Tasks{" "}
                    <span>({totalTasks})</span>
                  </h2>
                </div>

                <div className="tt-task-controls">
                  <div className="tt-mini-search">
                    ⌕
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                    />
                  </div>

                  <span className="tt-sort-label">
                    Sort by
                  </span>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                  >
                    <option value="newest">
                      Date (Newest)
                    </option>

                    <option value="default">
                      Default
                    </option>

                    <option value="overdue">
                      Overdue First
                    </option>

                    <option value="high">
                      High Priority First
                    </option>

                    <option value="due">
                      Due Date
                    </option>

                    <option value="oldest">
                      Oldest
                    </option>
                  </select>
                </div>
              </div>

              <div className="tt-filter-row">
                <button
                  type="button"
                  className={
                    filter === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() => setFilter("all")}
                >
                  All <span>{totalTasks}</span>
                </button>

                <button
                  type="button"
                  className={
                    filter === "pending"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("pending")
                  }
                >
                  Pending <span>{pendingTasks}</span>
                </button>

                <button
                  type="button"
                  className={
                    filter === "completed"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("completed")
                  }
                >
                  Completed{" "}
                  <span>{completedTasks}</span>
                </button>
              </div>

              {loading ? (
                <div className="tt-empty">
                  Loading tasks from backend...
                </div>
              ) : displayTasks.length === 0 ? (
                <div className="tt-empty">
                  <div>✓</div>
                  <h3>No tasks found</h3>
                  <p>
                    Add a new task to get started.
                  </p>
                </div>
              ) : (
                <div className="tt-table-wrap">
                  <table className="tt-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Task</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayTasks.map(
                        (task, index) => (
                          <tr
                            key={task.id}
                            className={
                              task.status ===
                              "completed"
                                ? "completed-row"
                                : ""
                            }
                          >
                            <td>{index + 1}</td>

                            <td>
                              <div className="tt-task-name">
                                <button
                                  type="button"
                                  className={
                                    task.status ===
                                    "completed"
                                      ? "tt-checkbox checked"
                                      : "tt-checkbox"
                                  }
                                  onClick={() =>
                                    handleToggleTask(
                                      task
                                    )
                                  }
                                >
                                  {task.status ===
                                  "completed"
                                    ? "✓"
                                    : ""}
                                </button>

                                <span>
                                  {task.title}
                                </span>
                              </div>
                            </td>

                            <td>
                              <PriorityBadge
                                priority={
                                  task.priority
                                }
                              />
                            </td>

                            <td>
                              <StatusBadge
                                status={
                                  task.status
                                }
                              />
                            </td>

                            <td>
                              <span className="tt-date">
                                ◷{" "}
                                {task.dueDate
                                  ? formatDate(
                                      task.dueDate
                                    )
                                  : "No date"}
                              </span>

                              {isOverdue(task) && (
                                <small className="tt-overdue">
                                  Overdue
                                </small>
                              )}
                            </td>

                            <td>
                              <div className="tt-actions">
                                <button
                                  type="button"
                                  className="action-complete"
                                  onClick={() =>
                                    handleToggleTask(
                                      task
                                    )
                                  }
                                  title={
                                    task.status ===
                                    "completed"
                                      ? "Undo"
                                      : "Complete"
                                  }
                                >
                                  ✓
                                </button>

                                <button
                                  type="button"
                                  className="action-edit"
                                  onClick={() =>
                                    handleEditTask(
                                      task
                                    )
                                  }
                                  title="Edit"
                                >
                                  ✎
                                </button>

                                <button
                                  type="button"
                                  className="action-delete"
                                  onClick={() =>
                                    handleDeleteTask(
                                      task.id
                                    )
                                  }
                                  title="Delete"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {user?.role === "admin" && (
              <section
                className="tt-users-card"
                id="users-section"
              >
                <div className="tt-admin-header">
                  <div>
                    <h2>All Users</h2>
                    <p>
                      Manage registered users
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadUsers}
                    disabled={usersLoading}
                  >
                    {usersLoading
                      ? "Loading..."
                      : "Refresh Users"}
                  </button>
                </div>

                {usersLoading ? (
                  <div className="tt-empty">
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="tt-empty">
                    No users found.
                  </div>
                ) : (
                  <div className="tt-table-wrap">
                    <table className="tt-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Tasks</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>

                            <td>
                              <strong>
                                {item.name}
                              </strong>
                            </td>

                            <td>{item.email}</td>

                            <td>
                              <span className="tt-user-role">
                                {item.role}
                              </span>
                            </td>

                            <td>
                              {item._count?.tasks ??
                                item.tasks?.length ??
                                0}
                            </td>

                            <td>
                              {Number(item.id) ===
                              Number(user?.id) ? (
                                <span className="tt-current-user">
                                  Current account
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="delete-user"
                                  onClick={() =>
                                    handleDeleteUser(
                                      item.id,
                                      item.name
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="tt-right-column">
            <CalendarWidget
              tasks={tasks}
              formatShortDate={formatShortDate}
            />

            <section className="tt-today-card">
              <div className="tt-side-header">
                <h3>Today's Tasks</h3>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "tasks-section"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  View All
                </button>
              </div>

              {dueTodayTasks.length === 0 ? (
                <div className="tt-today-empty">
                  <span>✓</span>
                  No tasks due today.
                </div>
              ) : (
                dueTodayTasks
                  .slice(0, 4)
                  .map((task) => (
                    <div
                      className="tt-today-item"
                      key={task.id}
                    >
                      <span
                        className={
                          task.priority === "High"
                            ? "dot red"
                            : task.priority ===
                                "Low"
                              ? "dot green"
                              : "dot yellow"
                        }
                      />

                      <span className="today-title">
                        {task.title}
                      </span>

                      <span className="today-time">
                        Today
                      </span>
                    </div>
                  ))
              )}
            </section>

            <section className="tt-quote-card">
              <div className="quote-mark">“</div>

              <button
                type="button"
                className="quote-badge"
              >
                Keep Going!
              </button>

              <h2>
                A little progress
                <br />
                each day adds up
                <br />
                to big results.
              </h2>

              <div className="quote-line" />

              <p>
                “Success is the sum of small efforts,
                repeated day in and day out.”
              </p>

              <small>— Robert Collier</small>
            </section>
          </aside>
        </section>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #071126;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .tt-app {
          min-height: 100vh;
          display: flex;
          background:
            radial-gradient(
              circle at 75% 15%,
              rgba(92, 71, 255, 0.15),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #071126 0%,
              #09152e 48%,
              #0d1934 100%
            );
          color: #f8fafc;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .tt-app:not(.dark) {
          background: #f3f6fc;
          color: #172033;
        }

        .tt-sidebar {
          width: 235px;
          min-height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          padding: 22px 13px;
          background:
            linear-gradient(
              180deg,
              rgba(8, 20, 47, 0.99),
              rgba(5, 15, 35, 0.99)
            );
          border-right: 1px solid
            rgba(148, 163, 184, 0.12);
          box-shadow:
            12px 0 35px rgba(0, 0, 0, 0.08);
        }

        .tt-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 2px 9px 27px;
        }

        .tt-brand-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              #654cff,
              #5635e8
            );
          font-size: 27px;
          font-weight: 900;
          box-shadow:
            0 12px 28px rgba(92, 68, 255, 0.35);
        }

        .tt-brand-name {
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .tt-brand-name span {
          color: #7968ff;
        }

        .tt-brand-sub {
          margin-top: 3px;
          color: #7181a8;
          font-size: 11px;
        }

        .tt-nav {
          display: grid;
          gap: 6px;
          padding-top: 2px;
        }

        .tt-nav-item {
          width: 100%;
          min-height: 46px;
          position: relative;
          border: 1px solid transparent;
          color: #aebbd7;
          background: transparent;
          border-radius: 12px;
          padding: 11px 13px;
          display: flex;
          align-items: center;
          gap: 13px;
          text-align: left;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .tt-nav-item:hover {
          background: rgba(91, 69, 255, 0.1);
          border-color: rgba(118, 101, 255, 0.12);
          color: #ffffff;
          transform: translateX(2px);
        }

        .tt-nav-item.active {
          color: white;
          border-color: rgba(130, 113, 255, 0.16);
          background:
            linear-gradient(
              90deg,
              rgba(91, 67, 239, 0.98),
              rgba(67, 49, 214, 0.92)
            );
          box-shadow:
            0 10px 25px rgba(71, 57, 230, 0.25);
        }

        .tt-nav-item.active::before {
          content: "";
          position: absolute;
          left: -13px;
          top: 9px;
          bottom: 9px;
          width: 3px;
          border-radius: 0 5px 5px 0;
          background: #8b7cff;
          box-shadow: 0 0 12px rgba(139, 124, 255, 0.65);
        }

        .tt-nav-icon {
          width: 23px;
          text-align: center;
          color: #8f9fc1;
          font-size: 19px;
          line-height: 1;
          transition: color 0.2s ease;
        }

        .tt-nav-item:hover .tt-nav-icon,
        .tt-nav-item.active .tt-nav-icon {
          color: #ffffff;
        }

        .tt-sidebar-bottom {
          margin-top: auto;
          padding: 18px 8px 0;
        }

        .tt-small-steps {
          min-height: 220px;
          position: relative;
          overflow: hidden;
          padding: 24px 20px;
          border-radius: 16px;
          background:
            radial-gradient(
              circle at 75% 75%,
              rgba(255, 200, 140, 0.95) 0 13px,
              transparent 14px
            ),
            linear-gradient(
              155deg,
              #3b2bcb,
              #1c256a 65%,
              #0a193c
            );
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.22);
        }

        .tt-small-steps::after {
          content: "";
          position: absolute;
          left: -30px;
          right: -30px;
          bottom: -40px;
          height: 110px;
          background:
            linear-gradient(
              135deg,
              transparent 0 30%,
              #182d5b 31% 55%,
              #112348 56%
            );
          transform: skewY(-10deg);
        }

        .tt-small-title {
          position: relative;
          z-index: 2;
          font-size: 20px;
          line-height: 1.1;
          font-weight: 800;
        }

        .tt-small-sub {
          position: relative;
          z-index: 2;
          margin-top: 6px;
          font-size: 15px;
          font-weight: 700;
        }

        .tt-small-line {
          position: relative;
          z-index: 2;
          width: 40px;
          height: 3px;
          margin-top: 20px;
          border-radius: 20px;
          background: white;
        }

        .tt-small-moon {
          display: none;
        }

        .tt-main {
          width: calc(100% - 235px);
          padding: 25px 24px 50px;
        }

        .tt-topbar {
          position: relative;
          z-index: 50;
          overflow: visible;
          z-index: 50;
          overflow: visible;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 25px;
          padding: 14px 16px;
          border: 1px solid rgba(119, 142, 190, 0.14);
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(17, 34, 69, 0.72), rgba(11, 25, 53, 0.58));
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.035);
          backdrop-filter: blur(16px);
        }

        .tt-topbar::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 12% 0%, rgba(112, 91, 255, 0.12), transparent 34%);
          pointer-events: none;
        }

        .tt-welcome {
          position: relative;
          z-index: 1;
          min-width: 0;
          padding-left: 2px;
        }

        .tt-welcome-kicker {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #8998b8;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.7px;
        }

        .tt-welcome-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6c55ff;
          box-shadow: 0 0 10px rgba(108, 85, 255, 0.75);
        }

        .tt-topbar h1 {
          position: relative;
          margin: 0;
          color: #f8fbff;
          font-size: 30px;
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -1.15px;
        }

        .tt-topbar h1 span {
          display: inline-block;
          transform: translateY(1px);
        }

        .tt-topbar p {
          margin: 8px 0 0;
          color: #8d9aba;
          font-size: 12px;
          line-height: 1.45;
        }

        .tt-top-actions {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }

        .tt-search {
          height: 45px;
          width: 300px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px 0 13px;
          border-radius: 14px;
          border: 1px solid rgba(122, 143, 185, 0.22);
          background:
            linear-gradient(
              135deg,
              rgba(25, 43, 80, 0.95),
              rgba(16, 32, 64, 0.9)
            );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.025),
            0 8px 25px rgba(0, 0, 0, 0.08);
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .tt-search:focus-within {
          border-color: rgba(111, 91, 255, 0.65);
          box-shadow:
            0 0 0 3px rgba(111, 91, 255, 0.1),
            0 10px 28px rgba(0, 0, 0, 0.12);
        }

        .tt-search-icon {
          flex-shrink: 0;
          font-size: 23px;
          line-height: 1;
          color: #aab6d2;
        }

        .tt-search input {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          font-size: 12px;
        }

        .tt-search input::placeholder {
          color: #8794b4;
        }

        .tt-search kbd {
          flex-shrink: 0;
          color: #b8c4dd;
          background: rgba(48, 67, 108, 0.72);
          border: 1px solid rgba(139, 157, 196, 0.12);
          border-radius: 6px;
          padding: 5px 7px;
          font-size: 9px;
          font-family: inherit;
        }

        .tt-theme-toggle {
          width: 58px;
          height: 34px;
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          padding: 0 6px;
          border: 1px solid rgba(122, 143, 185, 0.25);
          border-radius: 999px;
          background: rgba(24, 43, 81, 0.92);
          color: #f4f7ff;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 18px rgba(0,0,0,0.14);
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .tt-theme-toggle:hover { border-color: rgba(126, 108, 255, 0.5); }
        .tt-theme-sun { width: 18px; height: 18px; display: grid; place-items: center; color: #dfe8fb; font-size: 12px; z-index: 1; }
        .tt-theme-thumb {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #8468ff, #6045e9);
          color: white;
          font-size: 12px;
          box-shadow: 0 5px 14px rgba(95, 72, 235, 0.4);
        }

        .tt-theme-toggle.light { background: #e9eef8; border-color: rgba(90, 108, 143, 0.2); }
        .tt-theme-toggle.light .tt-theme-sun { color: #66728b; }
        .tt-theme-toggle.light .tt-theme-thumb { background: linear-gradient(135deg, #ffca54, #ff9e2c); box-shadow: 0 5px 14px rgba(255, 164, 52, 0.28); }

        .tt-notification-wrap { position: relative; flex-shrink: 0; }

        .tt-round-button {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid rgba(122, 143, 185, 0.22);
          border-radius: 50%;
          background: linear-gradient(145deg, #162b54, #102140);
          color: #dce5f8;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }

        .tt-round-button:hover { transform: translateY(-2px); background: #1a315e; border-color: rgba(126, 108, 255, 0.45); }
        .tt-notification-icon { width: 19px; height: 19px; display: block; }
        .tt-round-button.notification span {
          position: absolute;
          top: -4px;
          right: -3px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          display: grid;
          place-items: center;
          border: 2px solid #0b1831;
          border-radius: 999px;
          background: #ff416d;
          color: white;
          font-size: 8px;
          font-weight: 800;
        }

        .tt-notification-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          z-index: 9999;
          width: 315px;
          overflow: hidden;
          border: 1px solid rgba(125, 148, 194, 0.2);
          border-radius: 16px;
          background: linear-gradient(145deg, #132a55, #0c1d3c);
          box-shadow: 0 20px 45px rgba(0,0,0,0.32);
          animation: tt-notification-in 0.16s ease-out;
        }

        .tt-notification-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 15px 12px; border-bottom: 1px solid rgba(125,148,194,0.12); }
        .tt-notification-head strong { display: block; color: #f5f7ff; font-size: 14px; }
        .tt-notification-head small { display: block; margin-top: 3px; color: #8494b4; font-size: 9px; }
        .tt-notification-head button { border: 0; background: transparent; color: #aab8d1; font-size: 20px; cursor: pointer; }
        .tt-notification-list { max-height: 300px; overflow-y: auto; }
        .tt-notification-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 0; border-bottom: 1px solid rgba(125,148,194,0.08); background: transparent; color: inherit; text-align: left; cursor: pointer; }
        .tt-notification-item:hover { background: rgba(108,88,255,0.09); }
        .tt-notification-dot { width: 9px; height: 9px; flex-shrink: 0; border-radius: 50%; box-shadow: 0 0 12px currentColor; }
        .tt-notification-dot.today { color: #ff416d; background: #ff416d; }
        .tt-notification-dot.overdue { color: #ff9f43; background: #ff9f43; }
        .tt-notification-copy { min-width: 0; flex: 1; }
        .tt-notification-copy strong { display: block; overflow: hidden; color: #e9efff; font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
        .tt-notification-copy small { display: block; margin-top: 3px; color: #8494b4; font-size: 9px; }
        .tt-notification-arrow { color: #8d7cff; font-size: 20px; }
        .tt-notification-empty { display: grid; place-items: center; padding: 28px 15px; text-align: center; }
        .tt-notification-empty span { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; background: rgba(20,216,145,0.12); color: #31dda4; font-weight: 800; }
        .tt-notification-empty p { margin: 9px 0 0; color: #93a1bd; font-size: 10px; }
        @keyframes tt-notification-in { from { opacity: 0; transform: translateY(-5px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .tt-profile {
          min-width: 172px;
          display: flex;
          align-items: center;
          gap: 9px;
          margin-left: 3px;
          padding: 5px 6px 5px 5px;
          border: 1px solid rgba(122, 143, 185, 0.14);
          border-radius: 15px;
          background: linear-gradient(145deg, rgba(27, 48, 91, 0.72), rgba(14, 30, 59, 0.72));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.035);
          transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
        }

        .tt-profile:hover {
          transform: translateY(-1px);
          border-color: rgba(126, 108, 255, 0.35);
          background: linear-gradient(145deg, rgba(31, 53, 101, 0.82), rgba(16, 33, 65, 0.8));
        }

        .tt-avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #f3b49e,
              #7b68ee
            );
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(117, 96, 255, 0.08);
        }

        .tt-profile-text {
          min-width: 0;
          display: grid;
          gap: 2px;
        }

        .tt-profile-text strong {
          overflow: hidden;
          color: #f3f6ff;
          font-size: 12px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tt-profile-text small {
          overflow: hidden;
          color: #8291b1;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tt-profile-menu {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: #b7c1d9;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          transition: color 0.2s ease;
        }

        .tt-profile-menu:hover {
          color: white;
        }

        .tt-error {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 15px;
          border: 1px solid
            rgba(248, 113, 113, 0.35);
          border-radius: 11px;
          background: rgba(127, 29, 29, 0.25);
          color: #fecaca;
          font-size: 13px;
        }

        .tt-error span {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          font-weight: 800;
        }

        .tt-error button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .tt-dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 305px;
          gap: 18px;
          align-items: start;
        }

        .tt-content {
          min-width: 0;
        }

        .tt-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 17px;
        }

        .tt-stat-card {
          min-height: 158px;
          position: relative;
          overflow: hidden;
          padding: 18px;
          border-radius: 17px;
          border: 1px solid
            rgba(119, 142, 190, 0.2);
          background:
            linear-gradient(
              145deg,
              rgba(18, 40, 79, 0.96),
              rgba(10, 27, 56, 0.92)
            );
          box-shadow:
            0 14px 32px rgba(0, 0, 0, 0.17);
          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease;
        }

        .tt-stat-card::before {
          content: "";
          position: absolute;
          width: 125px;
          height: 125px;
          right: -58px;
          top: -62px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.08;
          filter: blur(2px);
          pointer-events: none;
        }

        .tt-stat-card::after {
          display: none;
        }

        .tt-stat-wave {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 60px;
          pointer-events: none;
        }

        .tt-stat-wave-fill { fill: currentColor; opacity: 0.045; }
        .tt-stat-wave-line { fill: none; stroke: currentColor; stroke-width: 1.35; opacity: 0.9; }

        .tt-stat-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(
            in srgb,
            currentColor 35%,
            rgba(119, 142, 190, 0.2)
          );
          box-shadow:
            0 18px 38px rgba(0, 0, 0, 0.23);
        }

        .tt-stat-card.blue {
          color: #168aff;
        }

        .tt-stat-card.green {
          color: #14d891;
        }

        .tt-stat-card.orange {
          color: #ff983e;
        }

        .tt-stat-card.pink {
          color: #ff2690;
        }

        .tt-stat-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tt-stat-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 13px;
          color: white;
          font-size: 21px;
          font-weight: 800;
          box-shadow:
            0 9px 20px rgba(0, 0, 0, 0.18);
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease;
        }

        .tt-stat-card:hover .tt-stat-icon {
          transform: scale(1.06) rotate(-2deg);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.24);
        }

        .blue .tt-stat-icon {
          background:
            linear-gradient(135deg, #168aff, #1769d8);
        }

        .green .tt-stat-icon {
          background:
            linear-gradient(135deg, #10d48b, #0ca96f);
        }

        .orange .tt-stat-icon {
          background:
            linear-gradient(135deg, #ff9b42, #f06a22);
        }

        .pink .tt-stat-icon {
          background:
            linear-gradient(135deg, #ff3199, #d91676);
        }

        .tt-stat-arrow {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          color: #c9d4ea;
          font-size: 20px;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .tt-stat-card:hover .tt-stat-arrow {
          background: rgba(255, 255, 255, 0.12);
          transform: translateX(2px);
        }

        .tt-stat-card h3 {
          position: relative;
          z-index: 1;
          margin: 17px 0 0;
          color: #cbd5ea;
          font-size: 12px;
          font-weight: 650;
          letter-spacing: 0.1px;
        }

        .tt-stat-card strong {
          position: relative;
          z-index: 1;
          display: block;
          margin-top: 4px;
          color: #ffffff;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -1px;
        }

        .tt-stat-card p {
          position: relative;
          z-index: 1;
          margin: 7px 0 0;
          color: #8fa0bf;
          font-size: 10px;
          font-weight: 500;
        }

        .blue .tt-stat-card p {
          color: #83bfff;
        }

        .green .tt-stat-card p,
        .green p {
          color: #42e5ad;
        }

        .orange .tt-stat-card p {
          color: #ffc080;
        }

        .pink .tt-stat-card p {
          color: #ff8dc5;
        }

        .tt-progress-card {
          min-height: 128px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 17px;
          padding: 20px 22px;
          border-radius: 17px;
          border: 1px solid
            rgba(119, 142, 190, 0.2);
          background:
            linear-gradient(
              110deg,
              rgba(25, 48, 96, 0.98),
              rgba(13, 30, 62, 0.94)
            );
          box-shadow:
            0 14px 32px rgba(0, 0, 0, 0.16);
        }

        .tt-progress-card::before {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          right: 18%;
          top: -150px;
          border-radius: 50%;
          background: rgba(102, 79, 255, 0.13);
          filter: blur(3px);
          pointer-events: none;
        }

        .tt-progress-icon {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          border: 1px solid rgba(177, 161, 255, 0.35);
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 35% 30%,
              #8068ff,
              #4d38dc 72%
            );
          box-shadow:
            0 10px 25px rgba(91, 68, 255, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
          color: white;
          font-size: 24px;
        }

        .tt-progress-content {
          flex: 1;
          min-width: 150px;
          position: relative;
          z-index: 1;
        }

        .tt-progress-content h2 {
          margin: 0;
          color: #f5f7ff;
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -0.2px;
        }

        .tt-progress-content p {
          margin: 4px 0 12px;
          color: #9eacc7;
          font-size: 11px;
        }

        .tt-progress-bar {
          height: 10px;
          overflow: hidden;
          border: 1px solid rgba(145, 158, 196, 0.12);
          border-radius: 30px;
          background: #223b68;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.18);
        }

        .tt-progress-bar div {
          height: 100%;
          min-width: 0;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #7040ff,
              #6572ff,
              #8b6dff
            );
          box-shadow:
            0 0 16px rgba(107, 67, 255, 0.55);
          transition:
            width 0.45s ease;
        }

        .tt-progress-card > strong {
          position: relative;
          z-index: 1;
          min-width: 62px;
          color: #9b8cff;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -1px;
          text-align: right;
        }

        .tt-quote {
          min-width: 225px;
          position: relative;
          z-index: 1;
          padding-left: 22px;
          border-left: 1px solid
            rgba(155, 174, 214, 0.24);
          color: #cbd5e9;
          font-size: 12px;
          font-style: italic;
          line-height: 1.55;
        }

        .tt-quote small {
          display: block;
          margin-top: 5px;
          color: #8998b7;
          font-size: 10px;
          font-style: normal;
        }

        .tt-add-card,
        .tt-tasks-card,
        .tt-users-card {
          margin-bottom: 17px;
          padding: 19px;
          border: 1px solid
            rgba(119, 142, 190, 0.2);
          border-radius: 17px;
          background:
            linear-gradient(
              145deg,
              rgba(14, 32, 65, 0.94),
              rgba(9, 25, 52, 0.9)
            );
          box-shadow:
            0 14px 32px rgba(0, 0, 0, 0.14);
        }

        .tt-section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .tt-plus {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(168, 153, 255, 0.28);
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #6c50ff,
              #4e39df
            );
          color: white;
          font-size: 24px;
          font-weight: 500;
          box-shadow:
            0 9px 20px rgba(82, 62, 233, 0.3);
        }

        .tt-section-title h2,
        .tt-task-header h2,
        .tt-admin-header h2 {
          margin: 0;
          font-size: 17px;
        }

        .tt-section-title p,
        .tt-admin-header p {
          margin: 3px 0 0;
          color: #8493b3;
          font-size: 11px;
        }

        .tt-add-form {
          display: grid;
          grid-template-columns:
            minmax(200px, 2fr)
            minmax(185px, 1.05fr)
            minmax(150px, 1fr)
            auto;
          gap: 10px;
        }

        .tt-add-form input,
        .tt-add-form select,
        .tt-task-controls select {
          min-width: 0;
          width: 100%;
          height: 47px;
          padding: 0 13px;
          border: 1px solid
            rgba(125, 148, 194, 0.28);
          border-radius: 10px;
          outline: 0;
          background:
            linear-gradient(
              145deg,
              rgba(25, 45, 86, 0.96),
              rgba(19, 38, 75, 0.96)
            );
          color: #dce5f8;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .tt-add-form input:focus,
        .tt-add-form select:focus {
          border-color: rgba(111, 91, 255, 0.72);
          box-shadow:
            0 0 0 3px rgba(111, 91, 255, 0.1);
          background: #1a315d;
        }

        .tt-add-form input[type="date"] {
          color-scheme: dark;
        }

        .tt-priority-field {
          position: relative;
          min-width: 185px;
          width: 100%;
          flex: 1 1 205px;
        }

        .tt-priority-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          z-index: 1;
          transform: translateY(-52%);
          font-size: 16px;
          line-height: 1;
          pointer-events: none;
        }

        .tt-priority-icon.low {
          color: #39e6a1;
        }

        .tt-priority-icon.medium {
          color: #ffd33d;
        }

        .tt-priority-icon.high {
          color: #ff5d75;
        }

        .tt-priority-select {
          min-width: 0 !important;
          width: 100%;
          padding: 0 34px 0 38px !important;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .tt-priority-select,
        .tt-task-controls select {
          color-scheme: dark;
        }

        .tt-priority-select option,
        .tt-task-controls select option {
          background-color: #152b54;
          color: #f2f5ff;
        }

        .tt-add-form input::placeholder,
        .tt-mini-search input::placeholder {
          color: #8a99b7;
        }

        .tt-add-form button {
          min-width: 108px;
          height: 47px;
          padding: 0 18px;
          border: 1px solid rgba(153, 137, 255, 0.35);
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #7354ff,
              #4e39df
            );
          color: white;
          font-weight: 750;
          cursor: pointer;
          box-shadow:
            0 9px 22px rgba(82, 62, 233, 0.28);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .tt-add-form button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.06);
          box-shadow:
            0 13px 27px rgba(82, 62, 233, 0.36);
        }

        .tt-add-form button:active:not(:disabled) {
          transform: translateY(0);
        }

        .tt-add-form button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .tt-task-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .tt-task-header h2 span:last-child {
          color: #8998b8;
          font-size: 13px;
        }

        .tt-title-plus {
          color: #7965ff;
          margin-right: 5px;
        }

        .tt-task-controls {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .tt-mini-search {
          width: 205px;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid
            rgba(125, 148, 194, 0.28);
          border-radius: 10px;
          background: #13284f;
          color: #8e9fbd;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .tt-mini-search:focus-within {
          border-color: rgba(111, 91, 255, 0.7);
          box-shadow:
            0 0 0 3px rgba(111, 91, 255, 0.09);
        }

        .tt-mini-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          font-size: 12px;
        }

        .tt-sort-label {
          color: #b9c4db;
          font-size: 12px;
        }

        .tt-task-controls select {
          width: 145px;
          height: 40px;
          font-size: 12px;
        }

        .tt-filter-row {
          display: flex;
          gap: 8px;
          margin: 15px 0 12px;
          padding-bottom: 2px;
        }

        .tt-filter-row button {
          padding: 9px 14px;
          border: 1px solid
            rgba(125, 148, 194, 0.16);
          border-radius: 9px;
          background: #172c55;
          color: #bdc8df;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .tt-filter-row button:hover {
          border-color: rgba(118, 101, 255, 0.3);
          background: #1d3563;
          transform: translateY(-1px);
        }

        .tt-filter-row button.active {
          background:
            linear-gradient(
              135deg,
              #654cff,
              #4f3bdc
            );
          border-color: rgba(145, 129, 255, 0.4);
          color: white;
          box-shadow:
            0 7px 18px rgba(86, 64, 237, 0.28);
        }

        .tt-filter-row span {
          margin-left: 4px;
          opacity: 0.8;
        }

        .tt-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid
            rgba(125, 148, 194, 0.11);
          border-radius: 12px;
        }

        .tt-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 720px;
        }

        .tt-table th {
          padding: 12px 11px;
          border-bottom: 1px solid
            rgba(125, 148, 194, 0.15);
          background: rgba(18, 39, 77, 0.58);
          color: #8f9fbd;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.35px;
        }

        .tt-table th:first-child {
          border-top-left-radius: 11px;
        }

        .tt-table th:last-child {
          border-top-right-radius: 11px;
        }

        .tt-table td {
          padding: 13px 11px;
          border-bottom: 1px solid
            rgba(125, 148, 194, 0.09);
          color: #dce5f8;
          background: rgba(8, 23, 48, 0.28);
          font-size: 12px;
          transition:
            background 0.18s ease;
        }

        .tt-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .tt-table tbody tr:hover td {
          background: rgba(89, 75, 220, 0.08);
        }

        .tt-table .completed-row {
          opacity: 0.62;
        }

        .tt-table .completed-row .tt-task-name > span {
          text-decoration: line-through;
        }

        .tt-task-name {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 650;
        }

        .tt-checkbox {
          width: 21px;
          height: 21px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1.5px solid #667b9f;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.02);
          color: white;
          cursor: pointer;
          font-size: 11px;
          transition:
            transform 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease;
        }

        .tt-checkbox:hover {
          transform: scale(1.08);
          border-color: #7c6aff;
        }

        .tt-checkbox.checked {
          border-color: #16c982;
          background:
            linear-gradient(
              135deg,
              #18d58c,
              #0eae70
            );
          box-shadow:
            0 5px 12px rgba(22, 201, 130, 0.2);
        }

        .tt-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .tt-badge.high {
          border: 1px solid rgba(255, 85, 114, 0.55);
          background: rgba(255, 62, 99, 0.13);
          color: #ff7188;
        }

        .tt-badge.medium {
          border: 1px solid rgba(212, 168, 0, 0.55);
          background: rgba(255, 195, 0, 0.12);
          color: #ffd338;
        }

        .tt-badge.low {
          border: 1px solid rgba(25, 201, 140, 0.5);
          background: rgba(25, 201, 140, 0.1);
          color: #32e1a4;
        }

        .tt-status {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .tt-status.pending {
          border: 1px solid rgba(213, 167, 0, 0.55);
          background: rgba(255, 194, 0, 0.12);
          color: #ffd338;
        }

        .tt-status.completed {
          border: 1px solid rgba(22, 201, 130, 0.5);
          background: rgba(22, 201, 130, 0.1);
          color: #32e1a4;
        }

        .tt-date {
          color: #b7c5de;
          white-space: nowrap;
        }

        .tt-overdue {
          display: block;
          margin-top: 3px;
          color: #ff5b72;
          font-size: 9px;
          font-weight: 700;
        }

        .tt-actions {
          display: flex;
          gap: 6px;
        }

        .tt-actions button {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 800;
          transition:
            transform 0.18s ease,
            filter 0.18s ease,
            box-shadow 0.18s ease;
        }

        .tt-actions button:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }

        .tt-actions button svg {
          width: 16px;
          height: 16px;
          display: block;
        }

        .action-complete {
          background:
            linear-gradient(135deg, #18cf87, #0ca86c);
          box-shadow:
            0 5px 12px rgba(19, 199, 125, 0.18);
        }

        .action-edit {
          background:
            linear-gradient(135deg, #2789f5, #1267cf);
          box-shadow:
            0 5px 12px rgba(22, 119, 238, 0.18);
        }

        .action-delete {
          background:
            linear-gradient(135deg, #f24a59, #d92e40);
          box-shadow:
            0 5px 12px rgba(239, 60, 77, 0.18);
        }

        .tt-empty {
          padding: 45px 15px;
          text-align: center;
          color: #8f9fbd;
        }

        .tt-empty > div {
          color: #6d5cff;
          font-size: 28px;
        }

        .tt-empty h3 {
          margin: 10px 0 5px;
          color: #dce5f8;
        }

        .tt-empty p {
          margin: 0;
        }

        .tt-right-column {
          display: grid;
          gap: 17px;
          position: sticky;
          top: 20px;
        }

        .tt-calendar-card,
        .tt-today-card,
        .tt-quote-card {
          overflow: hidden;
          border: 1px solid
            rgba(119, 142, 190, 0.18);
          border-radius: 15px;
          background:
            rgba(12, 29, 59, 0.88);
          box-shadow:
            0 12px 30px rgba(0, 0, 0, 0.13);
        }

        .tt-calendar-card {
          position: relative;
          padding: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(18, 38, 78, 0.98),
              rgba(10, 27, 57, 0.96)
            );
        }

        .tt-calendar-card::before {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          right: -80px;
          top: -90px;
          border-radius: 50%;
          background: rgba(99, 74, 255, 0.14);
          filter: blur(2px);
          pointer-events: none;
        }

        .tt-calendar-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .tt-calendar-header strong {
          color: #f8fbff;
          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.2px;
        }

        .tt-calendar-arrows {
          display: flex;
          gap: 7px;
        }

        .tt-calendar-arrows button {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(130, 151, 198, 0.18);
          border-radius: 8px;
          background: rgba(39, 61, 104, 0.9);
          color: #dbe6ff;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .tt-calendar-arrows button:hover {
          background: #5b45ef;
          border-color: rgba(133, 115, 255, 0.55);
          transform: translateY(-1px);
        }

        .tt-calendar-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 7px 4px;
          text-align: center;
        }

        .tt-calendar-day {
          padding: 3px 0 7px;
          color: #7788aa;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .tt-calendar-number {
          height: 32px;
          width: 32px;
          margin: auto;
          position: relative;
          display: grid;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 50%;
          color: #d3ddf1;
          font-size: 11px;
          font-weight: 550;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .tt-calendar-number:not(:empty):hover {
          background: rgba(101, 82, 255, 0.18);
          border-color: rgba(112, 95, 255, 0.3);
          color: white;
          transform: translateY(-1px);
        }

        .tt-calendar-number.today {
          color: white;
          background:
            linear-gradient(
              135deg,
              #7653ff,
              #5037df
            );
          border-color: rgba(168, 151, 255, 0.55);
          box-shadow:
            0 7px 18px rgba(86, 60, 232, 0.45);
          font-weight: 800;
        }

        .tt-calendar-number.has-task {
          position: relative;
        }

        .tt-calendar-number.has-task::after {
          content: "";
          position: absolute;
          bottom: 2px;
          left: 50%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ff4d91;
          transform: translateX(-50%);
          box-shadow: 0 0 8px rgba(255, 77, 145, 0.7);
        }

        .tt-calendar-number.today.has-task::after {
          background: #ffffff;
          box-shadow: 0 0 7px rgba(255, 255, 255, 0.8);
        }

        .tt-today-card {
          padding: 17px;
        }

        .tt-side-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .tt-side-header h3 {
          margin: 0;
          font-size: 15px;
        }

        .tt-side-header button {
          border: 0;
          background: transparent;
          color: #7767ff;
          cursor: pointer;
          font-size: 12px;
        }

        .tt-today-item {
          display: grid;
          grid-template-columns: 13px 1fr auto;
          gap: 8px;
          align-items: center;
          padding: 9px 0;
          border-top: 1px solid
            rgba(125, 148, 194, 0.1);
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.red {
          background: #ef4054;
        }

        .dot.green {
          background: #12c87e;
        }

        .dot.yellow {
          background: #ffc400;
        }

        .today-title {
          overflow: hidden;
          color: #dbe4f6;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .today-time {
          color: #8292b2;
          font-size: 10px;
        }

        .tt-today-empty {
          padding: 18px 5px 4px;
          color: #8595b5;
          text-align: center;
          font-size: 11px;
        }

        .tt-today-empty span {
          margin-right: 5px;
          color: #17c986;
        }

        .tt-quote-card {
          position: relative;
          min-height: 280px;
          padding: 23px;
          background:
            radial-gradient(
              circle at 75% 70%,
              rgba(255, 203, 137, 0.85) 0 12px,
              transparent 13px
            ),
            linear-gradient(
              155deg,
              #3e2cc9,
              #20286c 57%,
              #0b1d43
            );
        }

        .tt-quote-card::after {
          content: "";
          position: absolute;
          left: -20px;
          right: -20px;
          bottom: -25px;
          height: 100px;
          background:
            linear-gradient(
              145deg,
              transparent 20%,
              rgba(14, 40, 79, 0.95) 21% 48%,
              rgba(10, 28, 59, 0.98) 49% 70%,
              transparent 71%
            );
        }

        .quote-mark {
          position: relative;
          z-index: 2;
          color: #7c67ff;
          font-size: 56px;
          line-height: 0.6;
        }

        .quote-badge {
          position: absolute;
          top: 18px;
          right: 16px;
          z-index: 2;
          padding: 8px 12px;
          border: 1px solid
            rgba(130, 117, 255, 0.55);
          border-radius: 20px;
          background: rgba(24, 23, 90, 0.55);
          color: white;
          font-size: 10px;
          font-weight: 700;
        }

        .tt-quote-card h2 {
          position: relative;
          z-index: 2;
          margin: 24px 0 18px;
          font-size: 22px;
          line-height: 1.15;
        }

        .quote-line {
          position: relative;
          z-index: 2;
          width: 35px;
          height: 3px;
          border-radius: 20px;
          background: #8a79ff;
        }

        .tt-quote-card p {
          position: relative;
          z-index: 2;
          margin: 25px 0 5px;
          color: #d2d9ed;
          font-size: 10px;
          line-height: 1.5;
        }

        .tt-quote-card small {
          position: relative;
          z-index: 2;
          color: #99a6c4;
          font-size: 10px;
        }

        .tt-users-card {
          margin-top: 0;
        }

        .tt-admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .tt-admin-header button {
          padding: 9px 13px;
          border: 0;
          border-radius: 8px;
          background: #5744ef;
          color: white;
          cursor: pointer;
          font-size: 11px;
        }

        .tt-user-role {
          padding: 5px 9px;
          border-radius: 20px;
          background: rgba(101, 84, 246, 0.18);
          color: #a99cff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .tt-current-user {
          color: #8393b2;
          font-size: 10px;
        }

        .delete-user {
          padding: 7px 10px;
          border: 0;
          border-radius: 7px;
          background: #e83d50;
          color: white;
          cursor: pointer;
          font-size: 10px;
        }

        .tt-app:not(.dark) .tt-sidebar {
          background: #111a36;
        }

        .tt-app:not(.dark) .tt-notification-panel { background: linear-gradient(145deg, #ffffff, #f3f6fc); border-color: rgba(87,105,140,0.16); box-shadow: 0 20px 45px rgba(40,57,87,0.18); }
        .tt-app:not(.dark) .tt-notification-head { border-color: rgba(87,105,140,0.1); }
        .tt-app:not(.dark) .tt-notification-head strong,
        .tt-app:not(.dark) .tt-notification-copy strong { color: #24324e; }
        .tt-app:not(.dark) .tt-notification-item:hover { background: rgba(104,85,240,0.06); }
        .tt-app:not(.dark) .tt-round-button { background: #f7f9fd; color: #53617a; border-color: rgba(87,105,140,0.18); }
        .tt-app:not(.dark) .tt-round-button.notification span { border-color: #f7f9fd; }
        .tt-app:not(.dark) .tt-priority-select,
        .tt-app:not(.dark) .tt-task-controls select { color-scheme: light; }
        .tt-app:not(.dark) .tt-priority-select option,
        .tt-app:not(.dark) .tt-task-controls select option {
          background-color: #ffffff;
          color: #24324e;
        }
        .tt-app:not(.dark) .tt-priority-select,
        .tt-app:not(.dark) .tt-task-controls select { color-scheme: light; }
        .tt-app:not(.dark) .tt-priority-select option,
        .tt-app:not(.dark) .tt-task-controls select option {
          background-color: #ffffff;
          color: #24324e;
        }

        .tt-app:not(.dark) .tt-stat-card {
          background:
            linear-gradient(
              145deg,
              #ffffff,
              #f6f8fc
            );
          border-color: #e0e6ef;
          box-shadow:
            0 12px 28px rgba(31, 47, 77, 0.08);
        }

        .tt-app:not(.dark) .tt-stat-card h3 {
          color: #26344e;
        }

        .tt-app:not(.dark) .tt-stat-card strong {
          color: #172033;
        }

        .tt-app:not(.dark) .tt-stat-card p {
          color: #6e7d97;
        }

        .tt-app:not(.dark) .tt-stat-card.blue p {
          color: #1672cf;
        }

        .tt-app:not(.dark) .tt-stat-card.green p {
          color: #079b6a;
        }

        .tt-app:not(.dark) .tt-stat-card.orange p {
          color: #d56b20;
        }

        .tt-app:not(.dark) .tt-stat-card.pink p {
          color: #d52b7d;
        }

        /* --------------------------------
           RIGHT SIDEBAR POLISH
           -------------------------------- */
        .tt-right-column {
          gap: 18px;
        }

        .tt-calendar-card,
        .tt-today-card,
        .tt-quote-card {
          border-radius: 18px;
          border-color: rgba(133, 151, 194, 0.2);
          box-shadow:
            0 18px 42px rgba(0, 0, 0, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
        }

        .tt-calendar-card {
          padding: 20px;
          background:
            radial-gradient(
              circle at 88% 0%,
              rgba(112, 91, 255, 0.2),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              rgba(22, 44, 88, 0.98),
              rgba(9, 25, 53, 0.98)
            );
        }

        .tt-calendar-card::before {
          width: 190px;
          height: 190px;
          right: -105px;
          top: -125px;
          background: rgba(112, 91, 255, 0.18);
          filter: blur(8px);
        }

        .tt-calendar-header {
          margin-bottom: 20px;
        }

        .tt-calendar-header strong {
          font-size: 16px;
          letter-spacing: -0.35px;
        }

        .tt-calendar-arrows {
          gap: 6px;
        }

        .tt-calendar-arrows button {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.055);
          border-color: rgba(161, 177, 215, 0.18);
          color: #e8eeff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .tt-calendar-arrows button:hover {
          background: linear-gradient(135deg, #735cff, #5139df);
          border-color: rgba(167, 151, 255, 0.65);
          box-shadow: 0 8px 20px rgba(89, 64, 230, 0.32);
          transform: translateY(-2px);
        }

        .tt-calendar-grid {
          gap: 8px 3px;
        }

        .tt-calendar-day {
          padding-bottom: 8px;
          color: #7f90b3;
          font-size: 9px;
          letter-spacing: 0.45px;
        }

        .tt-calendar-number {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          color: #cbd6ec;
          font-size: 11px;
          font-weight: 600;
        }

        .tt-calendar-number:not(:empty):hover {
          background: rgba(115, 92, 255, 0.16);
          border-color: rgba(126, 107, 255, 0.3);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 7px 16px rgba(53, 39, 153, 0.2);
        }

        .tt-calendar-number.today {
          border-radius: 11px;
          background: linear-gradient(135deg, #8067ff, #5037dc);
          border-color: rgba(177, 164, 255, 0.68);
          box-shadow:
            0 9px 22px rgba(82, 58, 222, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }

        .tt-calendar-number.has-task::after {
          bottom: 3px;
          width: 4px;
          height: 4px;
          background: #ff5b9d;
          box-shadow: 0 0 9px rgba(255, 91, 157, 0.8);
        }

        .tt-calendar-number.today.has-task::after {
          background: #fff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.95);
        }

        .tt-today-card {
          padding: 19px;
          background:
            linear-gradient(
              145deg,
              rgba(17, 34, 68, 0.98),
              rgba(10, 25, 51, 0.98)
            );
        }

        .tt-side-header {
          margin-bottom: 8px;
        }

        .tt-side-header h3 {
          font-size: 16px;
          font-weight: 760;
          letter-spacing: -0.25px;
        }

        .tt-side-header button {
          padding: 6px 8px;
          border-radius: 8px;
          color: #9587ff;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .tt-side-header button:hover {
          background: rgba(115, 92, 255, 0.11);
          color: #b0a5ff;
        }

        .tt-today-item {
          min-height: 43px;
          grid-template-columns: 12px 1fr auto;
          gap: 10px;
          padding: 10px 5px;
          border-top-color: rgba(133, 153, 197, 0.11);
          border-radius: 9px;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .tt-today-item:hover {
          background: rgba(255, 255, 255, 0.035);
          transform: translateX(2px);
        }

        .dot {
          width: 9px;
          height: 9px;
          box-shadow: 0 0 9px currentColor;
        }

        .dot.red { color: #ef4054; }
        .dot.green { color: #12c87e; }
        .dot.yellow { color: #ffc400; }

        .today-title {
          color: #e2e9f7;
          font-size: 11px;
          font-weight: 560;
        }

        .today-time {
          padding: 4px 7px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.045);
          color: #8e9dbb;
          font-size: 9px;
          font-weight: 650;
        }

        .tt-today-empty {
          min-height: 65px;
          display: grid;
          place-items: center;
          padding: 12px 5px 5px;
          color: #8998b5;
        }

        .tt-today-empty span {
          margin-right: 6px;
          color: #1bd18b;
          font-weight: 800;
        }

        .tt-quote-card {
          min-height: 300px;
          padding: 25px;
          border-color: rgba(133, 116, 255, 0.3);
          background:
            radial-gradient(
              circle at 82% 17%,
              rgba(255, 210, 140, 0.92) 0 8px,
              rgba(255, 210, 140, 0.12) 9px 18px,
              transparent 19px
            ),
            radial-gradient(
              circle at 12% 100%,
              rgba(103, 78, 255, 0.28),
              transparent 40%
            ),
            linear-gradient(155deg, #4330d2, #20286c 58%, #091c40);
          box-shadow:
            0 20px 44px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .tt-quote-card::after { opacity: 0.72; }

        .quote-mark {
          color: #9a8aff;
          font-size: 60px;
          text-shadow: 0 8px 25px rgba(118, 91, 255, 0.28);
        }

        .quote-badge {
          top: 20px;
          right: 18px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(9, 16, 67, 0.38);
          border-color: rgba(170, 158, 255, 0.38);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(8px);
          font-size: 9px;
          letter-spacing: 0.2px;
        }

        .tt-quote-card h2 {
          margin: 28px 0 19px;
          font-size: 23px;
          font-weight: 780;
          letter-spacing: -0.6px;
        }

        .quote-line {
          width: 42px;
          height: 4px;
          background: linear-gradient(90deg, #a194ff, #6e58ff);
          box-shadow: 0 0 13px rgba(135, 112, 255, 0.45);
        }

        .tt-quote-card p {
          margin-top: 27px;
          color: #dce2f1;
          font-size: 11px;
          line-height: 1.6;
        }

        .tt-quote-card small {
          color: #aab5cf;
          font-size: 10px;
        }

        .tt-app:not(.dark) .tt-calendar-card,
        .tt-app:not(.dark) .tt-today-card {
          background: linear-gradient(145deg, #ffffff, #f7f9fd);
          border-color: #e0e6ef;
          box-shadow: 0 14px 32px rgba(31, 47, 77, 0.08);
        }

        .tt-app:not(.dark) .tt-calendar-header strong,
        .tt-app:not(.dark) .tt-side-header h3 {
          color: #172033;
        }

        .tt-app:not(.dark) .tt-calendar-day { color: #8996aa; }
        .tt-app:not(.dark) .tt-calendar-number { color: #53617a; }

        .tt-app:not(.dark) .tt-calendar-number:not(:empty):hover {
          background: #f0edff;
          border-color: #ddd6ff;
          color: #4d3bd1;
          box-shadow: 0 7px 16px rgba(79, 60, 190, 0.1);
        }

        .tt-app:not(.dark) .tt-calendar-arrows button {
          background: #f4f6fa;
          border-color: #e1e6ef;
          color: #52617b;
        }

        .tt-app:not(.dark) .tt-calendar-arrows button:hover {
          color: white;
          border-color: #7763f4;
        }

        .tt-app:not(.dark) .tt-today-item { border-top-color: #edf0f5; }
        .tt-app:not(.dark) .tt-today-item:hover { background: #f6f7fb; }
        .tt-app:not(.dark) .today-title { color: #26344e; }
        .tt-app:not(.dark) .today-time {
          background: #f1f3f7;
          color: #75829a;
        }

        .tt-app:not(.dark) .tt-stat-card:hover {
          box-shadow:
            0 18px 34px rgba(31, 47, 77, 0.12);
        }

        .tt-app:not(.dark) .tt-progress-card {
          background:
            linear-gradient(
              110deg,
              #ffffff,
              #f5f7fb
            );
          border-color: #e0e6ef;
          box-shadow:
            0 12px 28px rgba(31, 47, 77, 0.08);
        }

        .tt-app:not(.dark) .tt-progress-content h2 {
          color: #172033;
        }

        .tt-app:not(.dark) .tt-progress-content p {
          color: #71809a;
        }

        .tt-app:not(.dark) .tt-progress-bar {
          background: #e7ecf5;
          border-color: #dce3ee;
        }

        .tt-app:not(.dark) .tt-quote {
          color: #56647d;
          border-left-color: #dbe2ed;
        }

        .tt-app:not(.dark) .tt-quote small {
          color: #8995a9;
        }

        .tt-app:not(.dark) .tt-stat-card,
        .tt-app:not(.dark) .tt-progress-card,
        .tt-app:not(.dark) .tt-add-card,
        .tt-app:not(.dark) .tt-tasks-card,
        .tt-app:not(.dark) .tt-users-card,
        .tt-app:not(.dark) .tt-calendar-card,
        .tt-app:not(.dark) .tt-today-card {
          background: white;
          border-color: #e1e7f0;
          color: #172033;
        }

        .tt-app:not(.dark) .tt-stat-card h3,
        .tt-app:not(.dark) .tt-section-title p,
        .tt-app:not(.dark) .tt-task-header h2,
        .tt-app:not(.dark) .tt-side-header h3 {
          color: #26344e;
        }

        .tt-app:not(.dark) .tt-stat-card strong,
        .tt-app:not(.dark) .tt-table td,
        .tt-app:not(.dark) .tt-task-name {
          color: #172033;
        }

        .tt-app:not(.dark) .tt-add-card {
          background:
            linear-gradient(
              145deg,
              #ffffff,
              #f7f9fc
            );
          border-color: #e0e6ef;
          box-shadow:
            0 12px 28px rgba(31, 47, 77, 0.08);
        }

        .tt-app:not(.dark) .tt-add-form input,
        .tt-app:not(.dark) .tt-add-form select,
        .tt-app:not(.dark) .tt-task-controls select,
        .tt-app:not(.dark) .tt-mini-search {
          background: #f6f8fc;
          color: #172033;
          border-color: #dbe2ed;
        }

        .tt-app:not(.dark) .tt-add-form input:focus,
        .tt-app:not(.dark) .tt-add-form select:focus {
          background: #ffffff;
          border-color: #7563e8;
          box-shadow:
            0 0 0 3px rgba(117, 99, 232, 0.1);
        }

        .tt-app:not(.dark) .tt-add-form input[type="date"] {
          color-scheme: light;
        }

        .tt-app:not(.dark) .tt-table-wrap {
          border-color: #e1e6ef;
        }

        .tt-app:not(.dark) .tt-table th {
          background: #f4f7fb;
          color: #71809a;
          border-bottom-color: #e1e6ef;
        }

        .tt-app:not(.dark) .tt-table td {
          background: #ffffff;
          color: #26344e;
          border-bottom-color: #edf0f5;
        }

        .tt-app:not(.dark) .tt-table tbody tr:hover td {
          background: #f8f7ff;
        }

        .tt-app:not(.dark) .tt-mini-search {
          background: #f6f8fc;
          color: #172033;
        }

        .tt-app:not(.dark) .tt-filter-row button {
          background: #f4f6fa;
          color: #52617a;
          border-color: #e1e6ef;
        }

        .tt-app:not(.dark) .tt-filter-row button:hover {
          background: #eceeff;
        }

        .tt-app:not(.dark) .tt-task-controls select {
          background: #f6f8fc;
          color: #172033;
        }

        .tt-app:not(.dark) .tt-date {
          color: #66758d;
        }

        @media (max-width: 1250px) {
          .tt-sidebar {
            width: 205px;
          }

          .tt-main {
            width: calc(100% - 205px);
          }

          .tt-dashboard-grid {
            grid-template-columns: minmax(0, 1fr) 270px;
          }

          .tt-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tt-search {
            width: 230px;
          }

          .tt-profile-text {
            display: none;
          }
        }

        @media (max-width: 1000px) {
          .tt-topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .tt-top-actions {
            width: 100%;
          }

          .tt-search {
            flex: 1;
          }

          .tt-dashboard-grid {
            grid-template-columns: 1fr;
          }

          .tt-right-column {
            position: static;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .tt-quote-card {
            min-height: 250px;
          }
        }

        @media (max-width: 760px) {
          .tt-sidebar {
            width: 64px;
            padding: 14px 7px;
          }

          .tt-brand {
            justify-content: center;
            padding: 2px 0 20px;
          }

          .tt-brand > div:last-child,
          .tt-nav-item span:last-child,
          .tt-small-steps {
            display: none;
          }

          .tt-brand-icon {
            width: 43px;
            height: 43px;
          }

          .tt-nav-item {
            justify-content: center;
            padding: 12px 4px;
            min-height: 45px;
          }

          .tt-nav-icon {
            font-size: 18px;
          }

          .tt-main {
            width: calc(100% - 64px);
            padding: 16px 10px 30px;
          }

          .tt-topbar {
            gap: 14px;
            margin-bottom: 16px;
          }

          .tt-topbar h1 {
            font-size: 22px;
            line-height: 1.2;
          }

          .tt-welcome p {
            font-size: 11px;
          }

          .tt-top-actions {
            flex-wrap: wrap;
            gap: 8px;
          }

          .tt-search {
            width: 100%;
            flex-basis: 100%;
            height: 43px;
          }

          .tt-search kbd {
            display: none;
          }

          .tt-round-button {
            width: 40px;
            height: 40px;
          }

          .tt-priority-field {
            min-width: 0;
          }

          .tt-priority-select {
            min-width: 0 !important;
          }

          .tt-profile {
            flex: 1;
            min-width: 0;
            padding: 5px 7px 5px 5px;
          }

          .tt-profile-text {
            display: block;
            min-width: 0;
          }

          .tt-profile-text strong,
          .tt-profile-text small {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .tt-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .tt-stat-card {
            min-height: 125px;
            padding: 15px;
          }

          .tt-stat-card strong {
            font-size: 27px;
          }

          .tt-progress-card {
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 12px;
          }

          .tt-progress-content {
            min-width: 0;
            flex: 1;
          }

          .tt-quote {
            width: 100%;
            border-left: 0;
            border-top: 1px solid rgba(155, 174, 214, 0.25);
            padding: 12px 0 0;
          }

          .tt-add-form {
            grid-template-columns: 1fr;
          }

          .tt-add-form button {
            min-height: 44px;
          }

          .tt-task-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .tt-task-controls {
            width: 100%;
            flex-wrap: wrap;
          }

          .tt-mini-search {
            width: 100%;
          }

          .tt-sort-label {
            display: none;
          }

          .tt-task-controls select {
            flex: 1;
            min-width: 0;
          }

          .tt-filter-row {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 3px;
            scrollbar-width: none;
          }

          .tt-filter-row::-webkit-scrollbar {
            display: none;
          }

          .tt-table-wrap {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tt-table {
            min-width: 690px;
          }

          .tt-right-column {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .tt-calendar-card,
          .tt-today-card,
          .tt-quote-card {
            border-radius: 14px;
          }

          .tt-quote-card {
            min-height: 235px;
          }
        }

        @media (max-width: 480px) {
          .tt-sidebar {
            width: 56px;
          }

          .tt-main {
            width: calc(100% - 56px);
            padding: 14px 8px 26px;
          }

          .tt-brand-icon {
            width: 39px;
            height: 39px;
          }

          .tt-nav-item {
            min-height: 42px;
            padding: 10px 2px;
          }

          .tt-nav-icon {
            font-size: 17px;
          }

          .tt-topbar h1 {
            font-size: 19px;
          }

          .tt-welcome-kicker {
            font-size: 8px;
          }

          .tt-top-actions {
            gap: 7px;
          }

          .tt-search {
            height: 41px;
          }

          .tt-round-button {
            width: 37px;
            height: 37px;
          }

          .tt-avatar {
            width: 36px;
            height: 36px;
          }

          .tt-profile {
            padding: 4px 5px 4px 4px;
          }

          .tt-profile-text strong {
            font-size: 10px;
          }

          .tt-profile-text small {
            font-size: 8px;
          }

          .tt-profile-menu {
            padding: 4px;
          }

          .tt-stat-grid {
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .tt-stat-card {
            min-height: 112px;
            padding: 12px;
          }

          .tt-stat-card strong {
            font-size: 23px;
          }

          .tt-stat-card h3 {
            font-size: 10px;
          }

          .tt-stat-card p {
            font-size: 8px;
          }

          .tt-progress-card,
          .tt-add-card,
          .tt-tasks-card {
            border-radius: 13px;
          }

          .tt-progress-card {
            padding: 15px;
          }

          .tt-progress-icon {
            width: 34px;
            height: 34px;
          }

          .tt-progress-content h2,
          .tt-section-title h2,
          .tt-task-header h2 {
            font-size: 15px;
          }

          .tt-progress-content p,
          .tt-section-title p {
            font-size: 9px;
          }

          .tt-add-card {
            padding: 15px;
          }

          .tt-add-form input,
          .tt-add-form select,
          .tt-add-form button {
            min-height: 42px;
            font-size: 11px;
          }

          .tt-tasks-card {
            padding: 14px;
          }

          .tt-task-controls select {
            min-height: 38px;
          }

          .tt-calendar-card {
            padding: 14px;
          }

          .tt-calendar-grid {
            gap: 5px 2px;
          }

          .tt-calendar-number {
            width: 29px;
            height: 29px;
            font-size: 10px;
          }

          .tt-calendar-day {
            font-size: 8px;
          }

          .tt-quote-card {
            min-height: 220px;
            padding: 19px;
          }

          .tt-quote-card h2 {
            font-size: 19px;
          }
        }

        .tt-stat-card {
          border: 1px solid rgba(119, 142, 190, 0.2);
          text-align: left;
          font-family: inherit;
          width: 100%;
          cursor: pointer;
        }
        .tt-stat-card:focus-visible { outline: 2px solid #8068ff; outline-offset: 2px; }
        .tt-settings-panel { position:absolute; top:92px; left:18px; z-index:2000; width:275px; padding:10px; border:1px solid rgba(125,148,194,.2); border-radius:17px; background:linear-gradient(145deg,#132a55,#0c1d3c); box-shadow:0 22px 50px rgba(0,0,0,.35); }
        .tt-settings-head { display:flex; align-items:center; justify-content:space-between; padding:9px 8px 12px; border-bottom:1px solid rgba(125,148,194,.12); }
        .tt-settings-head strong { display:block; color:#f5f7ff; font-size:14px; }
        .tt-settings-head small { display:block; margin-top:3px; color:#8494b4; font-size:9px; }
        .tt-settings-head button { border:0; background:transparent; color:#aab8d1; font-size:20px; cursor:pointer; }
        .tt-settings-action { width:100%; display:grid; grid-template-columns:34px 1fr 18px; align-items:center; gap:10px; margin-top:7px; padding:11px 9px; border:1px solid transparent; border-radius:12px; background:transparent; color:#e9efff; text-align:left; cursor:pointer; }
        .tt-settings-action:hover { background:rgba(108,88,255,.1); border-color:rgba(126,108,255,.2); }
        .tt-settings-action-icon { width:30px; height:30px; display:grid; place-items:center; border-radius:9px; background:rgba(108,88,255,.16); color:#9a8cff; }
        .tt-settings-action strong { display:block; font-size:11px; }
        .tt-settings-action small { display:block; margin-top:3px; color:#8190ae; font-size:8px; }
        .tt-settings-action > span:last-child { color:#8d7cff; font-size:18px; }
        .tt-settings-action.logout .tt-settings-action-icon { background:rgba(255,65,109,.12); color:#ff6d8d; }
        .tt-settings-action.logout strong { color:#ff8da7; }
        .tt-modal-backdrop { position:fixed; inset:0; z-index:5000; display:grid; place-items:center; padding:20px; background:rgba(3,10,25,.66); backdrop-filter:blur(8px); }
        .tt-profile-modal { width:min(430px,100%); border:1px solid rgba(125,148,194,.22); border-radius:20px; background:linear-gradient(145deg,#142b57,#0b1d3d); box-shadow:0 28px 70px rgba(0,0,0,.42); padding:22px; }
        .tt-modal-head { display:flex; justify-content:space-between; gap:15px; }
        .tt-modal-kicker { color:#8877ff; font-size:8px; font-weight:800; letter-spacing:1.5px; }
        .tt-modal-head h2 { margin:5px 0 0; color:#f7f9ff; font-size:22px; }
        .tt-modal-head p { margin:5px 0 0; color:#8291b1; font-size:10px; }
        .tt-modal-head > button { border:0; background:rgba(255,255,255,.05); color:#b5c0d6; width:32px; height:32px; border-radius:9px; font-size:20px; cursor:pointer; }
        .tt-profile-form { display:grid; gap:14px; margin-top:20px; }
        .tt-profile-form label { display:grid; gap:7px; }
        .tt-profile-form label > span { color:#aebbd4; font-size:10px; font-weight:700; }
        .tt-profile-form input { width:100%; min-height:44px; box-sizing:border-box; border:1px solid rgba(122,143,185,.22); border-radius:11px; outline:none; padding:0 12px; background:#102546; color:#f5f7ff; font:inherit; font-size:12px; }
        .tt-profile-form input:focus { border-color:#8068ff; box-shadow:0 0 0 3px rgba(128,104,255,.12); }
        .tt-profile-form-actions { display:flex; justify-content:flex-end; gap:9px; margin-top:4px; }
        .tt-modal-cancel,.tt-modal-save { border:0; border-radius:10px; padding:11px 15px; font:inherit; font-size:11px; font-weight:750; cursor:pointer; }
        .tt-modal-cancel { background:rgba(255,255,255,.07); color:#b9c5db; }
        .tt-modal-save { background:linear-gradient(135deg,#7055ff,#5940e8); color:white; box-shadow:0 8px 20px rgba(101,77,239,.25); }
        .tt-modal-save:disabled { opacity:.6; cursor:not-allowed; }
        .tt-app:not(.dark) .tt-settings-panel,.tt-app:not(.dark) .tt-profile-modal { background:linear-gradient(145deg,#fff,#f3f6fc); border-color:rgba(87,105,140,.16); }
        .tt-app:not(.dark) .tt-settings-head strong,.tt-app:not(.dark) .tt-modal-head h2 { color:#24324e; }
        .tt-app:not(.dark) .tt-settings-head small,.tt-app:not(.dark) .tt-modal-head p,.tt-app:not(.dark) .tt-settings-action small { color:#70809b; }
        .tt-app:not(.dark) .tt-settings-head button,.tt-app:not(.dark) .tt-modal-head > button { color:#66748e; }
        .tt-app:not(.dark) .tt-settings-action { color:#26344e; }
        .tt-app:not(.dark) .tt-profile-form label > span { color:#596a85; }
        .tt-app:not(.dark) .tt-profile-form input { background:#f7f9fd; border-color:#dce3ef; color:#1f2b42; }
      `}</style>
    </div>
  );
}

// --------------------------------
// STAT CARD
// --------------------------------
function StatCard({
  icon,
  title,
  value,
  subtitle,
  className,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`tt-stat-card ${className}`}
      onClick={onClick}
      aria-label={`${title}: ${value}`}
    >
      <div className="tt-stat-top">
        <div className="tt-stat-icon">
          {icon}
        </div>

        <div className="tt-stat-arrow">
          ›
        </div>
      </div>

      <h3>{title}</h3>

      <strong>{value}</strong>

      <p>{subtitle}</p>

      <svg
        className="tt-stat-wave"
        viewBox="0 0 240 58"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="tt-stat-wave-fill"
          d="M0 48 C28 20 55 60 84 39 C111 20 130 17 153 34 C180 54 207 52 240 25 L240 58 L0 58 Z"
        />
        <path
          className="tt-stat-wave-line"
          d="M0 48 C28 20 55 60 84 39 C111 20 130 17 153 34 C180 54 207 52 240 25"
        />
      </svg>
    </button>
  );
}

// --------------------------------
// PRIORITY BADGE
// --------------------------------
function PriorityBadge({ priority }) {
  const value = priority || "Medium";

  return (
    <span
      className={`tt-badge ${value.toLowerCase()}`}
    >
      {value}
    </span>
  );
}

// --------------------------------
// STATUS BADGE
// --------------------------------
function StatusBadge({ status }) {
  const completed = status === "completed";

  return (
    <span
      className={
        completed
          ? "tt-status completed"
          : "tt-status pending"
      }
    >
      {completed ? "Completed" : "Pending"}
    </span>
  );
}

// --------------------------------
// CALENDAR
// --------------------------------
function CalendarWidget({
  tasks,
  formatShortDate,
}) {
  const [currentDate, setCurrentDate] =
    useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const today = new Date();

  const taskDates = new Set(
    tasks
      .filter((task) => task.dueDate)
      .map((task) => {
        const date = new Date(task.dueDate);

        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
  );

  const calendarCells = [];

  for (let i = 0; i < firstDay; i += 1) {
    calendarCells.push(
      <div
        key={`empty-${i}`}
        className="tt-calendar-number"
        aria-hidden="true"
      />
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    const hasTask = taskDates.has(
      `${year}-${month}-${day}`
    );

    const cellDate = new Date(
      year,
      month,
      day
    );

    calendarCells.push(
      <div
        key={day}
        className={
          isToday
            ? "tt-calendar-number today"
            : hasTask
              ? "tt-calendar-number has-task"
              : "tt-calendar-number"
        }
        title={
          hasTask
            ? `Task due ${formatShortDate(cellDate)}`
            : formatShortDate(cellDate)
        }
      >
        {day}
      </div>
    );
  }

  return (
    <section
      className="tt-calendar-card"
      id="calendar-section"
    >
      <div className="tt-calendar-header">
        <strong>{monthName}</strong>

        <div className="tt-calendar-arrows">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() =>
              setCurrentDate(
                new Date(year, month - 1, 1)
              )
            }
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              setCurrentDate(
                new Date(year, month + 1, 1)
              )
            }
          >
            ›
          </button>
        </div>
      </div>

      <div className="tt-calendar-grid">
        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (
          <div
            className="tt-calendar-day"
            key={day}
          >
            {day}
          </div>
        ))}

        {calendarCells}
      </div>
    </section>
  );
}

export default Dashboard;