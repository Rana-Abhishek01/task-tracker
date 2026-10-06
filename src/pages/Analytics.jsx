import { useMemo } from "react";
import Layout from "../components/layout/Layout";

function Analytics() {
  const stats = useMemo(
    () => [
      {
        label: "Total Tasks",
        value: "24",
        change: "+12%",
        icon: "▦",
        className: "blue",
      },
      {
        label: "Completed",
        value: "16",
        change: "+18%",
        icon: "✓",
        className: "green",
      },
      {
        label: "Pending",
        value: "8",
        change: "-5%",
        icon: "◷",
        className: "orange",
      },
      {
        label: "Completion Rate",
        value: "67%",
        change: "+8%",
        icon: "↗",
        className: "purple",
      },
    ],
    []
  );

  const weeklyData = [
    { day: "Mon", value: 5 },
    { day: "Tue", value: 8 },
    { day: "Wed", value: 6 },
    { day: "Thu", value: 10 },
    { day: "Fri", value: 7 },
    { day: "Sat", value: 4 },
    { day: "Sun", value: 6 },
  ];

  const priorities = [
    { name: "High", value: 6, percent: 25, className: "high" },
    { name: "Medium", value: 11, percent: 46, className: "medium" },
    { name: "Low", value: 7, percent: 29, className: "low" },
  ];

  return (
    <Layout>
      <div className="analytics-page">
        <header className="analytics-header">
          <div>
            <div className="analytics-eyebrow">WORKSPACE</div>
            <h1>Analytics</h1>
            <p>Track your productivity and understand your progress.</p>
          </div>

          <button className="analytics-period">
            This Month <span>⌄</span>
          </button>
        </header>

        <section className="analytics-stats">
          {stats.map((stat) => (
            <div className="analytics-stat-card" key={stat.label}>
              <div className={`analytics-stat-icon ${stat.className}`}>
                {stat.icon}
              </div>

              <div className="analytics-stat-content">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.change} from last month</small>
              </div>
            </div>
          ))}
        </section>

        <section className="analytics-grid">
          <div className="analytics-card weekly-card">
            <div className="analytics-card-header">
              <div>
                <h2>Weekly Activity</h2>
                <p>Tasks completed this week</p>
              </div>

              <span className="analytics-total">46 tasks</span>
            </div>

            <div className="analytics-chart">
              {weeklyData.map((item) => (
                <div className="chart-column" key={item.day}>
                  <span className="chart-value">{item.value}</span>

                  <div className="chart-bar-area">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${item.value * 9}%`,
                      }}
                    />
                  </div>

                  <span className="chart-day">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Task Priority</h2>
                <p>Distribution of your tasks</p>
              </div>
            </div>

            <div className="priority-list">
              {priorities.map((item) => (
                <div className="priority-item" key={item.name}>
                  <div className="priority-top">
                    <span>
                      <i className={`priority-dot ${item.className}`} />
                      {item.name}
                    </span>

                    <strong>{item.value}</strong>
                  </div>

                  <div className="priority-track">
                    <div
                      className={`priority-fill ${item.className}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>

                  <small>{item.percent}% of total tasks</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="analytics-grid bottom-grid">
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Productivity Overview</h2>
                <p>Your overall task performance</p>
              </div>
            </div>

            <div className="productivity-list">
              <div className="productivity-row">
                <span>Tasks completed</span>
                <strong>16 / 24</strong>
              </div>

              <div className="productivity-row">
                <span>Average completion time</span>
                <strong>2.4 days</strong>
              </div>

              <div className="productivity-row">
                <span>On-time completion</span>
                <strong>82%</strong>
              </div>

              <div className="productivity-row">
                <span>Current streak</span>
                <strong>7 days 🔥</strong>
              </div>
            </div>
          </div>

          <div className="analytics-card insight-card">
            <div className="insight-icon">✦</div>

            <h2>Great progress!</h2>

            <p>
              You completed more tasks this month than last month. Keep
              maintaining your current momentum.
            </p>

            <div className="insight-progress">
              <div className="insight-progress-top">
                <span>Monthly goal</span>
                <strong>67%</strong>
              </div>

              <div className="insight-track">
                <div className="insight-fill" />
              </div>
            </div>
          </div>
        </section>

        <style>{`
          .analytics-page {
            min-height: 100vh;
            padding: 34px 36px 60px;
            background:
              radial-gradient(circle at 85% 0%, rgba(91, 66, 232, 0.14), transparent 28%),
              #071126;
            color: #ffffff;
          }

          .analytics-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 30px;
            padding-left: 56px;
          }

          .analytics-eyebrow {
            margin-bottom: 8px;
            color: #8d82ff;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
          }

          .analytics-header h1 {
            margin: 0;
            font-size: clamp(38px, 5vw, 58px);
            line-height: 1;
            letter-spacing: -2px;
          }

          .analytics-header p {
            margin: 12px 0 0;
            color: #91a7d8;
            font-size: 16px;
          }

          .analytics-period {
            margin-top: 10px;
            border: 1px solid rgba(141, 130, 255, 0.28);
            border-radius: 12px;
            padding: 13px 18px;
            background: rgba(17, 38, 77, 0.9);
            color: #ffffff;
            font-weight: 700;
            cursor: pointer;
          }

          .analytics-period span {
            margin-left: 8px;
            color: #a99cff;
          }

          .analytics-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 20px;
          }

          .analytics-stat-card,
          .analytics-card {
            border: 1px solid rgba(116, 145, 207, 0.2);
            border-radius: 20px;
            background: linear-gradient(
              145deg,
              rgba(20, 48, 94, 0.92),
              rgba(9, 28, 61, 0.95)
            );
            box-shadow: 0 18px 45px rgba(0, 0, 0, 0.14);
          }

          .analytics-stat-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 22px;
          }

          .analytics-stat-icon {
            display: grid;
            place-items: center;
            width: 50px;
            height: 50px;
            flex: 0 0 50px;
            border-radius: 15px;
            font-size: 22px;
            font-weight: 800;
          }

          .analytics-stat-icon.blue {
            background: rgba(34, 139, 255, 0.18);
            color: #5da7ff;
          }

          .analytics-stat-icon.green {
            background: rgba(24, 211, 154, 0.16);
            color: #19d39a;
          }

          .analytics-stat-icon.orange {
            background: rgba(255, 154, 55, 0.16);
            color: #ff9a37;
          }

          .analytics-stat-icon.purple {
            background: rgba(128, 91, 255, 0.18);
            color: #9a82ff;
          }

          .analytics-stat-content {
            min-width: 0;
          }

          .analytics-stat-content span {
            display: block;
            color: #92a8d8;
            font-size: 13px;
            font-weight: 700;
          }

          .analytics-stat-content strong {
            display: block;
            margin: 5px 0;
            font-size: 28px;
          }

          .analytics-stat-content small {
            color: #19d39a;
            font-size: 11px;
          }

          .analytics-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }

          .analytics-card {
            padding: 26px;
          }

          .analytics-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 26px;
          }

          .analytics-card-header h2 {
            margin: 0;
            font-size: 20px;
          }

          .analytics-card-header p {
            margin: 7px 0 0;
            color: #8fa6d6;
            font-size: 13px;
          }

          .analytics-total {
            color: #a99cff;
            font-size: 13px;
            font-weight: 800;
          }

          .analytics-chart {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            align-items: end;
            gap: 14px;
            height: 260px;
            padding-top: 10px;
          }

          .chart-column {
            display: flex;
            height: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            gap: 9px;
          }

          .chart-value {
            color: #a99cff;
            font-size: 12px;
            font-weight: 800;
          }

          .chart-bar-area {
            display: flex;
            width: 100%;
            height: 190px;
            align-items: flex-end;
            justify-content: center;
          }

          .chart-bar {
            width: min(42px, 70%);
            min-height: 20px;
            border-radius: 10px 10px 5px 5px;
            background: linear-gradient(180deg, #805bff, #5540df);
            box-shadow: 0 8px 24px rgba(103, 75, 242, 0.25);
          }

          .chart-day {
            color: #8ea5d5;
            font-size: 12px;
            font-weight: 700;
          }

          .priority-list {
            display: flex;
            flex-direction: column;
            gap: 25px;
          }

          .priority-top {
            display: flex;
            justify-content: space-between;
            margin-bottom: 9px;
            color: #d8e2ff;
            font-size: 14px;
          }

          .priority-top span {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .priority-top strong {
            color: #ffffff;
          }

          .priority-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
          }

          .priority-dot.high {
            background: #ff5b7f;
          }

          .priority-dot.medium {
            background: #ffad45;
          }

          .priority-dot.low {
            background: #39d9aa;
          }

          .priority-track,
          .insight-track {
            height: 8px;
            overflow: hidden;
            border-radius: 99px;
            background: #172f5d;
          }

          .priority-fill,
          .insight-fill {
            height: 100%;
            border-radius: inherit;
          }

          .priority-fill.high {
            background: #ff5b7f;
          }

          .priority-fill.medium {
            background: #ffad45;
          }

          .priority-fill.low {
            background: #39d9aa;
          }

          .priority-item small {
            display: block;
            margin-top: 7px;
            color: #7189bd;
            font-size: 11px;
          }

          .productivity-list {
            display: flex;
            flex-direction: column;
          }

          .productivity-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 17px 0;
            border-bottom: 1px solid rgba(125, 150, 205, 0.12);
            color: #91a7d7;
          }

          .productivity-row:first-child {
            padding-top: 0;
          }

          .productivity-row:last-child {
            border-bottom: 0;
            padding-bottom: 0;
          }

          .productivity-row strong {
            color: #ffffff;
          }

          .insight-card {
            background:
              radial-gradient(circle at 90% 10%, rgba(123, 91, 255, 0.24), transparent 35%),
              linear-gradient(145deg, rgba(25, 48, 97, 0.95), rgba(10, 27, 59, 0.98));
          }

          .insight-icon {
            display: grid;
            place-items: center;
            width: 52px;
            height: 52px;
            margin-bottom: 20px;
            border-radius: 16px;
            background: rgba(128, 91, 255, 0.2);
            color: #a99cff;
            font-size: 25px;
          }

          .insight-card h2 {
            margin: 0;
            font-size: 25px;
          }

          .insight-card > p {
            margin: 12px 0 28px;
            color: #91a8d8;
            line-height: 1.7;
          }

          .insight-progress-top {
            display: flex;
            justify-content: space-between;
            margin-bottom: 9px;
            color: #9bb0dd;
            font-size: 13px;
          }

          .insight-progress-top strong {
            color: #ffffff;
          }

          .insight-fill {
            width: 67%;
            background: linear-gradient(90deg, #6847ef, #9a7dff);
          }

          @media (max-width: 1100px) {
            .analytics-stats {
              grid-template-columns: repeat(2, 1fr);
            }

            .analytics-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 700px) {
            .analytics-page {
              padding: 25px 16px 40px;
            }

            .analytics-header {
              padding-left: 54px;
              flex-direction: column;
            }

            .analytics-period {
              margin-top: 0;
            }

            .analytics-stats {
              grid-template-columns: 1fr;
            }

            .analytics-card {
              padding: 20px;
            }

            .analytics-chart {
              gap: 7px;
              height: 220px;
            }

            .chart-bar-area {
              height: 155px;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}

export default Analytics;