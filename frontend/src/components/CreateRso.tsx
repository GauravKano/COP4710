import { useEffect, useState } from "react";
import ErrorDialog from "./ErrorDialog";
import { FaTrash } from "react-icons/fa6";

const CreateRso: React.FC<{
  closeModal: () => void;
  userEmail: string;
  userId: number;
  userType: "super_admin" | "admin" | "student";
  updateRso: (newRso: {
    id: number;
    name: string;
    status: "active" | "inactive";
    adminId: number;
  }) => void;
  universityId: number | null;
  token: string;
}> = ({
  closeModal,
  userEmail,
  userType,
  userId,
  token,
  universityId,
  updateRso,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [rsoName, setRsoName] = useState<string>("");
  const [memberEmails, setMemberEmails] = useState<string[]>([""]);

  useEffect(() => {
    if (universityId === null) {
      closeModal();
    }
  }, []);

  const handleCreateRso = async () => {
    if (!rsoName.trim()) {
      setError("RSO name cannot be empty.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (let i = 0; i < memberEmails.length; i++) {
      const email = memberEmails[i].trim();
      if (!email.trim()) {
        setError(`Member ${i + 1} email cannot be empty.`);
        return;
      }

      if (!emailRegex.test(email)) {
        setError(`Invalid Email for Member ${i + 1}.`);
        return;
      }

      if (userEmail.split("@")[1] !== email.split("@")[1]) {
        setError(`Invalid Email Domain for Member ${i + 1}.`);
        return;
      }
    }

    // Create RSO API here
    try {
      const response = await fetch(`http://35.175.224.17:8080/api/rsos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: rsoName.trim(),
          university_id: universityId,
          member_emails: memberEmails.map((email) => email.trim()),
          user: {
            id: userId,
            user_type: userType,
          },
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to create rso");
      }

      const data = await response.json();
      updateRso({
        id: data.rso_id,
        name: rsoName.trim(),
        adminId: userId,
        status: data.member_count >= 5 ? "active" : "inactive",
      });

      closeModal();
    } catch (error) {
      setError("Failed to create RSO");
      console.error("Error creating RSO:", error);
      return;
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
      <div className="bg-white py-10 px-12 rounded-lg max-w-2xl w-full my-auto flex flex-col gap-4">
        <h3 className="text-lg font-medium">Create RSO</h3>

        {error && (
          <ErrorDialog errorMessage={error} setErrorMessage={setError} />
        )}

        <div className="flex flex-col gap-6 px-10">
          <div className="flex gap-4 items-center">
            <p className="text-nowrap">RSO Name: </p>
            <input
              placeholder="Enter RSO name here"
              value={rsoName}
              onChange={(e) => setRsoName(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>

          {memberEmails.map((email, index) => (
            <div key={index} className="flex gap-4 items-center">
              <p className="text-nowrap">Member Email {index + 1}: </p>
              <input
                placeholder={`Enter member ${index + 1} email here`}
                value={email}
                onChange={(e) => {
                  const newEmails = [...memberEmails];
                  newEmails[index] = e.target.value;
                  setMemberEmails(newEmails);
                }}
                className="w-full px-3 py-1.5 border rounded-md"
              />
              <button
                className="text-sm text-red-600 hover:text-red-800 hover:bg-gray-100 cursor-pointer p-1.5"
                onClick={() => {
                  const newEmails = memberEmails.filter(
                    (email, i) => i !== index
                  );
                  setMemberEmails(newEmails);
                  if (newEmails.length === 0) {
                    newEmails.push("");
                  }
                }}
              >
                <FaTrash className="w-[18px] h-[18px]" />
              </button>
            </div>
          ))}

          <button
            className="w-fit mx-auto text-sm px-5 py-2 rounded-xl cursor-pointer hover:bg-gray-200 mt-[-12px]"
            onClick={() => {
              setMemberEmails((prev) => [...prev, ""]);
            }}
          >
            + Add Member
          </button>
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
            onClick={handleCreateRso}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRso;
