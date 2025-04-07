import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router";
import CreateUniversity from "../components/CreateUniversity";
import PendingEvents from "../components/PendingEvents";

type user = {
  id?: number;
  username?: string;
  email?: string;
  universityId?: number | null;
  userType?: "super_admin" | "admin" | "student";
  token?: string;
};

type University = {
  id: number;
  name: string;
};

const SuperAdminDashboard = () => {
  const [userData, setUserData] = useState<user | null>(null);
  const [universityList, setUniversityList] = useState<University[]>([]);
  const [createUniversity, setCreateUniversity] = useState<boolean>(false);
  const [pendingEvents, setPendingEvents] = useState<boolean>(false);
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
          | "student";
      }
      if (key.trim() === "universityId") {
        const parseId = parseInt(value.trim());
        cookieObject.universityId = isNaN(parseId) ? null : parseId;
      }
      if (key.trim() === "token") {
        cookieObject.token = value.trim();
      }
    });

    if (
      !cookieObject ||
      !cookieObject.id ||
      cookieObject.userType !== "super_admin" ||
      !cookieObject.token
    ) {
      navigate("/login");
    } else {
      setUserData(cookieObject);
      getUniversities(cookieObject);
    }
  };

  const getUniversities = async (cookieObject: user) => {
    try {
      const response = await fetch(
        "http://35.175.224.17:8080/api/universities",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookieObject?.token || ""}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to fetch universities");
      }

      const data = await response.json();
      setUniversityList(data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  useEffect(() => {
    getCookieData();
  }, []);

  return (
    <div className="w-full min-h-dvh flex flex-col items-stretch">
      <Navbar loggedIn={true} />
      <div className="flex flex-col py-10 px-12 grow gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold mr-auto">Super Admin Dashboard</h1>
          <button
            className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => {
              setPendingEvents(true);
            }}
          >
            Pending Events
          </button>
          <button
            className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => setCreateUniversity(true)}
          >
            Create University
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {universityList.length === 0 ? (
            <p className="text-center">No universities found.</p>
          ) : (
            <>
              {universityList.map((university, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-sm py-4 px-6"
                >
                  <h2 className="text-lg font-semibold">{university.name}</h2>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {createUniversity && (
        <CreateUniversity
          token={userData?.token || ""}
          closeModal={() => setCreateUniversity(false)}
          insertUniversity={(newId: number, newUniversityName: string) =>
            setUniversityList((prev) => [
              { id: newId, name: newUniversityName },
              ...prev,
            ])
          }
        />
      )}

      {pendingEvents && (
        <PendingEvents
          token={userData?.token || ""}
          userType={userData?.userType || "super_admin"}
          closeModal={() => setPendingEvents(false)}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
