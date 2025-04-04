import { useState } from "react";
import ErrorDialog from "./ErrorDialog";

const AddComment: React.FC<{
  closeModal: () => void;
  updateComments: (commentId: number, newContent: string) => void;
  userId: number;
  eventId: number;
}> = ({ closeModal, updateComments }) => {
  const [commentContent, setCommentContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!commentContent.trim()) {
      setError("Comment content cannot be empty.");
      return;
    }

    //const commentId = Add Comment API here
    updateComments(0, commentContent.trim());
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
        <h3 className="text-lg font-medium">Add Comment</h3>
        {error && (
          <ErrorDialog errorMessage={error} setErrorMessage={setError} />
        )}
        <textarea
          placeholder="Add your comment here"
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
            onClick={handleAddComment}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddComment;
