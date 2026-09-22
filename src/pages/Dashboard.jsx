import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDueDate, setEditDueDate] = useState("");

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  // =========================
  // DARK MODE
  // =========================
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "darkMode",
      darkMode.toString()
    );
  }, [darkMode]);

  // =========================
  // LOAD USER + TASKS
  // =========================
  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("taskTrackerUser")
    );

    const loggedIn =
      localStorage.getItem("isLoggedIn");

    if (!savedUser || loggedIn !== "true") {
      navigate("/login");
      return;
    }

    setUser(savedUser);

    const taskKey = `tasks_${savedUser.email}`;

    const savedTasks = JSON.parse(
      localStorage.getItem(taskKey)
    );

    if (savedTasks) {
      setTasks(savedTasks);
    } else {
      setTasks([]);
    }
  }, [navigate]);

  // =========================
  // SAVE TASKS
  // =========================
  useEffect(() => {
    if (!user) return;

    const taskKey = `tasks_${user.email}`;

    localStorage.setItem(
      taskKey,
      JSON.stringify(tasks)
    );
  }, [tasks, user]);

  // =========================
  // ADD TASK
  // =========================
  const handleAddTask = (e) => {
    e.preventDefault();

    if (!task.trim()) {
      alert("Please enter a task.");
      return;
    }

    const newTask = {
      id: Date.now(),
      title: task.trim(),
      completed: false,
      priority: priority,
      dueDate: dueDate,
    };

    setTasks((prevTasks) => [
      ...prevTasks,
      newTask,
    ]);

    setTask("");
    setPriority("Medium");
    setDueDate("");
  };

  // =========================
  // COMPLETE / UNDO
  // =========================
  const toggleTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item
      )
    );
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    setTasks((prevTasks) =>
      prevTasks.filter((item) => item.id !== id)
    );
  };

  // =========================
  // START EDIT
  // =========================
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.title);
    setEditPriority(item.priority || "Medium");
    setEditDueDate(item.dueDate || "");
  };

  // =========================
  // SAVE EDIT
  // =========================
  const saveEdit = (id) => {
    if (!editText.trim()) {
      alert("Task cannot be empty.");
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === id
          ? {
              ...item,
              title: editText.trim(),
              priority: editPriority,
              dueDate: editDueDate,
            }
          : item
      )
    );

    setEditingId(null);
    setEditText("");
    setEditPriority("Medium");
    setEditDueDate("");
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditPriority("Medium");
    setEditDueDate("");
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  // =========================
  // STATS
  // =========================
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (item) => item.completed
  ).length;

  const pendingTasks = tasks.filter(
    (item) => !item.completed
  ).length;

  // =========================
  // PROGRESS
  // =========================
  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  // =========================
  // DATE FORMAT
  // =========================
  const formatDate = (date) => {
    if (!date) return "No due date";

    const formatted = new Date(
      `${date}T00:00:00`
    );

    return formatted.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // OVERDUE CHECK
  // =========================
  const isOverdue = (date, completed) => {
    if (!date || completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(
      `${date}T00:00:00`
    );

    return taskDate < today;
  };

  // =========================
  // SEARCH + FILTER
  // =========================
  const filteredTasks = tasks.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchesFilter = true;

    if (filter === "pending") {
      matchesFilter = !item.completed;
    }

    if (filter === "completed") {
      matchesFilter = item.completed;
    }

    return matchesSearch && matchesFilter;
  });

  // =========================
  // SORT TASKS
  // =========================
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => {
      if (sortBy === "default") {
        return 0;
      }

      if (sortBy === "overdue") {
        const aOverdue = isOverdue(
          a.dueDate,
          a.completed
        );

        const bOverdue = isOverdue(
          b.dueDate,
          b.completed
        );

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        return 0;
      }

      if (sortBy === "priority") {
        const priorityValue = {
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return (
          (priorityValue[b.priority] || 0) -
          (priorityValue[a.priority] || 0)
        );
      }

      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) {
          return 0;
        }

        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return (
          new Date(
            `${a.dueDate}T00:00:00`
          ) -
          new Date(
            `${b.dueDate}T00:00:00`
          )
        );
      }

      if (sortBy === "newest") {
        return b.id - a.id;
      }

      if (sortBy === "oldest") {
        return a.id - b.id;
      }

      return 0;
    }
  );

  // =========================
  // USER INITIAL
  // =========================
  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      className={
        darkMode
          ? "dashboard-page dark-mode"
          : "dashboard-page"
      }
    >

      {/* ================= HEADER ================= */}
      <header className="dashboard-header">

        <div>
          <h1>Task Tracker</h1>

          <p>
            Welcome{" "}
            <strong>
              {user?.name || "User"}
            </strong>
          </p>
        </div>

        <div className="header-actions">

          <button
            type="button"
            className="theme-btn"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* ================= MAIN ================= */}
      <main className="dashboard-container">

        {/* ================= PROFILE ================= */}
        <div className="profile-card">

          <div className="profile-left">

            <div className="profile-avatar">
              {userInitial}
            </div>

            <div className="profile-info">

              <h2>
                {user?.name || "User"}
              </h2>

              <p>
                {user?.email || "No email"}
              </p>

              <span>
                Task Tracker User
              </span>

            </div>

          </div>

          <div className="profile-summary">

            <div>
              <strong>{totalTasks}</strong>
              <span>Total</span>
            </div>

            <div>
              <strong>{completedTasks}</strong>
              <span>Done</span>
            </div>

            <div>
              <strong>{progressPercentage}%</strong>
              <span>Progress</span>
            </div>

          </div>

        </div>

        {/* ================= STATS ================= */}
        <div className="stats-container">

          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{totalTasks}</p>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <p>{completedTasks}</p>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <p>{pendingTasks}</p>
          </div>

        </div>

        {/* ================= PROGRESS ================= */}
        <div className="progress-card">

          <div className="progress-header">

            <div>
              <h2>Task Progress</h2>

              <p>
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>

            <strong>
              {progressPercentage}%
            </strong>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            ></div>

          </div>

        </div>

        {/* ================= ADD TASK ================= */}
        <div className="add-task-card">

          <h2>Add New Task</h2>

          <form
            className="add-task-form"
            onSubmit={handleAddTask}
          >

            <input
              type="text"
              placeholder="Enter your task..."
              value={task}
              onChange={(e) =>
                setTask(e.target.value)
              }
            />

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
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
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />

            <button type="submit">
              Add Task
            </button>

          </form>

        </div>

        {/* ================= SEARCH ================= */}
        <div className="search-container">

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* ================= FILTERS + SORT ================= */}
        <div className="task-controls">

          <div className="filter-container">

            <button
              type="button"
              className={
                filter === "all"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "pending"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                setFilter("pending")
              }
            >
              Pending
            </button>

            <button
              type="button"
              className={
                filter === "completed"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                setFilter("completed")
              }
            >
              Completed
            </button>

          </div>

          <div className="sort-container">

            <label htmlFor="sortTasks">
              Sort:
            </label>

            <select
              id="sortTasks"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="default">
                Default
              </option>

              <option value="overdue">
                Overdue First
              </option>

              <option value="priority">
                High Priority First
              </option>

              <option value="dueDate">
                Due Date
              </option>

              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

            </select>

          </div>

        </div>

        {/* ================= TASK LIST ================= */}
        <div className="task-list">

          {sortedTasks.length === 0 ? (

            <div className="empty-state">

              <h3>No tasks found</h3>

              <p>
                Add a new task to get started.
              </p>

            </div>

          ) : (

            sortedTasks.map((item) => (

              <div
                className={`task-item ${
                  item.completed
                    ? "completed-task"
                    : ""
                }`}
                key={item.id}
              >

                {/* ================= EDIT MODE ================= */}
                {editingId === item.id ? (

                  <div className="edit-task-container">

                    <input
                      className="edit-input"
                      type="text"
                      value={editText}
                      onChange={(e) =>
                        setEditText(
                          e.target.value
                        )
                      }
                      autoFocus
                    />

                    <select
                      className="edit-select"
                      value={editPriority}
                      onChange={(e) =>
                        setEditPriority(
                          e.target.value
                        )
                      }
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
                      className="edit-date"
                      type="date"
                      value={editDueDate}
                      onChange={(e) =>
                        setEditDueDate(
                          e.target.value
                        )
                      }
                    />

                    <div className="edit-actions">

                      <button
                        type="button"
                        className="save-btn"
                        onClick={() =>
                          saveEdit(item.id)
                        }
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  <>
                    {/* ================= TASK CONTENT ================= */}
                    <div className="task-content">

                      <div className="task-details">

                        <h3
                          className={
                            item.completed
                              ? "task-completed"
                              : ""
                          }
                        >
                          {item.title}
                        </h3>

                        <div className="task-meta">

                          <span
                            className={`priority priority-${item.priority?.toLowerCase()}`}
                          >
                            {item.priority || "Medium"}
                          </span>

                          <span
                            className={
                              isOverdue(
                                item.dueDate,
                                item.completed
                              )
                                ? "due-date overdue"
                                : "due-date"
                            }
                          >
                            {item.dueDate
                              ? `Due: ${formatDate(
                                  item.dueDate
                                )}`
                              : "No due date"}

                            {isOverdue(
                              item.dueDate,
                              item.completed
                            ) && " • Overdue"}

                          </span>

                        </div>

                      </div>

                    </div>

                    {/* ================= ACTION BUTTONS ================= */}
                    <div className="task-actions">

                      <button
                        type="button"
                        className="complete-btn"
                        onClick={() =>
                          toggleTask(item.id)
                        }
                      >
                        {item.completed
                          ? "Undo"
                          : "Complete"}
                      </button>

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          startEdit(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          deleteTask(item.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </>
                )}

              </div>

            ))

          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;