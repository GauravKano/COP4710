import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router";

type user = {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  universityId?: number;
  userType?: "super_admin" | "admin" | "user";
};

type Rso = {
  id: number;
  name: string;
  status: "active" | "inactive";
  adminId: number;
};

const RsoDashboard = () => {
  const [userData, setUserData] = useState<user | null>(null);
  const [rsos, setRsos] = useState<Rso[]>([]);
  const navigate = useNavigate();

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
          | "user";
      }
      if (key.trim() === "universityId") {
        cookieObject.universityId = parseInt(value.trim());
      }
    });

    if (!cookieObject || !cookieObject.id || !cookieObject.userType) {
      navigate("/login");
    } else {
      setUserData(cookieObject);
    }
  };

  const getRso = () => {
    // Get Rso for user API here

    setRsos([
      {
        id: 1,
        name: "Tech Innovators",
        status: "active",
        adminId: 1,
      },
      {
        id: 2,
        name: "Green Earth Society",
        status: "active",
        adminId: 102,
      },
      {
        id: 3,
        name: "AI & Machine Learning Club",
        status: "inactive",
        adminId: 103,
      },
      {
        id: 4,
        name: "Photography Enthusiasts",
        status: "active",
        adminId: 104,
      },
      {
        id: 5,
        name: "Esports & Gaming Club",
        status: "inactive",
        adminId: 105,
      },
    ]);
  };

  useEffect(() => {
    getCookieData();

    getRso();
  }, []);

  return (
    <div className="w-full min-h-dvh flex flex-col items-stretch">
      <Navbar loggedIn={true} />
      <div className="flex flex-col py-10 px-12 grow gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold mr-auto">RSO Dashboard</h1>
          <button className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700">
            Join RSO
          </button>
          <button className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700">
            Create RSO
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {rsos.map((rso, index) => (
            <div key={index} className="border rounded-lg shadow-sm py-4 px-6">
              <h2 className="text-lg font-semibold">{rso.name}</h2>
              <p className="text-sm">
                Role:{" "}
                {userData && userData.id === rso.adminId ? "Admin" : "Member"}
              </p>
              <p className="text-sm capitalize">Status: {rso.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RsoDashboard;
