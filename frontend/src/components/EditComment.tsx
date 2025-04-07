import { useState } from "react";
import ErrorDialog from "./ErrorDialog";

type Comment = {
  content: string;
  id: number;
  name: string;
  user_id: number;
};

const EditComment: React.FC<{
  comment: Comment;
  token: string;
  closeModal: () => void;
  updateComments: (commentId: number, newContent: string) => void;
}> = ({ comment, closeModal, updateComments, token }) => {
  const [commentContent, setCommentContent] = useState<string>(comment.content);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateComment = async () => {
    if (!commentContent.trim()) {
      setError("Comment content cannot be empty.");
      return;
    }
    //Update Comment API call here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/comments/${comment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: commentContent.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to edit comment");
      }

      updateComments(comment.id, commentContent.trim());
      closeModal();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to edit comment"
      );
      console.error("Error editing comment:", error);
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
      <div className="bg-white py-10 px-12 rounded-lg max-w-lg w-full my-auto flex flex-col gap-4">
        <h3 className="text-lg font-medium">Edit Comment</h3>
        {error && (
          <ErrorDialog errorMessage={error} setErrorMessage={setError} />
        )}
        <textarea
          placeholder="Edit your comment here"
          rows={4}
          className="w-full px-3 py-1.5 border rounded-md"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
        <div className="flex justify-end items-center gap-4 mt-2">
          <button
            className="bg-gray-600 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-green-900"
            onClick={handleUpdateComment}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditComment;
