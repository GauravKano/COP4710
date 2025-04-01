import Navbar from "../components/Navbar";
import { useState } from "react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="w-full min-h-dvh flex flex-col items-stretch">
      <Navbar />

      <div className="flex justify-center items-center grow">
        <div className="w-full max-w-[400px] flex flex-col items-center gap-6 mx-5 px-14 py-12 border rounded-xl">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-1.5 border rounded-md"
          />
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="UserName"
            className="w-full px-3 py-1.5 border rounded-md"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-3 py-1.5 border rounded-md"
          />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Confirm Password"
            className="w-full px-3 py-1.5 border rounded-md"
          />

          <button className="w-full px-2 py-1.5 bg-gray-200 border rounded-md text-center cursor-pointer">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
