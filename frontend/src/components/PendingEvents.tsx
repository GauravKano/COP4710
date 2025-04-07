import { useEffect, useState } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import EventDetailsModal from "./EventDetailsModal";
import ErrorDialog from "./ErrorDialog";

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
  [key: string]: unknown;
};

const PendingEvents: React.FC<{
  closeModal: () => void;
  token: string;
  userType: "super_admin" | "admin" | "student";
}> = ({ closeModal, token, userType }) => {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getPendingEvents = async () => {
    // Get Pending Public events API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/pendingpublic/events`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to get pending events");
      }

      const data = await response.json();
      setPendingEvents(
        data.map((event: { id: number; name: string; time: string }) => {
          const date = new Date(event.time);
          const formattedDate = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          return {
            id: event.id,
            name: event.name,
            date_time: formattedDate,
          };
        })
      );
    } catch (error) {
      setError("Failed to fetch pending events");
      console.error("Failed to fetch pending events:", error);
      return;
    }
  };

  useEffect(() => {
    getPendingEvents();
  }, []);

  const handleEventClick = async (id: number) => {
    // Get event details API here
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/events/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to get event details");
      }

      const { date_time, contact_email, contact_phone, ...data } =
        await response.json();
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
        contactEmail: contact_email || null,
        contactPhone: contact_phone || null,
        date_time: formattedDate,
      });
    } catch (error) {
      console.error("Error fetching event details: ", error);
      return;
    }
  };

  const changeEventStatus = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    // Accept / Deny Event API
    try {
      const response = await fetch(
        `http://35.175.224.17:8080/api/events/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approved: status === "approved",
            user: {
              user_type: userType,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.message || "Failed to approve/reject pending event"
        );
      }

      setPendingEvents((prev) => {
        return prev.filter((event) => event.id !== id);
      });
    } catch (error) {
      setError("Failed to change event status");
      console.error(`Failed to change event status for ${id}:`, error);
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
      <div className="bg-white pt-10 pb-14 px-12 rounded-lg max-w-2xl w-full my-auto flex flex-col gap-4 relative">
        <button
          className="absolute top-5 right-5 p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer rounded-md"
          onClick={closeModal}
          title="Close Modal"
        >
          <FaXmark className="text-xl" />
        </button>

        <h3 className="text-lg font-medium">Pending Events</h3>

        {error && (
          <ErrorDialog errorMessage={error} setErrorMessage={setError} />
        )}
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
