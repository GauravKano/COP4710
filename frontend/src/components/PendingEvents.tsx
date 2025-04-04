import { useEffect, useState } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import EventDetailsModal from "./EventDetailsModal";

interface Event {
  id: number;
  name: string;
  date_time: string;
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
  university_name: string | null;
  rso_name: string | null;
};

const PendingEvents: React.FC<{
  closeModal: () => void;
}> = ({ closeModal }) => {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);

  const getPendingEvents = () => {
    // Get Pending Public events API here

    setPendingEvents([
      {
        id: 1,
        name: "Campus Meetup",
        date_time: "2025-06-15 10:00:00",
      },
      {
        id: 2,
        name: "RSO Club Gathering",
        date_time: "2025-06-15 10:00:00",
      },
      {
        id: 3,
        name: "Private Seminar",
        date_time: "2025-06-15 10:00:00",
      },
    ]);
  };

  useEffect(() => {
    getPendingEvents();
  }, []);

  const handleEventClick = (id: number) => {
    console.log("Event clicked:", id);

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
      rso_name: "Tech Innovators Club",
      university_name: "University of Central Florida",
    });
  };

  const changeEventStatus = (id: number, status: "approved" | "rejected") => {
    // Accept / Deny Event API
    console.log(`Event ${id} changed status to ${status}`);

    setPendingEvents((prev) => {
      return prev.filter((event) => event.id !== id);
    });
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
      <div className="bg-white pt-10 pb-14 px-12 rounded-lg max-w-2xl w-full overflow-y-auto max-h-full flex flex-col gap-4 relative">
        <button
          className="absolute top-5 right-5 p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer rounded-md"
          onClick={closeModal}
          title="Close Modal"
        >
          <FaXmark className="text-xl" />
        </button>

        <h3 className="text-lg font-medium">Pending Events</h3>
        <div className="flex flex-col gap-4 px-10">
          {pendingEvents.length === 0 ? (
            <p className="mx-auto">No Pending Events.</p>
          ) : (
            <>
              {pendingEvents.map((event, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-sm py-4 pl-6 pr-4 flex gap-2.5 items-center"
                >
                  <div
                    className="cursor-pointer grow"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <h2 className="text-lg font-semibold">{event.name}</h2>
                    <p className="text-sm font-medium">{event.date_time}</p>
                  </div>
                  <button
                    className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                    title="Approve Event"
                    onClick={() => changeEventStatus(event.id, "approved")}
                  >
                    <FaCheck className="text-xl" />
                  </button>
                  <button
                    className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                    title="Deny Event"
                    onClick={() => changeEventStatus(event.id, "rejected")}
                  >
                    <FaXmark className="text-xl" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsModal
          closeModal={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default PendingEvents;
