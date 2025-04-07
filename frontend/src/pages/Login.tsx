import { Link, useNavigate } from "react-router";
import ErrorDialog from "../components/ErrorDialog";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

type user = {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  universityId?: number;
  userType?: "super_admin" | "admin" | "student";
  token?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getCookieData = () => {
    const cookies = document.cookie.split("; ");
    const cookieObject: user = {};

    cookies.forEach((cookie) => {
      const [key, value] = cookie.split("=");
      if (key.trim() === "userId") {
        cookieObject.id = parseInt(value.trim());
      }
      if (key.trim() === "userEmail") {
        cookieObject.email = value.trim();
      }
      if (key.trim() === "username") {
        cookieObject.username = value.trim();
      }
      if (key.trim() === "userType") {
        cookieObject.userType = value.trim() as
          | "super_admin"
          | "admin"
          | "student";
      }
      if (key.trim() === "universityId") {
        cookieObject.universityId = parseInt(value.trim());
      }
      if (key.trim() === "token") {
        cookieObject.token = value.trim();
      }
    });

    if (
      cookieObject &&
      cookieObject.id &&
      cookieObject.userType &&
      cookieObject.token
    ) {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    getCookieData();
  }, []);

  const handleLogin = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email.trim()) {
      setError("Enter an email");
    } else if (emailRegex.test(email) === false) {
      setError("Enter a valid email address");
    } else if (!password.trim()) {
      setError("Please enter a password");
    } else {
      //Login API here
      try {
        const response = await fetch("http://35.175.224.17:8080/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(errorMessage.message || "Failed to login user");
        }

        const data = await response.json();
        const userData = data.user;

        document.cookie = `userId=${userData.id}; path=/`;
        document.cookie = `userEmail=${userData.email}; path=/`;
        document.cookie = `username=${userData.username}; path=/`;
        document.cookie = `userType=${userData.user_type}; path=/`;
        document.cookie = `universityId=${userData.university_id}; path=/`;
        document.cookie = `token=${data.token}; path=/`;

        navigate("/dashboard");
      } catch (error) {
        console.error("Error during login:", error);
        setError(error instanceof Error ? error.message : "Failed to login");
        return;
      }
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
