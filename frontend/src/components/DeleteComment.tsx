import { useState } from "react";
import ErrorDialog from "./ErrorDialog";

type Comment = {
  content: string;
  id: number;
  name: string;
  user_id: number;
};

const DeleteComment: React.FC<{
  comment: Comment;
  token: string;
  closeModal: () => void;
  updateComments: (commentId: number) => void;
}> = ({ comment, closeModal, updateComments, token }) => {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    //Delete Comment API call here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/comments/${comment.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to delete comment");
      }

      updateComments(comment.id);
      closeModal();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
      console.error("Error deleting comment:", error);
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
        <h3 className="text-lg font-medium">
          Are you sure you want to delete this comment?
        </h3>
        <div className="border rounded-lg py-2.5 px-4 mx-2 flex items-center gap-2">
          <div className="grow mr-2">
            <p className="font-semibold text-sm">{comment.name}</p>
            <p className="text-sm">{comment.content}</p>
          </div>
        </div>

        {error && (
          <ErrorDialog errorMessage={error} setErrorMessage={setError} />
        )}

        <div className="flex justify-end items-center gap-4 mt-2">
          <button
            className="bg-gray-600 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-red-700 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-red-900"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteComment;
