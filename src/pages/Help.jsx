import { useState } from "react";
import Layout from "../components/layout/Layout";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How do I create a new task?",
      answer:
        "Open My Tasks from the sidebar and click Add New Task. Enter the task details, choose priority and due date, then save the task.",
    },
    {
      question: "How can I mark a task as completed?",
      answer:
        "Go to My Tasks and use the task status control to change a pending task to completed.",
    },
    {
      question: "Can I edit my profile information?",
      answer:
        "Yes. Open Profile from the sidebar, update your name or email address, and click Save Changes.",
    },
    {
      question: "How do I change my password?",
      answer:
        "Open Settings and use the Change Password option in the Security section.",
    },
    {
      question: "Where can I see my task progress?",
      answer:
        "Open Analytics from the sidebar to view your completion rate, weekly activity and task priority distribution.",
    },
    {
      question: "How do I log out?",
      answer:
        "Open the sidebar and click Logout at the bottom of the account section.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  return (
    <Layout>
      <div className="help-page">
        <div className="help-header">
          <div>
            <div className="help-eyebrow">SUPPORT</div>

            <h1>Help & Support</h1>

            <p>
              Find answers, learn how Task Tracker works, or get support.
            </p>
          </div>
        </div>

        {/* Quick Help */}
        <div className="help-quick-grid">
          <div className="help-quick-card">
            <div className="help-quick-icon">?</div>

            <div>
              <h2>Getting Started</h2>
              <p>
                Learn the basics of managing your tasks and workspace.
              </p>

              <button
                type="button"
                className="help-link-button"
                onClick={() => {
                  document
                    .getElementById("faq-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View guide →
              </button>
            </div>
          </div>

          <div className="help-quick-card">
            <div className="help-quick-icon">✓</div>

            <div>
              <h2>Task Management</h2>
              <p>
                Learn how to create, organize and complete tasks.
              </p>

              <button
                type="button"
                className="help-link-button"
                onClick={() => {
                  window.location.href = "/tasks";
                }}
              >
                Manage tasks →
              </button>
            </div>
          </div>

          <div className="help-quick-card">
            <div className="help-quick-icon">⚙</div>

            <div>
              <h2>Account & Security</h2>
              <p>
                Manage your profile, password and account preferences.
              </p>

              <button
                type="button"
                className="help-link-button"
                onClick={() => {
                  window.location.href = "/settings";
                }}
              >
                Open settings →
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="faq-card" id="faq-section">
          <div className="faq-header">
            <div>
              <h2>Frequently Asked Questions</h2>
              <p>
                Quick answers to common Task Tracker questions.
              </p>
            </div>

            <div className="faq-count">
              {faqs.length} Questions
            </div>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`faq-item ${isOpen ? "faq-open" : ""}`}
                >
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>

                    <span className="faq-plus">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Support */}
        <section className="support-card">
          <div className="support-icon">✦</div>

          <div className="support-content">
            <h2>Still need help?</h2>

            <p>
              If you cannot find the answer you're looking for,
              contact the support team and we'll help you out.
            </p>
          </div>

          <button
            type="button"
            className="contact-button"
            onClick={() => {
              window.location.href =
                "mailto:support@tasktracker.com?subject=Task%20Tracker%20Support";
            }}
          >
            Contact Support
          </button>
        </section>
      </div>

      <style>{`
        .help-page {
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

        .help-header {
          max-width: 1500px;
          margin: 0 auto 30px;
        }

        .help-eyebrow {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #927cff;
          margin-bottom: 8px;
        }

        .help-header h1 {
          margin: 0;
          font-size: clamp(38px, 4vw, 58px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .help-header p {
          margin: 14px 0 0;
          color: #8ea4d3;
          font-size: 16px;
        }

        .help-quick-grid {
          max-width: 1500px;
          margin: 0 auto 22px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .help-quick-card {
          min-height: 155px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 23px;
          box-sizing: border-box;
          border-radius: 18px;
          background: linear-gradient(
            145deg,
            rgba(20, 48, 93, 0.96),
            rgba(10, 30, 63, 0.96)
          );
          border: 1px solid rgba(112, 145, 210, 0.2);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
        }

        .help-quick-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(104, 72, 245, 0.17);
          color: #9b87ff;
          font-size: 21px;
          font-weight: 800;
        }

        .help-quick-card h2 {
          margin: 1px 0 6px;
          font-size: 17px;
        }

        .help-quick-card p {
          margin: 0;
          color: #8299c8;
          font-size: 12px;
          line-height: 1.55;
        }

        .help-link-button {
          margin-top: 13px;
          padding: 0;
          border: none;
          background: transparent;
          color: #a796ff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .help-link-button:hover {
          color: #ffffff;
        }

        .faq-card {
          max-width: 1500px;
          margin: 0 auto 22px;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(
            145deg,
            rgba(20, 48, 93, 0.96),
            rgba(10, 30, 63, 0.96)
          );
          border: 1px solid rgba(112, 145, 210, 0.2);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.14);
        }

        .faq-header {
          min-height: 88px;
          padding: 20px 25px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid rgba(126, 151, 201, 0.12);
        }

        .faq-header h2 {
          margin: 0;
          font-size: 19px;
        }

        .faq-header p {
          margin: 5px 0 0;
          color: #8299c8;
          font-size: 13px;
        }

        .faq-count {
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(104, 72, 245, 0.12);
          border: 1px solid rgba(130, 107, 255, 0.2);
          color: #a796ff;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
        }

        .faq-item {
          border-bottom: 1px solid rgba(126, 151, 201, 0.1);
        }

        .faq-item:last-child {
          border-bottom: none;
        }

        .faq-item.faq-open {
          background: rgba(104, 72, 245, 0.035);
        }

        .faq-question {
          width: 100%;
          min-height: 66px;
          padding: 18px 25px;
          border: none;
          background: transparent;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          text-align: left;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .faq-question:hover {
          background: rgba(255, 255, 255, 0.015);
        }

        .faq-plus {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(104, 72, 245, 0.13);
          color: #a796ff;
          font-size: 19px;
        }

        .faq-answer {
          padding: 0 65px 20px 25px;
          color: #8ca3d0;
          font-size: 13px;
          line-height: 1.7;
          max-width: 900px;
        }

        .support-card {
          max-width: 1500px;
          margin: 0 auto;
          padding: 25px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 17px;
          border-radius: 20px;
          background:
            linear-gradient(
              135deg,
              rgba(104, 72, 245, 0.18),
              rgba(20, 48, 93, 0.96)
            );
          border: 1px solid rgba(130, 107, 255, 0.25);
        }

        .support-icon {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(104, 72, 245, 0.2);
          color: #a796ff;
          font-size: 22px;
        }

        .support-content {
          flex: 1;
        }

        .support-content h2 {
          margin: 0;
          font-size: 18px;
        }

        .support-content p {
          margin: 6px 0 0;
          color: #8299c8;
          font-size: 12px;
          line-height: 1.5;
        }

        .contact-button {
          flex-shrink: 0;
          padding: 12px 18px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            #7658f6,
            #5a3ed8
          );
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .contact-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(104, 72, 245, 0.25);
        }

        @media (max-width: 950px) {
          .help-page {
            padding: 80px 20px 45px;
          }

          .help-quick-grid {
            grid-template-columns: 1fr;
          }

          .support-card {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .support-content {
            min-width: 200px;
          }
        }

        @media (max-width: 600px) {
          .help-page {
            padding: 78px 15px 35px;
          }

          .help-quick-card {
            padding: 19px;
          }

          .faq-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .faq-question {
            padding: 16px 18px;
          }

          .faq-answer {
            padding: 0 18px 18px;
          }

          .support-card {
            padding: 20px;
          }

          .contact-button {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}

export default Help;