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
};

type Comment = {
  content: string;
  id: number;
  name: string;
  userId: number;
};

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

  const getEventsForUser = () => {
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

  const handleEventClick = (id: number) => {
    console.log("Event clicked:", id);
    // Get Event Comments API here
    const eventComments: Comment[] = [
      {
        content: "This event was amazing! I had a great time.",
        id: 1,
        name: "Alice",
        userId: 2,
      },
      {
        content:
          "The speakers were really informative. Highly recommend attending.",
        id: 2,
        name: "Bob",
        userId: 11,
      },
      {
        content:
          "I wish the event lasted longer. It was fun! It was fun! It was fun!",
        id: 3,
        name: "Charlie",
        userId: 1,
      },
      {
        content: "Very well organized. Looking forward to the next one!",
        id: 4,
        name: "David",
        userId: 1,
      },
      {
        content: "Great event, but the food could have been better.",
        id: 5,
        name: "Eve",
        userId: 12,
      },
      {
        content:
          "Fantastic networking opportunities. Met a lot of interesting people.",
        id: 6,
        name: "Frank",
        userId: 13,
      },
      {
        content: "I think the event could use more interactive sessions.",
        id: 7,
        name: "Grace",
        userId: 7,
      },
      {
        content:
          "I enjoyed the event but was disappointed by the timing of the breaks.",
        id: 8,
        name: "Henry",
        userId: 9,
      },
      {
        content:
          "Amazing content and speakers. A must-attend for anyone interested in tech.",
        id: 9,
        name: "Ivy",
        userId: 10,
      },
      {
        content:
          "The event was good but lacked sufficient seating for all attendees.",
        id: 10,
        name: "Jack",
        userId: 1,
      },
    ];

    // Get avg event rating API here
    const eventRating = 3;

    // Get event details API here

    setSelectedEvent({
      id: 1,
      name: "Private Seminar",
      description:
        "A conference bringing together tech enthusiasts and industry leaders.",
      date_time: "2025-06-15 10:00:00",
      location_name: "Orlando Convention Center",
      latitude: 28.4255,
      longitude: -81.309,
      contactPhone: "+1 (555) 123-4567",
      contactEmail: "info@techconference.com",
      event_type: "private",
      ratings: eventRating,
      comments: eventComments,
      rso_name: "Tech Innovators Club",
      university_name: "University of Central Florida",
    });
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
          getEvents={getEventsForUser}
        />
      )}
    </div>
  );
};

export default Dashbaord;
