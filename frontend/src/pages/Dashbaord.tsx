import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  description?: string;
  ratings?: number;
  contactPhone?: string;
  contactEmail?: string;
  type: "RSO" | "Private" | "Public";
  comments?: Comment[];
}

interface Comment {
  comment: string;
  commentId: number;
  name: string;
}

type user = {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  universityId?: number;
  userType?: "super_admin" | "admin" | "user";
};

const Dashbaord = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [userData, setUserData] = useState<user | null>(null);

  const getCookieData = () => {
    const cookies = document.cookie.split("; ");
    const cookieObject: user = {};

    cookies.forEach((cookie) => {
      const [key, value] = cookie.split("=");
      if (key.trim() === "userId") {
        cookieObject.id = parseInt(value.trim());
      }
      if (key.trim() === "userEmail") {
        cookieObject.email = value.trim();
      }
      if (key.trim() === "username") {
        cookieObject.username = value.trim();
      }
      if (key.trim() === "userType") {
        cookieObject.userType = value.trim() as
          | "super_admin"
          | "admin"
          | "user";
      }
      if (key.trim() === "universityId") {
        cookieObject.universityId = parseInt(value.trim());
      }
    });

    if (!cookieObject || !cookieObject.id || !cookieObject.userType) {
      navigate("/login");
    } else {
      setUserData(cookieObject);
    }
  };

  useEffect(() => {
    getCookieData();

    // Get events for user API here

    setEvents([
      {
        id: 1,
        name: "Campus Meetup",
        date: "04/10/2025",
        time: "14:00",
        type: "Public",
      },
      {
        id: 2,
        name: "RSO Club Gathering",
        date: "04/10/2025",
        time: "18:00",
        type: "RSO",
      },
      {
        id: 3,
        name: "Private Seminar",
        date: "04/10/2025",
        time: "16:00",
        type: "Private",
      },
    ]);
  }, []);

  return (
    <div className="w-full min-h-dvh flex flex-col items-stretch">
      <Navbar loggedIn={true} />
      <div className="flex flex-col py-10 px-12 grow gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Events Dashboard</h1>
          <button className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700">
            Create Event
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {events.map((event, index) => (
            <div key={index} className="border rounded-lg shadow-sm py-4 px-6">
              <h2 className="text-lg font-semibold">{event.name}</h2>
              <p className="">
                {event.date} at {event.time}
              </p>
              <p className="text-sm font-medium">Type: {event.type}</p>
            </div>
          ))}
        </div>
      </div>
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center overflow-y-hidden z-50 h-dvh p-4">
          <div className="bg-white py-10 px-12 rounded-lg max-w-2xl w-full overflow-y-auto max-h-full flex flex-col gap-0.5">
            <h2 className="text-xl font-semibold">{selectedEvent.name}</h2>
            <p className="">
              {selectedEvent.date} at {selectedEvent.time}
            </p>
            <p className="text-sm">Type: {selectedEvent.type}</p>
            <p className="text-sm">Ratings: {selectedEvent.ratings}</p>
            <p className="text-sm">
              Contact Phone Number: {selectedEvent.contactPhone}
            </p>
            <p className="text-sm">
              Contact Email: {selectedEvent.contactEmail}
            </p>
            <p className="text-sm">Description: {selectedEvent.description}</p>

            <div className="flex flex-col mt-2 gap-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-medium">Comments:</h3>
                <button className="bg-gray-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700">
                  Add
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                {selectedEvent.comments && selectedEvent.comments.length > 0 ? (
                  selectedEvent.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="border rounded-lg py-1.5 px-2.5 mx-2"
                    >
                      <p className="font-semibold">{comment.name}</p>
                      <p>{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Events Dashboard</h1>
          <button className="bg-gray-500 text-white px-4 py-2 rounded">
            Add Event
          </button>
        </div>
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 border border-gray-300 rounded-lg shadow-md"
            >
              <h2 className="text-lg font-semibold">{event.name}</h2>
              <p className="text-gray-600">
                {event.date} at {event.time}
              </p>
              <p className="text-sm font-medium text-gray-800">
                Type: {event.type}
              </p>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Dashbaord;
