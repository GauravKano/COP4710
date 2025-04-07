import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import EventModal from "../components/EventModal";
import CreateEvent from "../components/CreateEvent";

interface Event {
  id: number;
  name: string;
  date_time: string;
  event_type: "public" | "private" | "rso";
}

type EventDetails = {
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
  ratings: number;
  comments: Comment[];
  university_name: string | null;
  rso_name: string | null;
  [key: string]: string | number | null | boolean | Comment[];
};

type Comment = {
  content: string;
  id: number;
  name: string;
  user_id: number;
  [key: string]: string | number | null;
};

type APIComment = {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
  };
  [key: string]: unknown;
};

type user = {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  universityId?: number;
  userType?: "super_admin" | "admin" | "student";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [userData, setUserData] = useState<user | null>(null);
  const [createEventModal, setCreateEventModal] = useState<boolean>(false);

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
          | "student";
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

  const getEventsForUser = async () => {
    // Get events for user API here

    setEvents([
      {
        id: 1,
        name: "Campus Meetup",
        date_time: "2025-06-15 10:00:00",
        event_type: "public",
      },
      {
        id: 2,
        name: "RSO Club Gathering",
        date_time: "2025-06-15 10:00:00",
        event_type: "rso",
      },
      {
        id: 3,
        name: "Private Seminar",
        date_time: "2025-06-15 10:00:00",
        event_type: "private",
      },
    ]);
  };

  useEffect(() => {
    getCookieData();

    getEventsForUser();
  }, []);

  const handleEventClick = async (id: number) => {
    let eventComments: Comment[] = [];
    // Get Event Comments API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/comments/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to get event details");
      }

      const data = await response.json();
      eventComments = data.map((comment: APIComment) => {
        return {
          id: comment.id,
          content: comment.content,
          name: comment.user.username,
          user_id: comment.user.id,
        };
      });
    } catch (error) {
      console.error("Error fetching event comments: ", error);
      return;
    }

    // Get avg event rating API here
    const eventRating = 3;

    // Get event details API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/events/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to get event details");
      }

      const { date_time, ...data } = await response.json();
      const date = new Date(date_time);
      const formattedDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setSelectedEvent({
        ...data,
        date_time: formattedDate,
        ratings: eventRating || 0,
        comments: eventComments,
      });
    } catch (error) {
      console.error("Error fetching event details: ", error);
      return;
    }
  };

  return (
    <div className="w-full min-h-dvh flex flex-col items-stretch">
      <Navbar loggedIn={true} />
      <div className="flex flex-col py-10 px-12 grow gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Events Dashboard</h1>
          <button
            className="bg-gray-600 text-white px-3.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => setCreateEventModal(true)}
          >
            Create Event
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {events.length === 0 ? (
            <p className="text-center">No events found.</p>
          ) : (
            <>
              {events.map((event, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-sm py-4 px-6"
                  onClick={() => handleEventClick(event.id)}
                >
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                  <p className="text-sm font-medium">{event.date_time}</p>
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
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          closeModal={() => setSelectedEvent(null)}
          userId={userData?.id || 0}
          username={userData?.username || ""}
          setEvent={setSelectedEvent}
        />
      )}

      {createEventModal && (
        <CreateEvent
          closeModal={() => setCreateEventModal(false)}
          userId={userData?.id || 0}
          universityId={userData?.universityId || 0}
          updateEvents={(
            id: number,
            name: string,
            date_time: string,
            event_type: "public" | "private" | "rso"
          ) => {
            setEvents((prev) => [{ id, name, date_time, event_type }, ...prev]);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
