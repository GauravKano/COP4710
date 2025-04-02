import { Link, useNavigate } from "react-router";
import ErrorDialog from "../components/ErrorDialog";
import Navbar from "../components/Navbar";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email.trim()) {
      setError("Enter an email");
    } else if (emailRegex.test(email) === false) {
      setError("Enter a valid email address");
    } else if (!password.trim()) {
      setError("Please enter a password");
    } else {
      //Login API here

      document.cookie = `userId=1; path=/`;
      document.cookie = `userEmail=${email}; path=/`;
      document.cookie = `username=John Doe; path=/`;
      document.cookie = `userType=super_admin; path=/`;
      document.cookie = `universityId=1; path=/`;

      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full min-h-dvh flex flex-col items-stretch">
      <Navbar loggedIn={false} />

      <div className="flex justify-center items-center grow py-10">
        <div className="w-full max-w-[400px] flex flex-col items-center gap-6 mx-5 px-14 py-12 border rounded-xl">
          {error && (
            <ErrorDialog errorMessage={error} setErrorMessage={setError} />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-1.5 border rounded-md"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-3 py-1.5 border rounded-md"
          />
          <button
            className="w-full px-2 py-1.5 bg-gray-200 border rounded-md text-center cursor-pointer"
            onClick={handleLogin}
          >
            Login
          </button>
          <span className="text-sm mt-[-8px]">
            Don't have an account? <Link to="/register">Click Here</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
