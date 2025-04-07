import { useState } from "react";
import ErrorDialog from "./ErrorDialog";

const CreateUniversity: React.FC<{
  closeModal: () => void;
  insertUniversity: (newId: number, newUniversityName: string) => void;
  token: string;
}> = ({ closeModal, insertUniversity, token }) => {
  const [error, setError] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string>("");

  const handleCreateUniversity = async () => {
    if (!universityName.trim()) {
      setError("University name cannot be empty.");
      return;
    }

    // const universityId = Add University API here
    try {
      const response = await fetch(
        "http://35.175.224.17:8080/api/universities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: universityName.trim() }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.message || "Failed to create universities"
        );
      }

      const data = await response.json();
      insertUniversity(data.university.id, universityName.trim());
      closeModal();
    } catch (error) {
      console.error("Error creating universities:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create universities"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 flex justify-center items-center overflow-y-auto z-50 h-dvh p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="bg-white py-10 px-12 rounded-lg max-w-xl w-full my-auto flex flex-col gap-4">
        <h3 className="text-lg font-medium">Create University</h3>
        {error && (
          <ErrorDialog errorMessage={error} setErrorMessage={setError} />
        )}
        <div className="flex gap-4 items-center px-8">
          <p className="text-nowrap">University Name: </p>
          <input
            placeholder="Enter university name here"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            className="w-full px-3 py-1.5 border rounded-md"
          />
        </div>
        <div className="flex justify-end items-center gap-4 mt-2">
          <button
            className="bg-gray-600 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-green-900"
            onClick={handleCreateUniversity}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUniversity;
