import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";

function MyTasks() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("taskTrackerToken");
    localStorage.removeItem("taskTrackerUser");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  }, [navigate]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/tasks");
      setTasks(response.data?.tasks || []);
    } catch (err) {
      console.error("Load tasks error:", err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError(err.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("taskTrackerToken");
    const savedUser = localStorage.getItem("taskTrackerUser");

    if (!token) {
      navigate("/login");
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("taskTrackerUser");
      }
    }

    loadTasks();
  }, [navigate, loadTasks]);

  const handleAddTask = async (event) => {
    event.preventDefault();
    if (!taskTitle.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.post("/tasks", {
        title: taskTitle.trim(),
        description: "",
        status: "pending",
        priority,
        dueDate: dueDate || null,
      });

      const newTask = response.data?.task;
      if (newTask) {
        setTasks((current) => [newTask, ...current]);
      } else {
        await loadTasks();
      }

      setTaskTitle("");
      setPriority("Medium");
      setDueDate("");
      setSuccess("Task added successfully.");
    } catch (err) {
      console.error("Add task error:", err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError(err.response?.data?.message || "Unable to create task.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";

    try {
      setError("");
      setSuccess("");
      const response = await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description || "",
        status: nextStatus,
        priority: task.priority || "Medium",
        dueDate: task.dueDate || null,
      });

      const updated = response.data?.task;
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, ...(updated || {}), status: updated?.status || nextStatus }
            : item
        )
      );
    } catch (err) {
      console.error("Update task error:", err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError(err.response?.data?.message || "Unable to update task.");
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      setError("");
      setSuccess("");
      await api.delete(`/tasks/${task.id}`);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setSuccess("Task deleted successfully.");
    } catch (err) {
      console.error("Delete task error:", err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      setError(err.response?.data?.message || "Unable to delete task.");
    }
  };

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && task.status === "completed") ||
        (filter === "pending" && task.status !== "completed");

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const pendingCount = tasks.length - completedCount;
  const isAdmin = user?.role === "admin";

  return (
    <Layout isAdmin={isAdmin}>
      <div className="my-tasks-page">
        <style>{`
          .my-tasks-page {
            min-height: 100vh;
            padding: 34px 34px 60px;
            color: #eef2ff;
            background:
              radial-gradient(circle at 80% 0%, rgba(91, 66, 232, 0.18), transparent 32%),
              #071126;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .my-tasks-shell {
            max-width: 1450px;
            margin: 0 auto;
          }

          .my-tasks-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
            margin-bottom: 28px;
            padding: 18px 18px 0 68px;
          }

          .my-tasks-eyebrow {
            margin: 0 0 8px;
            color: #8f83ff;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .my-tasks-header h1 {
            margin: 0;
            font-size: clamp(30px, 4vw, 46px);
            line-height: 1.05;
            letter-spacing: -1.5px;
          }

          .my-tasks-header p {
            margin: 10px 0 0;
            color: #8f9dbd;
            font-size: 15px;
          }

          .my-tasks-refresh {
            border: 1px solid rgba(145, 157, 210, 0.2);
            border-radius: 12px;
            padding: 11px 16px;
            background: #0d1d3d;
            color: #eef2ff;
            font-weight: 700;
            cursor: pointer;
          }

          .my-tasks-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 20px;
          }

          .my-task-stat {
            padding: 20px;
            border: 1px solid rgba(137, 153, 208, 0.15);
            border-radius: 18px;
            background: linear-gradient(145deg, #10244a, #0b1b39);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.16);
          }

          .my-task-stat span {
            display: block;
            margin-bottom: 8px;
            color: #8d9aba;
            font-size: 13px;
            font-weight: 700;
          }

          .my-task-stat strong {
            font-size: 30px;
          }

          .my-tasks-card {
            margin-bottom: 20px;
            padding: 22px;
            border: 1px solid rgba(137, 153, 208, 0.15);
            border-radius: 20px;
            background: rgba(10, 28, 59, 0.9);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
          }

          .my-tasks-card-title {
            margin: 0 0 16px;
            font-size: 19px;
          }

          .my-task-form {
            display: grid;
            grid-template-columns: minmax(240px, 1fr) 190px 190px 130px;
            gap: 12px;
          }

          .my-task-input,
          .my-task-select {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid rgba(140, 157, 214, 0.2);
            border-radius: 12px;
            padding: 13px 14px;
            outline: none;
            background: #142a54;
            color: #eef2ff;
            font-size: 14px;
          }

          .my-task-input:focus,
          .my-task-select:focus {
            border-color: #7358ff;
            box-shadow: 0 0 0 3px rgba(115, 88, 255, 0.12);
          }

          .my-task-add {
            border: 0;
            border-radius: 12px;
            background: linear-gradient(135deg, #7455ff, #5b3ee7);
            color: white;
            font-weight: 800;
            cursor: pointer;
          }

          .my-task-add:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .my-task-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 16px;
          }

          .my-task-search {
            flex: 1;
            max-width: 480px;
          }

          .my-task-filters {
            display: flex;
            gap: 8px;
          }

          .my-task-filter {
            border: 1px solid rgba(140, 157, 214, 0.18);
            border-radius: 10px;
            padding: 9px 13px;
            background: #10234a;
            color: #aab6d4;
            font-weight: 700;
            cursor: pointer;
          }

          .my-task-filter.active {
            border-color: transparent;
            background: #6548ef;
            color: #fff;
          }

          .my-task-list {
            display: grid;
            gap: 10px;
          }

          .my-task-row {
            display: grid;
            grid-template-columns: 38px minmax(0, 1fr) auto auto 42px;
            align-items: center;
            gap: 14px;
            padding: 15px;
            border: 1px solid rgba(140, 157, 214, 0.12);
            border-radius: 14px;
            background: rgba(18, 39, 78, 0.72);
          }

          .my-task-check {
            width: 25px;
            height: 25px;
            border: 2px solid #7180a7;
            border-radius: 8px;
            background: transparent;
            color: white;
            cursor: pointer;
          }

          .my-task-check.done {
            border-color: #16c784;
            background: #16c784;
          }

          .my-task-title {
            margin: 0 0 4px;
            font-size: 15px;
            font-weight: 800;
          }

          .my-task-title.done {
            color: #73809f;
            text-decoration: line-through;
          }

          .my-task-meta {
            color: #7f8eaf;
            font-size: 12px;
          }

          .my-task-badge {
            border-radius: 999px;
            padding: 6px 10px;
            background: #29375a;
            color: #d9e0f5;
            font-size: 11px;
            font-weight: 800;
          }

          .my-task-badge.high {
            background: rgba(255, 79, 111, 0.14);
            color: #ff6d89;
          }

          .my-task-badge.low {
            background: rgba(41, 203, 145, 0.13);
            color: #42dca8;
          }

          .my-task-delete {
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 10px;
            background: rgba(255, 79, 111, 0.1);
            color: #ff6d89;
            cursor: pointer;
            font-size: 16px;
          }

          .my-task-message {
            margin-bottom: 18px;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 13px;
          }

          .my-task-message.error {
            border: 1px solid rgba(255, 87, 105, 0.35);
            background: rgba(109, 24, 54, 0.3);
            color: #ff9aa9;
          }

          .my-task-message.success {
            border: 1px solid rgba(42, 211, 151, 0.25);
            background: rgba(19, 113, 85, 0.2);
            color: #65e2b9;
          }

          .my-task-empty {
            padding: 45px 20px;
            text-align: center;
            color: #8492b1;
          }

          @media (max-width: 900px) {
            .my-tasks-page {
              padding: 24px 16px 50px;
            }

            .my-tasks-header {
              padding-left: 58px;
            }

            .my-tasks-stats {
              grid-template-columns: 1fr;
            }

            .my-task-form {
              grid-template-columns: 1fr;
            }

            .my-task-toolbar {
              align-items: stretch;
              flex-direction: column;
            }

            .my-task-search {
              max-width: none;
            }

            .my-task-filters {
              overflow-x: auto;
            }

            .my-task-row {
              grid-template-columns: 34px minmax(0, 1fr) auto;
            }

            .my-task-row .my-task-badge,
            .my-task-row .my-task-delete {
              grid-column: auto;
            }
          }
        `}</style>

        <div className="my-tasks-shell">
          <header className="my-tasks-header">
            <div>
              <p className="my-tasks-eyebrow">Workspace</p>
              <h1>My Tasks</h1>
              <p>Manage your tasks, priorities and deadlines in one place.</p>
            </div>
            <button className="my-tasks-refresh" type="button" onClick={loadTasks}>
              ↻ Refresh
            </button>
          </header>

          {error && <div className="my-task-message error">{error}</div>}
          {success && <div className="my-task-message success">{success}</div>}

          <section className="my-tasks-stats">
            <div className="my-task-stat"><span>Total Tasks</span><strong>{tasks.length}</strong></div>
            <div className="my-task-stat"><span>Pending</span><strong>{pendingCount}</strong></div>
            <div className="my-task-stat"><span>Completed</span><strong>{completedCount}</strong></div>
          </section>

          <section className="my-tasks-card">
            <h2 className="my-tasks-card-title">Add New Task</h2>
            <form className="my-task-form" onSubmit={handleAddTask}>
              <input
                className="my-task-input"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="What do you want to do?"
                aria-label="Task title"
              />
              <select className="my-task-select" value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority">
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <input className="my-task-input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Due date" />
              <button className="my-task-add" type="submit" disabled={saving}>{saving ? "Adding..." : "+ Add Task"}</button>
            </form>
          </section>

          <section className="my-tasks-card">
            <div className="my-task-toolbar">
              <input
                className="my-task-input my-task-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your tasks..."
                aria-label="Search tasks"
              />
              <div className="my-task-filters">
                {[['all', 'All'], ['pending', 'Pending'], ['completed', 'Completed']].map(([value, label]) => (
                  <button key={value} type="button" className={`my-task-filter ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{label}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="my-task-empty">Loading your tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="my-task-empty">No tasks found. Add a task above to get started.</div>
            ) : (
              <div className="my-task-list">
                {filteredTasks.map((task) => (
                  <div className="my-task-row" key={task.id}>
                    <button type="button" className={`my-task-check ${task.status === 'completed' ? 'done' : ''}`} onClick={() => toggleTask(task)} aria-label={task.status === 'completed' ? `Mark ${task.title} pending` : `Complete ${task.title}`}>
                      {task.status === "completed" ? "✓" : ""}
                    </button>
                    <div>
                      <p className={`my-task-title ${task.status === 'completed' ? 'done' : ''}`}>{task.title}</p>
                      <span className="my-task-meta">{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"}</span>
                    </div>
                    <span className={`my-task-badge ${(task.priority || '').toLowerCase()}`}>{task.priority || "Medium"}</span>
                    <span className="my-task-badge">{task.status === "completed" ? "Completed" : "Pending"}</span>
                    <button type="button" className="my-task-delete" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`}>×</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default MyTasks;
