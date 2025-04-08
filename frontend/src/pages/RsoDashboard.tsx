import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router";
import JoinRso from "../components/JoinRso";
import CreateRso from "../components/CreateRso";

type user = {
  id?: number;
  username?: string;
  email?: string;
  universityId?: number | null;
  userType?: "super_admin" | "admin" | "student";
  token?: string;
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
  const [joinRSO, setJoinRSO] = useState<boolean>(false);
  const [createRSO, setCreateRSO] = useState<boolean>(false);

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
      !cookieObject.userType ||
      !cookieObject.token
    ) {
      navigate("/login");
    } else {
      setUserData(cookieObject);
      getRso(cookieObject);
    }
  };

  const getRso = async (cookieObject: user) => {
    // Get Rso for user API here
    try {
      const response = await fetch(`http://35.175.224.17:8080/api/user/rsos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookieObject?.token || ""}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to get rsos for user");
      }

      const data = await response.json();
      setRsos(
        data.map(
          (rso: {
            id: number;
            name: string;
            status: string;
            admin: { id: number; username: string };
            [key: string]: unknown;
          }) => {
            return {
              id: rso.id,
              name: rso.name,
              status: rso.status.toLowerCase() as "active" | "inactive",
              adminId: rso.admin.id,
            };
          }
        )
      );
    } catch (error) {
      console.error("Error fetching RSOs:", error);
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
          <h1 className="text-2xl font-bold mr-auto">RSO Dashboard</h1>
          <button
            className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => setJoinRSO(true)}
          >
            Join RSO
          </button>
          <button
            className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => setCreateRSO(true)}
          >
            Create RSO
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {rsos.length === 0 ? (
            <p className="text-center">No RSOs found.</p>
          ) : (
            <>
              {rsos.map((rso, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-sm py-4 px-6"
                >
                  <h2 className="text-lg font-semibold">{rso.name}</h2>
                  <p className="text-sm">
                    Role:{" "}
                    {userData && userData.id === rso.adminId
                      ? "Admin"
                      : "Member"}
                  </p>
                  <p className="text-sm capitalize">Status: {rso.status}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {joinRSO && (
        <JoinRso
          userId={userData?.id || 0}
          universityId={userData?.universityId || null}
          token={userData?.token || ""}
          closeModal={() => setJoinRSO(false)}
          updateRsos={(newRso: Rso) => {
            setRsos((prev) => [newRso, ...prev]);
          }}
        />
      )}

      {createRSO && (
        <CreateRso
          closeModal={() => setCreateRSO(false)}
          userEmail={userData?.email || ""}
          userId={userData?.id || 0}
          userType={userData?.userType || "student"}
          universityId={userData?.universityId || null}
          token={userData?.token || ""}
          updateRso={(newRso: Rso) => {
            setRsos((prev) => [newRso, ...prev]);
          }}
        />
      )}
    </div>
  );
};

export default RsoDashboard;
