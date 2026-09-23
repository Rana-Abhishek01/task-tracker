import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [sortBy, setSortBy] = useState("default");

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(true);

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
  // LOAD ALL USERS - ADMIN ONLY
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
  // COMPLETE / UNDO TASK
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

    try {
      setError("");

      const response = await api.put(`/tasks/${task.id}`, {
        title: newTitle.trim(),
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || null,
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
  // DELETE USER - ADMIN ONLY
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

  const getRoleBadgeStyle = (role) => {
    if (role === "admin") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    }

    return {
      background: "#dbeafe",
      color: "#1d4ed8",
    };
  };

  // --------------------------------
  // FILTER + SEARCH + SORT
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

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #111936, #28256d)"
          : "#f5f7fb",
        color: darkMode ? "#ffffff" : "#172033",
        padding: "30px 20px 60px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: darkMode
              ? "rgba(31, 43, 67, 0.95)"
              : "#ffffff",
            borderRadius: "20px",
            padding: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.12)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
              }}
            >
              Task Tracker
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                opacity: 0.75,
              }}
            >
              Welcome, {user?.name || "User"}
            </p>

            <p
              style={{
                margin: "4px 0 0",
                opacity: 0.65,
              }}
            >
              {user?.email || ""}
            </p>

            {user?.role === "admin" && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background: "#ede9fe",
                  color: "#6d28d9",
                  fontWeight: "700",
                  fontSize: "13px",
                }}
              >
                ADMIN
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                setDarkMode((value) => !value)
              }
              style={buttonStyle("#6c63ff")}
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>

            <button
              onClick={logout}
              style={buttonStyle("#ef4444")}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ADMIN USERS */}
        {user?.role === "admin" && (
          <div style={cardStyle(darkMode)}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  👥 All Users
                </h2>

                <p
                  style={{
                    margin: "7px 0 0",
                    opacity: 0.7,
                  }}
                >
                  Manage registered users
                </p>
              </div>

              <button
                onClick={loadUsers}
                disabled={usersLoading}
                style={{
                  ...buttonStyle("#6366f1"),
                  opacity: usersLoading ? 0.6 : 1,
                }}
              >
                {usersLoading
                  ? "Loading..."
                  : "Refresh Users"}
              </button>
            </div>

            {usersLoading ? (
              <div
                style={{
                  padding: "25px",
                  textAlign: "center",
                  opacity: 0.75,
                }}
              >
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div
                style={{
                  padding: "25px",
                  textAlign: "center",
                  opacity: 0.75,
                }}
              >
                No users found.
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "650px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: darkMode
                          ? "#263653"
                          : "#f1f5f9",
                      }}
                    >
                      <th style={tableHeaderStyle}>
                        ID
                      </th>
                      <th style={tableHeaderStyle}>
                        Name
                      </th>
                      <th style={tableHeaderStyle}>
                        Email
                      </th>
                      <th style={tableHeaderStyle}>
                        Role
                      </th>
                      <th style={tableHeaderStyle}>
                        Tasks
                      </th>
                      <th style={tableHeaderStyle}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: darkMode
                            ? "1px solid #334155"
                            : "1px solid #e5e7eb",
                        }}
                      >
                        <td style={tableCellStyle}>
                          {item.id}
                        </td>

                        <td
                          style={{
                            ...tableCellStyle,
                            fontWeight: "700",
                          }}
                        >
                          {item.name}
                        </td>

                        <td style={tableCellStyle}>
                          {item.email}
                        </td>

                        <td style={tableCellStyle}>
                          <span
                            style={{
                              ...getRoleBadgeStyle(
                                item.role
                              ),
                              padding: "6px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            {item.role}
                          </span>
                        </td>

                        <td style={tableCellStyle}>
                          {item._count?.tasks ??
                            item.tasks?.length ??
                            0}
                        </td>

                        <td style={tableCellStyle}>
                          {Number(item.id) ===
                          Number(user?.id) ? (
                            <span
                              style={{
                                opacity: 0.55,
                                fontSize: "13px",
                              }}
                            >
                              Current account
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleDeleteUser(
                                  item.id,
                                  item.name
                                )
                              }
                              style={{
                                ...buttonStyle(
                                  "#ef4444"
                                ),
                                padding: "9px 14px",
                                fontSize: "13px",
                              }}
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
          </div>
        )}

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            darkMode={darkMode}
          />

          <StatCard
            title="Completed"
            value={completedTasks}
            darkMode={darkMode}
          />

          <StatCard
            title="Pending"
            value={pendingTasks}
            darkMode={darkMode}
          />
        </div>

        {/* PROGRESS */}
        <div style={cardStyle(darkMode)}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                Task Progress
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  opacity: 0.75,
                }}
              >
                {completedTasks} of {totalTasks} tasks
                completed
              </p>
            </div>

            <strong
              style={{
                fontSize: "30px",
                color: "#8b9cff",
              }}
            >
              {progress}%
            </strong>
          </div>

          <div
            style={{
              height: "16px",
              background: "#dbe2ef",
              borderRadius: "20px",
              overflow: "hidden",
              marginTop: "18px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, #667eea, #764ba2)",
                borderRadius: "20px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#991b1b",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        {/* ADD TASK */}
        <div style={cardStyle(darkMode)}>
          <h2 style={{ marginTop: 0 }}>
            Add New Task
          </h2>

          <form
            onSubmit={handleAddTask}
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 2fr) minmax(150px, 1fr) minmax(150px, 1fr) auto",
              gap: "12px",
            }}
          >
            <input
              type="text"
              placeholder="Enter your task..."
              value={taskTitle}
              onChange={(event) =>
                setTaskTitle(event.target.value)
              }
              style={inputStyle}
            />

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              style={inputStyle}
            >
              <option value="Low">
                Low Priority
              </option>
              <option value="Medium">
                Medium Priority
              </option>
              <option value="High">
                High Priority
              </option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                ...buttonStyle("#667eea"),
                opacity: saving ? 0.6 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving ? "Saving..." : "Add Task"}
            </button>
          </form>
        </div>

        {/* SEARCH / FILTER */}
        <div
          style={{
            ...cardStyle(darkMode),
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            style={{
              ...inputStyle,
              flex: "1 1 280px",
            }}
          />

          <button
            onClick={() => setFilter("all")}
            style={filterButton(filter === "all")}
          >
            All
          </button>

          <button
            onClick={() => setFilter("pending")}
            style={filterButton(filter === "pending")}
          >
            Pending
          </button>

          <button
            onClick={() => setFilter("completed")}
            style={filterButton(filter === "completed")}
          >
            Completed
          </button>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
            style={{
              ...inputStyle,
              minWidth: "190px",
            }}
          >
            <option value="default">Default</option>
            <option value="overdue">
              Overdue First
            </option>
            <option value="high">
              High Priority First
            </option>
            <option value="due">Due Date</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* TASK LIST */}
        <div>
          {loading ? (
            <div style={cardStyle(darkMode)}>
              <h3 style={{ margin: 0 }}>
                Loading tasks from backend...
              </h3>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div style={cardStyle(darkMode)}>
              <h3 style={{ margin: 0 }}>
                No tasks found
              </h3>

              <p style={{ opacity: 0.7 }}>
                Add a new task to get started.
              </p>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  ...cardStyle(darkMode),
                  marginBottom: "18px",
                  opacity:
                    task.status === "completed"
                      ? 0.75
                      : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "22px",
                        textDecoration:
                          task.status === "completed"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      {task.title}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginTop: "12px",
                      }}
                    >
                      <span
                        style={{
                          padding: "7px 12px",
                          borderRadius: "20px",
                          background:
                            task.priority === "High"
                              ? "#fee2e2"
                              : task.priority ===
                                  "Low"
                                ? "#dcfce7"
                                : "#fef3c7",
                          color:
                            task.priority === "High"
                              ? "#991b1b"
                              : task.priority ===
                                  "Low"
                                ? "#166534"
                                : "#92400e",
                          fontWeight: "700",
                          fontSize: "13px",
                        }}
                      >
                        {task.priority || "Medium"}
                      </span>

                      {task.dueDate && (
                        <span
                          style={{
                            fontSize: "14px",
                            opacity: 0.8,
                          }}
                        >
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}

                      {isOverdue(task) && (
                        <span
                          style={{
                            color: "#ef4444",
                            fontWeight: "700",
                            fontSize: "14px",
                          }}
                        >
                          • Overdue
                        </span>
                      )}

                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "20px",
                          background:
                            task.status === "completed"
                              ? "#dcfce7"
                              : "#fef3c7",
                          color:
                            task.status === "completed"
                              ? "#166534"
                              : "#92400e",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {task.status === "completed"
                          ? "COMPLETED"
                          : "PENDING"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleToggleTask(task)
                      }
                      style={buttonStyle(
                        task.status === "completed"
                          ? "#64748b"
                          : "#22c55e"
                      )}
                    >
                      {task.status === "completed"
                        ? "Undo"
                        : "Complete"}
                    </button>

                    <button
                      onClick={() =>
                        handleEditTask(task)
                      }
                      style={buttonStyle("#f59e0b")}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteTask(task.id)
                      }
                      style={buttonStyle("#ef4444")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RESPONSIVE */}
      <style>{`
        @media (max-width: 850px) {
          form {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          body {
            margin: 0;
          }
        }

        table {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

// --------------------------------
// STAT CARD
// --------------------------------
function StatCard({ title, value, darkMode }) {
  return (
    <div
      style={{
        background: darkMode
          ? "rgba(31, 43, 67, 0.95)"
          : "#ffffff",
        borderRadius: "20px",
        padding: "30px",
        textAlign: "center",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.10)",
      }}
    >
      <p
        style={{
          margin: 0,
          opacity: 0.7,
          fontSize: "18px",
        }}
      >
        {title}
      </p>

      <strong
        style={{
          display: "block",
          fontSize: "36px",
          marginTop: "10px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

// --------------------------------
// CARD STYLE
// --------------------------------
function cardStyle(darkMode) {
  return {
    background: darkMode
      ? "rgba(31, 43, 67, 0.95)"
      : "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.10)",
  };
}

// --------------------------------
// INPUT STYLE
// --------------------------------
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "15px 16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "16px",
  outline: "none",
  background: "#ffffff",
  color: "#111827",
};

// --------------------------------
// BUTTON STYLE
// --------------------------------
function buttonStyle(background) {
  return {
    border: "none",
    borderRadius: "10px",
    padding: "13px 20px",
    background,
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  };
}

// --------------------------------
// FILTER BUTTON
// --------------------------------
function filterButton(active) {
  return {
    border: "none",
    borderRadius: "10px",
    padding: "13px 20px",
    background: active ? "#5b4bff" : "#334155",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  };
}

// --------------------------------
// TABLE STYLES
// --------------------------------
const tableHeaderStyle = {
  padding: "14px 12px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "700",
};

const tableCellStyle = {
  padding: "14px 12px",
  textAlign: "left",
  verticalAlign: "middle",
};

export default Dashboard;