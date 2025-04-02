const DeleteRating: React.FC<{
  closeModal: () => void;
  updateRating: () => void;
}> = ({ closeModal, updateRating }) => {
  const handleDelete = () => {
    //Remove Rating API here

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
