import { FaXmark } from "react-icons/fa6";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

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
  university_name: string | null;
  rso_name: string | null;
};

const EventDetailsModal: React.FC<{
  event: Event;
  closeModal: () => void;
}> = ({ event, closeModal }) => {
  return (
    <div
      className="fixed inset-0 bg-black/75 flex justify-center items-center overflow-y-auto z-20 h-dvh p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="bg-white pt-10 pb-12 px-12 rounded-lg max-w-2xl w-full my-auto flex flex-col gap-1 relative">
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
        {event.university_name && (
          <p className="text-sm">University Name: {event.university_name}</p>
        )}
        {event.rso_name && (
          <p className="text-sm">RSO Name: {event.rso_name}</p>
        )}
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
      </div>
    </div>
  );
};

export default EventDetailsModal;
