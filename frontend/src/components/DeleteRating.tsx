const DeleteRating: React.FC<{
  closeModal: () => void;
  updateRating: () => void;
  userId: number;
  token: string;
  eventId: number;
}> = ({ closeModal, updateRating, eventId, userId, token }) => {
  const handleDelete = async () => {
    //Remove Rating API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/events/${eventId}/ratings`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to delete rating");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
    }

    updateRating();
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
        <h3 className="text-lg font-medium">
          Are you sure you want to delete this rating?
        </h3>
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

export default DeleteRating;
