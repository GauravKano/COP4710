import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router";
import CreateUniversity from "../components/CreateUniversity";
import PendingEvents from "../components/PendingEvents";

type user = {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  universityId?: number;
  userType?: "super_admin" | "admin" | "student";
};

type University = {
  id: number;
  name: string;
};

const SuperAdminDashboard = () => {
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
        cookieObject.universityId = parseInt(value.trim());
      }
    });

    if (
      !cookieObject ||
      !cookieObject.id ||
      cookieObject.userType !== "super_admin"
    ) {
      navigate("/login");
    } else {
      console.log(cookieObject);
    }
  };

  const getUniversities = () => {
    // Get universities API here

    setUniversityList([
      { id: 1, name: "University A" },
      { id: 2, name: "University B" },
      { id: 3, name: "University C" },
    ]);
  };

  useEffect(() => {
    getCookieData();

    getUniversities();
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
        <PendingEvents closeModal={() => setPendingEvents(false)} />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
