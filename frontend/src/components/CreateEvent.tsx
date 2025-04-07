import { useEffect, useState } from "react";
import ErrorDialog from "./ErrorDialog";

type RSO = {
  id: number;
  name: string;
  [key: string]: string | number;
};

const CreateEvent: React.FC<{
  closeModal: () => void;
  userId: number;
  universityId: number | null;
  token: string;
  userType: "super_admin" | "admin" | "student";
  updateEvents: (
    id: number,
    name: string,
    date_time: string,
    event_type: "public" | "private" | "rso"
  ) => void;
}> = ({ closeModal, userId, universityId, updateEvents, token, userType }) => {
  const [eventName, setEventName] = useState<string>("");
  const [eventType, setEventType] = useState<
    "public" | "private" | "rso" | null
  >(null);
  const [rso, setRso] = useState<RSO | null>(null);
  const [rsoList, setRsoList] = useState<RSO[]>([]);
  const [dateTime, setDateTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get rso that user is admin for API here

    getAdminRSOs();
    if (userType === "admin") {
      return;
    }
  }, []);

  const getAdminRSOs = async () => {
    try {
      const response = await fetch(`http://35.175.224.17:8080/api/admin/rsos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: {
            id: userId,
            user_type: userType,
          },
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.message || "Failed to get rsos where user is admin"
        );
      }

      const data = await response.json();
      console.log(data);
      setRsoList(data.rsos || []);
    } catch (error) {
      console.error("Error fetching RSO list:", error);
      setError("Failed to fetch RSO list.");
    }
  };

  const formatContactPhone = (phone: string) => {
    const phoneNum = phone.replace(/\D/g, "");
    let returnPhone = "";

    if (phoneNum.length > 0) {
      returnPhone += `(${phoneNum.substring(0, 3)}`;
    }

    if (phoneNum.length > 2) {
      returnPhone += `) ${phoneNum.substring(3, 6)}`;
    }

    if (phoneNum.length > 5) {
      returnPhone += `-${phoneNum.substring(6, 10)}`;
    }

    return returnPhone;
  };

  const handleCreateEvent = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!eventName.trim()) {
      setError("Event name cannot be empty.");
    } else if (!eventType) {
      setError("Please select an event type.");
    } else if (eventType === "rso" && !rso) {
      setError("Please select an RSO.");
    } else if (!dateTime) {
      setError("Date and time cannot be empty.");
    } else if (new Date(dateTime) < new Date()) {
      setError("Date and time cannot be in the past.");
    } else if (contactPhone && contactPhone.length !== 14) {
      setError("Contact phone number must be 10 digits long.");
    } else if (contactEmail.trim() && emailRegex.test(contactEmail) === false) {
      setError("Please enter a valid email address.");
    } else if (!locationName.trim()) {
      setError("Location name cannot be empty.");
    } else {
      // const eventId = Create Event API here
      try {
        const response = await fetch("http://35.175.224.17:8080/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: eventName.trim(),
            description: description.trim() || null,
            date_time: dateTime,
            location_name: locationName.trim(),
            latitude: 1,
            longitude: 1,
            contact_phone: contactPhone || null,
            contact_email: contactEmail.trim() || null,
            event_type: eventType,
            rso_id: eventType === "rso" ? rso?.id : null,
            university_id: eventType === "private" ? universityId : null,
            created_by: userId,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(errorMessage.message || "Failed to create event");
        }

        const data = await response.json();
        const date = new Date(data.event.date_time);

        updateEvents(
          data.event.id,
          data.event.name,
          date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          data.event.event_type as "public" | "private" | "rso"
        );
        closeModal();
      } catch (error) {
        console.error("Error during create event:", error);
        setError(
          error instanceof Error ? error.message : "Failed to create event"
        );
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 flex justify-center items-center overflow-y-hidden z-20 h-dvh p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="bg-white pt-10 pb-12 px-8 rounded-lg max-w-xl w-full overflow-y-auto max-h-full flex flex-col gap-8">
        <h2 className="text-lg font-medium ml-4">Create Event</h2>

        {error && (
          <div className="mt-[-15px] mb-[-8px] mx-4">
            <ErrorDialog errorMessage={error} setErrorMessage={setError} />
          </div>
        )}

        <div className="flex flex-col gap-6 px-12">
          <div className="flex gap-4 items-center">
            <p className="text-nowrap">Event Name: </p>
            <input
              placeholder="Enter event name here"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>

          <div className="flex gap-4 items-center">
            <p className="text-nowrap">Event Type: </p>
            <select
              className="w-full px-3 py-1.5 border rounded-md"
              value={eventType || ""}
              onChange={(e) => {
                const value = e.target.value as
                  | "public"
                  | "private"
                  | "rso"
                  | "";
                setEventType(value === "" ? null : value);
              }}
            >
              <option value="" disabled>
                Select Event Type
              </option>
              <option value="public">Public</option>
              {universityId !== null && (
                <option value="private">Private</option>
              )}
              <option value="rso">RSO</option>
            </select>
          </div>

          {eventType === "rso" && (
            <div className="flex gap-4 items-center">
              <p className="text-nowrap">RSO Name: </p>
              <select
                className="w-full px-3 py-1.5 border rounded-md"
                value={rso ? rso.id : ""}
                onChange={(e) => {
                  const selectedRso = rsoList.find(
                    (r) => r.id.toString() === e.target.value
                  );
                  setRso(selectedRso || null);
                }}
              >
                <option value="" disabled>
                  Select RSO
                </option>
                {rsoList.map((rso) => (
                  <option key={rso.id} value={rso.id}>
                    {rso.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4 items-center">
            <p className="text-nowrap">Date and Time: </p>
            <input
              type="datetime-local"
              className="w-full px-3 py-1.5 border rounded-md"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div className="flex gap-4 items-center">
            <p className="text-nowrap">Description: </p>
            <textarea
              rows={3}
              className="w-full px-3 py-1.5 border rounded-md"
              placeholder="Enter event description here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-4 items-center">
            <p className="text-nowrap">Contact Phone: </p>
            <input
              placeholder="Enter contact phone here"
              maxLength={14}
              value={contactPhone}
              onChange={(e) =>
                setContactPhone(formatContactPhone(e.target.value))
              }
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>

          <div className="flex gap-4 items-center">
            <p className="text-nowrap">Contact Email: </p>
            <input
              placeholder="Enter contact email here"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>

          <div className="flex gap-4 items-center">
            <p className="text-nowrap">Location Name: </p>
            <input
              placeholder="Enter location name here"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          <button
            className="bg-gray-600 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 text-white text-sm px-3.5 py-2 rounded-lg cursor-pointer hover:bg-green-900"
            onClick={handleCreateEvent}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
