import { useEffect, useState } from "react";
import { FaPencil, FaRegTrashCan, FaStar, FaXmark } from "react-icons/fa6";
import DeleteComment from "./DeleteComment";
import EditComment from "./EditComment";
import AddComment from "./AddComment";
import DeleteRating from "./DeleteRating";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

type Comment = {
  content: string;
  id: number;
  name: string;
  user_id: number;
  [key: string]: string | number | null;
};

type Event = {
  id: number;
  name: string;
  description: string | null;
  date_time: string;
  location_name: string;
  latitude: number;
  longitude: number;
  contactPhone: string | null;
  contactEmail: string | null;
  event_type: "public" | "private" | "rso";
  ratings: number | null;
  comments: Comment[];
  university_name: string | null;
  rso_name: string | null;
  [key: string]: string | number | null | boolean | Comment[];
};

type Rating = {
  rating: number;
  id: number;
};

const EventModal: React.FC<{
  event: Event;
  closeModal: () => void;
  userId: number;
  setEvent: React.Dispatch<React.SetStateAction<Event | null>>;
  username: string;
  token: string;
}> = ({ event, userId, setEvent, closeModal, username, token }) => {
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [deleteRating, setDeleteRating] = useState<boolean>(false);
  const [deleteComment, setDeleteComment] = useState<Comment | null>(null);
  const [editComment, setEditComment] = useState<Comment | null>(null);
  const [addComment, setAddComment] = useState<boolean>(false);

  useEffect(() => {
    //Get users Rating API goes here
    handleGetMyRating();
  }, []);

  const handleGetMyRating = async () => {
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/events/${event.id}/userrating`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to get user's rating");
      }

      const data = await response.json();
      setMyRating(data.rating);
    } catch (error) {
      console.error("Error fetching user rating:", error);
    }
  };

  const handleAddRating = async (index: number) => {
    // const ratingId = Add Rating API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/events/${event.id}/ratings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: index + 1,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to add rating");
      }

      const data = await response.json();
      setMyRating({
        id: data.rating_id,
        rating: index + 1,
      });
    } catch (error) {
      console.error("Error adding rating:", error);
    }
  };

  const handleUpdateRating = async (index: number) => {
    // Update Rating API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/events/${event.id}/ratings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: index + 1,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to update rating");
      }

      setMyRating((prev) => {
        return { id: prev!.id, rating: index + 1 };
      });
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 flex justify-center items-center overflow-y-auto z-20 h-dvh p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="bg-white pt-10 pb-12 px-12 rounded-lg max-w-2xl w-full flex flex-col gap-1 relative my-auto">
        <button
          className="absolute top-5 right-5 p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer rounded-md"
          onClick={closeModal}
          title="Close Modal"
        >
          <FaXmark className="text-xl" />
        </button>
        <h2 className="text-xl font-semibold">{event.name}</h2>
        <p className="text-sm">Date and Time: {event.date_time}</p>
        <p className="text-sm">
          Type:{" "}
          <span
            className={`${
              event.event_type === "rso" ? "uppercase" : "capitalize"
            }`}
          >
            {event.event_type}
          </span>
        </p>
        {event.event_type === "private" && (
          <p className="text-sm">University Name: {event.university_name}</p>
        )}
        {event.event_type === "rso" && (
          <p className="text-sm">RSO Name: {event.rso_name}</p>
        )}
        {event.ratings && <p className="text-sm">Ratings: {event.ratings}</p>}
        {event.contactPhone && (
          <p className="text-sm">Contact Phone Number: {event.contactPhone}</p>
        )}
        {event.contactEmail && (
          <p className="text-sm">Contact Email: {event.contactEmail}</p>
        )}
        {event.description && (
          <p className="text-sm">Description: {event.description}</p>
        )}
        <p className="text-sm">Location: {event.location_name}</p>
        <MapContainer
          className="mt-2"
          center={[event.latitude, event.longitude]}
          zoom={13}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[event.latitude, event.longitude]}></Marker>
        </MapContainer>

        <div className="flex flex-col mt-4 gap-3 my-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-medium">My Rating:</h3>
            <button
              className="bg-gray-600 text-white px-3.5 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-700"
              onClick={() => {
                if (myRating) {
                  setDeleteRating(true);
                }
              }}
            >
              Remove
            </button>
          </div>
          <div className="flex justify-center items-center gap-3.5">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`cursor-pointer text-2xl ${
                  myRating && index < myRating.rating
                    ? "text-yellow-500"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => {
                  if (!myRating) {
                    handleAddRating(index);
                  } else if (myRating.rating !== index + 1) {
                    handleUpdateRating(index);
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col my-3 gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-medium">Comments:</h3>
            <button
              className="bg-gray-600 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-gray-700"
              onClick={() => setAddComment(true)}
            >
              Add
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
            {event.comments && event.comments.length > 0 ? (
              event.comments.map((comment, index) => (
                <div
                  key={index}
                  className="border rounded-lg py-2.5 px-4 mx-2 flex items-center gap-2"
                >
                  <div className="grow mr-2">
                    <p className="font-semibold">{comment.name}</p>
                    <p>{comment.content}</p>
                  </div>
                  {userId === comment.user_id && (
                    <>
                      <button
                        className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                        title="Edit Comment"
                        onClick={() => setEditComment(comment)}
                      >
                        <FaPencil />
                      </button>
                      <button
                        className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                        title="Delete Comment"
                        onClick={() => setDeleteComment(comment)}
                      >
                        <FaRegTrashCan />
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center">No comments yet.</p>
            )}
          </div>
        </div>
      </div>

      {deleteRating && (
        <DeleteRating
          closeModal={() => setDeleteRating(false)}
          updateRating={() => setMyRating(null)}
          token={token}
          eventId={event.id}
          userId={userId}
        />
      )}

      {deleteComment && (
        <DeleteComment
          comment={deleteComment}
          token={token}
          closeModal={() => setDeleteComment(null)}
          updateComments={(commentId: number) => {
            setEvent((prev) => {
              if (!prev) {
                return prev;
              }

              const updatedComments = prev.comments.filter(
                (comment) => comment.id !== commentId
              );

              return {
                ...prev,
                comments: updatedComments,
              };
            });
          }}
        />
      )}

      {editComment && (
        <EditComment
          comment={editComment}
          token={token}
          closeModal={() => setEditComment(null)}
          updateComments={(commentId: number, newContent: string) => {
            setEvent((prev) => {
              if (!prev) {
                return prev;
              }

              const updatedComments = prev.comments.map((comment) => {
                if (comment.id === commentId) {
                  return { ...comment, content: newContent };
                }
                return comment;
              });

              return {
                ...prev,
                comments: updatedComments,
              };
            });
          }}
        />
      )}

      {addComment && (
        <AddComment
          closeModal={() => setAddComment(false)}
          userId={userId}
          eventId={event.id}
          token={token}
          updateComments={(commentId: number, newContent: string) => {
            setEvent((prev) => {
              if (!prev) {
                return prev;
              }

              const newComment: Comment = {
                id: commentId,
                content: newContent,
                name: username,
                user_id: userId,
              };

              return {
                ...prev,
                comments: [newComment, ...prev.comments],
              };
            });
          }}
        />
      )}
    </div>
  );
};

export default EventModal;
