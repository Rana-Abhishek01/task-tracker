import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

function Calendar() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 9, 6));

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(day);
    }

    return cells;
  }, [currentDate]);

  const selectedLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const goMonth = (offset) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + offset,
        1
      )
    );
  };

  const isSelected = (day) =>
    day &&
    selectedDate.getFullYear() === currentDate.getFullYear() &&
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getDate() === day;

  return (
    <Layout>
      <div className="calendar-page">
        <header className="calendar-header">
          <div>
            <div className="eyebrow">WORKSPACE</div>

            <h1>Calendar</h1>

            <p>Plan your deadlines and stay on top of your schedule.</p>
          </div>

          <button
            className="today-button"
            type="button"
            onClick={() => {
              const today = new Date();

              setCurrentDate(
                new Date(today.getFullYear(), today.getMonth(), 1)
              );

              setSelectedDate(today);
            }}
          >
            Today
          </button>
        </header>

        <section className="calendar-layout">
          <div className="calendar-card">
            <div className="calendar-toolbar">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                aria-label="Previous month"
              >
                ‹
              </button>

              <h2>{monthName}</h2>

              <button
                type="button"
                onClick={() => goMonth(1)}
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <span key={day}>{day}</span>
                )
              )}
            </div>

            <div className="calendar-grid">
              {days.map((day, index) => (
                <button
                  key={`${day}-${index}`}
                  type="button"
                  className={`calendar-day ${
                    isSelected(day) ? "selected" : ""
                  } ${!day ? "empty" : ""}`}
                  disabled={!day}
                  onClick={() =>
                    day &&
                    setSelectedDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      )
                    )
                  }
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <aside className="selected-day-card">
            <div className="date-icon">▣</div>

            <h2>{selectedLabel}</h2>

            <p>No tasks scheduled for this day.</p>

            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="primary-button"
            >
              + Add Task
            </button>
          </aside>
        </section>

        <section className="upcoming-card">
          <div className="section-title">
            <div>
              <h2>Upcoming Deadlines</h2>

              <p>Your upcoming task schedule will appear here.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/tasks")}
            >
              View My Tasks →
            </button>
          </div>

          <div className="empty-calendar-state">
            <div className="empty-icon">✓</div>

            <h3>No upcoming deadlines</h3>

            <p>Create tasks with due dates to see them here.</p>
          </div>
        </section>

        <style>{`
          .calendar-page {
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

          .calendar-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 24px;
            padding-left: 70px;
          }

          .eyebrow {
            color: #8494c7;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
            margin-bottom: 8px;
          }

          .calendar-header h1 {
            margin: 0;
            font-size: clamp(34px, 4vw, 50px);
            line-height: 1;
            letter-spacing: -1.8px;
          }

          .calendar-header p {
            margin: 10px 0 0;
            color: #8fa2d5;
            font-size: 15px;
          }

          .today-button,
          .primary-button,
          .section-title button {
            border: 1px solid rgba(125, 105, 255, 0.4);
            border-radius: 12px;
            background: linear-gradient(135deg, #6549f5, #7a5cff);
            color: white;
            font-weight: 800;
            cursor: pointer;
          }

          .today-button {
            padding: 12px 18px;
          }

          .calendar-layout {
            display: grid;
            grid-template-columns:
              minmax(0, 1.5fr)
              minmax(250px, 0.65fr);
            gap: 18px;
          }

          .calendar-card,
          .selected-day-card,
          .upcoming-card {
            border: 1px solid rgba(123, 145, 205, 0.18);
            border-radius: 20px;
            background:
              linear-gradient(
                145deg,
                rgba(20, 45, 91, 0.96),
                rgba(8, 24, 53, 0.98)
              );
            box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
          }

          .calendar-card {
            padding: 20px;
          }

          .calendar-toolbar {
            display: grid;
            grid-template-columns: 42px 1fr 42px;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
          }

          .calendar-toolbar h2 {
            margin: 0;
            text-align: center;
            font-size: 22px;
          }

          .calendar-toolbar button {
            width: 42px;
            height: 42px;
            border: 1px solid rgba(141, 158, 208, 0.2);
            border-radius: 11px;
            background: #172f60;
            color: white;
            font-size: 28px;
            cursor: pointer;
          }

          .weekdays,
          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
          }

          .weekdays {
            margin-bottom: 8px;
          }

          .weekdays span {
            text-align: center;
            color: #7384b6;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .calendar-grid {
            gap: 7px;
          }

          .calendar-day {
            min-height: 60px;
            border: 1px solid transparent;
            border-radius: 12px;
            background: rgba(20, 48, 93, 0.65);
            color: #dce4ff;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .calendar-day:not(.empty):hover {
            border-color: rgba(127, 101, 255, 0.55);
            transform: translateY(-1px);
          }

          .calendar-day.selected {
            background: linear-gradient(135deg, #684af5, #805fff);
            box-shadow: 0 8px 25px rgba(104, 74, 245, 0.28);
          }

          .calendar-day.empty {
            background: transparent;
            cursor: default;
          }

          .selected-day-card {
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 260px;
          }

          .date-icon {
            width: 54px;
            height: 54px;
            display: grid;
            place-items: center;
            border-radius: 15px;
            background: rgba(106, 76, 245, 0.2);
            color: #927cff;
            font-size: 23px;
            margin-bottom: 20px;
          }

          .selected-day-card h2 {
            margin: 0;
            font-size: 22px;
            line-height: 1.25;
          }

          .selected-day-card p {
            color: #8fa2d5;
            line-height: 1.5;
            margin: 10px 0 20px;
          }

          .primary-button {
            width: fit-content;
            padding: 11px 17px;
          }

          .upcoming-card {
            margin-top: 18px;
            padding: 22px;
          }

          .section-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }

          .section-title h2 {
            margin: 0;
            font-size: 20px;
          }

          .section-title p {
            margin: 6px 0 0;
            color: #8295c8;
          }

          .section-title button {
            padding: 10px 14px;
            background: rgba(99, 75, 240, 0.14);
          }

          .empty-calendar-state {
            min-height: 190px;
            display: grid;
            place-items: center;
            align-content: center;
            text-align: center;
            color: #8da0d0;
          }

          .empty-icon {
            width: 50px;
            height: 50px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background: rgba(65, 207, 163, 0.12);
            color: #40d5a4;
            font-size: 23px;
            margin-bottom: 10px;
          }

          .empty-calendar-state h3 {
            margin: 0;
            color: #eaf0ff;
            font-size: 17px;
          }

          .empty-calendar-state p {
            margin: 7px 0 0;
          }

          @media (max-width: 900px) {
            .calendar-page {
              padding: 28px 18px 45px;
            }

            .calendar-header {
              padding-left: 58px;
            }

            .calendar-layout {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 620px) {
            .calendar-header,
            .section-title {
              flex-direction: column;
              align-items: stretch;
            }

            .calendar-card {
              padding: 16px;
            }

            .calendar-day {
              min-height: 48px;
              font-size: 14px;
            }

            .weekdays span {
              font-size: 9px;
            }

            .today-button,
            .section-title button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}

export default Calendar;