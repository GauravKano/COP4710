import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import ErrorDialog from "../components/ErrorDialog";
import { Link, useNavigate } from "react-router";

type University = {
  name: string;
  id: number;
};

const Register = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [universityOptions, setUniversityOptions] = useState<University[]>([]);

  useEffect(() => {
    // Get all universities API here

    setUniversityOptions([
      { name: "University of Florida", id: 1 },
      { name: "University of Central Florida", id: 2 },
      { name: "Florida State University", id: 3 },
    ]);
  }, []);

  const handleRegister = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!selectedUniversity) {
      setError("Please select a university");
    } else if (!userName.trim()) {
      setError("Please enter a username");
    } else if (!email.trim()) {
      setError("Enter an email");
    } else if (emailRegex.test(email) === false) {
      setError("Enter a valid email address");
    } else if (!password.trim()) {
      setError("Please enter a password");
    } else if (!confirmPassword.trim()) {
      setError("Please confirm your password");
    } else if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      //Register API here

      navigate("/login");
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
          <select
            className="w-full px-3 py-1.5 border rounded-md"
            value={selectedUniversity ? selectedUniversity.id : ""}
            onChange={(e) => {
              const selectedObject = universityOptions.find(
                (university) => university.id.toString() === e.target.value
              );
              setSelectedUniversity(selectedObject || null);
            }}
          >
            <option value="" disabled>
              Select University
            </option>
            {universityOptions.map((university) => (
              <option key={university.id} value={university.id}>
                {university.name}
              </option>
            ))}
          </select>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="UserName"
            className="w-full px-3 py-1.5 border rounded-md"
          />
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
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Confirm Password"
            className="w-full px-3 py-1.5 border rounded-md"
          />
          <button
            className="w-full px-2 py-1.5 bg-gray-200 border rounded-md text-center cursor-pointer"
            onClick={handleRegister}
          >
            Register
          </button>
          <span className="text-sm mt-[-8px]">
            Already have an account? <Link to="/login">Click Here</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
