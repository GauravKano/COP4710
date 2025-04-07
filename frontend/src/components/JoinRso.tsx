import { useEffect, useState } from "react";
import ErrorDialog from "./ErrorDialog";

type RSO = {
  id: number;
  name: string;
  status: "active" | "inactive";
  adminId: number;
};

const JoinRso: React.FC<{
  closeModal: () => void;
  updateRsos: (newRso: RSO) => void;
  userId: number;
  universityId: number;
  token: string;
}> = ({ closeModal, updateRsos, userId, universityId, token }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedRso, setSelectedRso] = useState<RSO | null>(null);
  const [rsoList, setRsoList] = useState<RSO[]>([]);

  useEffect(() => {
    // Get Rso user is not part of API here
    getRsoNonMembers();
  }, []);

  const getRsoNonMembers = async () => {
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/user/rsos/notmember`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: {
              id: userId,
              university_id: universityId,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to get rsos for user");
      }

      const data = await response.json();
      setRsoList(
        data.map(
          (rso: {
            id: number;
            name: string;
            status: string;
            admin: { id: number; username: string };
            [key: string]: unknown;
          }) => ({
            id: rso.id,
            name: rso.name,
            status: rso.status.toLowerCase() as "active" | "inactive",
            adminId: rso.admin.id,
          })
        )
      );
    } catch (error) {
      setError("Failed to fetch RSOs");
      console.error("Error fetching RSOs:", error);
    }
  };

  const handleJoinRso = async () => {
    if (!selectedRso) {
      setError("Please select an RSO to join.");
      return;
    }

    // Join Rso API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/rsos/${selectedRso.id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: {
              id: userId,
              university_id: universityId,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to join RSO");
      }

      const data = await response.json();
      console.log("Successfully joined RSO:", data);

      updateRsos(selectedRso);
      closeModal();
    } catch (error) {
      setError("Failed to join RSO. Please try again later.");
      console.error("Error joining RSO:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 flex justify-center items-center overflow-y-hidden z-50 h-dvh p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="bg-white py-10 px-12 rounded-lg max-w-lg w-full overflow-y-auto max-h-full flex flex-col gap-4">
        <h3 className="text-lg font-medium">Join RSO</h3>
        {error && (
          <ErrorDialog errorMessage={error} setErrorMessage={setError} />
        )}
        <select
          className="w-full px-3 py-1.5 border rounded-md"
          value={selectedRso ? selectedRso.id : ""}
          onChange={(e) => {
            const rsoMatch = rsoList.find(
              (rso) => rso.id.toString() === e.target.value
            );
            setSelectedRso(rsoMatch || null);
          }}
        >
          <option value="" disabled>
            Select RSO to Join
          </option>
          {rsoList.map((rso) => (
            <option key={rso.id} value={rso.id}>
              {rso.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end items-center gap-4 mt-2">
          <button
            className="bg-gray-600 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-green-900"
            onClick={handleJoinRso}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRso;
