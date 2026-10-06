import { useState } from "react";
import Layout from "../components/layout/Layout";

function Profile() {
  const [name, setName] = useState("Abhishek Rana");
  const [email, setEmail] = useState("abhishek@test.com");
  const [role] = useState("Administrator");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <div>
            <div className="profile-eyebrow">ACCOUNT</div>
            <h1>Profile</h1>
            <p>Manage your personal information and account details.</p>
          </div>
        </div>

        <div className="profile-grid">
          {/* Profile Card */}
          <section className="profile-card profile-main-card">
            <div className="profile-cover">
              <div className="profile-avatar">
                AR
              </div>
            </div>

            <div className="profile-main-content">
              <h2>{name || "Your Name"}</h2>
              <p>{email}</p>

              <div className="profile-role">
                <span className="role-dot" />
                {role}
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-stats">
              <div>
                <strong>24</strong>
                <span>Total Tasks</span>
              </div>

              <div>
                <strong>16</strong>
                <span>Completed</span>
              </div>

              <div>
                <strong>67%</strong>
                <span>Completion</span>
              </div>
            </div>
          </section>

          {/* Personal Information */}
          <section className="profile-card">
            <div className="profile-section-heading">
              <div className="profile-section-icon">◉</div>

              <div>
                <h2>Personal Information</h2>
                <p>Update your basic account information.</p>
              </div>
            </div>

            <div className="profile-form">
              <div className="profile-field">
                <label htmlFor="profile-name">Full Name</label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">Email Address</label>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-role">Account Role</label>

                <input
                  id="profile-role"
                  type="text"
                  value={role}
                  disabled
                />
              </div>

              <button
                type="button"
                className="profile-save-button"
                onClick={handleSave}
              >
                Save Changes
              </button>

              {saved && (
                <div className="profile-success">
                  ✓ Profile changes saved successfully.
                </div>
              )}
            </div>
          </section>

          {/* Account Information */}
          <section className="profile-card profile-full-card">
            <div className="profile-section-heading">
              <div className="profile-section-icon">▣</div>

              <div>
                <h2>Account Information</h2>
                <p>Details about your Task Tracker account.</p>
              </div>
            </div>

            <div className="account-info-grid">
              <div className="account-info-item">
                <span>Account Status</span>
                <strong className="active-status">Active</strong>
              </div>

              <div className="account-info-item">
                <span>Member Since</span>
                <strong>October 2026</strong>
              </div>

              <div className="account-info-item">
                <span>Account Type</span>
                <strong>{role}</strong>
              </div>

              <div className="account-info-item">
                <span>Last Activity</span>
                <strong>Today</strong>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .profile-page {
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

        .profile-header {
          max-width: 1500px;
          margin: 0 auto 30px;
        }

        .profile-eyebrow {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #927cff;
          margin-bottom: 8px;
        }

        .profile-header h1 {
          margin: 0;
          font-size: clamp(38px, 4vw, 58px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .profile-header p {
          margin: 14px 0 0;
          color: #8ea4d3;
          font-size: 16px;
        }

        .profile-grid {
          max-width: 1500px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(300px, 0.85fr) minmax(0, 1.15fr);
          gap: 22px;
        }

        .profile-card {
          background: linear-gradient(
            145deg,
            rgba(20, 48, 93, 0.96),
            rgba(10, 30, 63, 0.96)
          );
          border: 1px solid rgba(112, 145, 210, 0.2);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
          overflow: hidden;
        }

        .profile-main-card {
          padding: 0;
        }

        .profile-cover {
          height: 135px;
          background:
            radial-gradient(
              circle at 25% 30%,
              rgba(129, 103, 255, 0.35),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #182e62,
              #39227e
            );
          position: relative;
        }

        .profile-avatar {
          position: absolute;
          left: 28px;
          bottom: -38px;
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #7957ff,
            #4e36c7
          );
          border: 5px solid #10274e;
          color: #ffffff;
          font-size: 25px;
          font-weight: 800;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        }

        .profile-main-content {
          padding: 55px 28px 25px;
        }

        .profile-main-content h2 {
          margin: 0;
          font-size: 25px;
        }

        .profile-main-content p {
          margin: 7px 0 14px;
          color: #8ea4d3;
          font-size: 14px;
        }

        .profile-role {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(104, 72, 245, 0.13);
          border: 1px solid rgba(130, 107, 255, 0.2);
          color: #a997ff;
          font-size: 12px;
          font-weight: 700;
        }

        .role-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #927cff;
        }

        .profile-divider {
          height: 1px;
          background: rgba(126, 151, 201, 0.12);
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding: 22px 18px;
        }

        .profile-stats div {
          text-align: center;
          border-right: 1px solid rgba(126, 151, 201, 0.12);
        }

        .profile-stats div:last-child {
          border-right: none;
        }

        .profile-stats strong {
          display: block;
          font-size: 21px;
        }

        .profile-stats span {
          display: block;
          margin-top: 5px;
          color: #8198c5;
          font-size: 11px;
        }

        .profile-section-heading {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 25px;
        }

        .profile-section-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(104, 72, 245, 0.17);
          color: #9b87ff;
          font-size: 20px;
          font-weight: 700;
        }

        .profile-section-heading h2 {
          margin: 0;
          font-size: 19px;
        }

        .profile-section-heading p {
          margin: 5px 0 0;
          color: #8299c8;
          font-size: 13px;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .profile-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .profile-field input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          border-radius: 11px;
          border: 1px solid rgba(127, 153, 210, 0.24);
          background: #0c2043;
          color: #ffffff;
          outline: none;
          font-size: 14px;
          transition: 0.2s ease;
        }

        .profile-field input:focus {
          border-color: #7658f6;
          box-shadow: 0 0 0 3px rgba(118, 88, 246, 0.1);
        }

        .profile-field input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .profile-save-button {
          margin-top: 5px;
          width: 100%;
          padding: 13px 16px;
          border: none;
          border-radius: 11px;
          background: linear-gradient(
            135deg,
            #7658f6,
            #5a3ed8
          );
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .profile-save-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(104, 72, 245, 0.25);
        }

        .profile-success {
          padding: 11px 13px;
          border-radius: 10px;
          background: rgba(37, 211, 157, 0.1);
          border: 1px solid rgba(37, 211, 157, 0.2);
          color: #35dba5;
          font-size: 12px;
          font-weight: 700;
        }

        .profile-full-card {
          grid-column: 1 / -1;
        }

        .account-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .account-info-item {
          padding: 18px;
          border-radius: 14px;
          background: rgba(8, 25, 53, 0.55);
          border: 1px solid rgba(126, 151, 201, 0.1);
        }

        .account-info-item span {
          display: block;
          color: #8198c5;
          font-size: 11px;
          margin-bottom: 7px;
        }

        .account-info-item strong {
          font-size: 14px;
        }

        .active-status {
          color: #31dca5 !important;
        }

        @media (max-width: 950px) {
          .profile-page {
            padding: 80px 20px 45px;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-full-card {
            grid-column: auto;
          }

          .account-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 560px) {
          .profile-page {
            padding: 78px 15px 35px;
          }

          .profile-card {
            padding: 20px;
          }

          .profile-main-card {
            padding: 0;
          }

          .account-info-grid {
            grid-template-columns: 1fr;
          }

          .profile-stats {
            padding: 18px 10px;
          }

          .profile-stats strong {
            font-size: 18px;
          }
        }
      `}</style>
    </Layout>
  );
}

export default Profile;