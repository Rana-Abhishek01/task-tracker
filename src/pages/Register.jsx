import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const form = e.target;

    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    const user = {
      name,
      email,
      password,
    };

    localStorage.setItem("taskTrackerUser", JSON.stringify(user));

    alert("Account created successfully!");

    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Create Account</h1>

        <p className="subtitle">
          Join Task Tracker today
        </p>

        <form onSubmit={handleRegister}>

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
          />

          <button type="submit">
            Create Account
          </button>

        </form>

        <p className="auth-link">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>

      </div>
    </div>
  );
}

export default Register;