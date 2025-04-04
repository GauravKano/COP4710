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
}> = ({ closeModal, updateRsos }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedRso, setSelectedRso] = useState<RSO | null>(null);
  const [rsoList, setRsoList] = useState<RSO[]>([]);

  useEffect(() => {
    // Get Rso user is not part of API here

    setRsoList([
      { id: 1, name: "Tech Club", status: "active", adminId: 1 },
      { id: 2, name: "Art Society", status: "inactive", adminId: 2 },
      { id: 3, name: "Entrepreneurs Network", status: "active", adminId: 3 },
      { id: 4, name: "Gaming Club", status: "active", adminId: 4 },
      { id: 5, name: "Music Enthusiasts", status: "inactive", adminId: 5 },
    ]);
  }, []);

  const handleJoinRso = () => {
    if (!selectedRso) {
      setError("Please select an RSO to join.");
      return;
    }

    // Join Rso API here
    updateRsos(selectedRso);
    closeModal();
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
