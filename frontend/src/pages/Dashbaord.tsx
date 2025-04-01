import Navbar from "../components/Navbar";
import { useState } from "react";

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

const Dashbaord = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events: Event[] = [
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
  ];

  return (
    <div className="w-full min-h-dvh flex flex-col items-stretch">
      <Navbar />
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
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center over-flow-y-hidden z-50 h-dvh">
          <div className="bg-white py-6 px-8 rounded-lg max-w-lg w-full m-4 overflow-y-auto">
            <h2>{selectedEvent.name}</h2>
            <p className="">
              {selectedEvent.date} at {selectedEvent.time}
            </p>
            <p className="text-sm font-medium">Type: {selectedEvent.type}</p>
            <p className="text-sm font-medium">
              Ratings: {selectedEvent.ratings}
            </p>
            <p className="text-sm font-medium">
              Contact Phone Number: {selectedEvent.contactPhone}
            </p>
            <p className="text-sm font-medium">
              Contact Email: {selectedEvent.contactEmail}
            </p>
            <p className="text-sm font-medium">
              Description: {selectedEvent.description}
            </p>
            <div className="flex flex-col mt-2 gap-1.5">
              <div className="flex items-center justify-between mb-1">
                <h3>Comments:</h3>
                <button className="bg-gray-600 text-white px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700">
                  Add
                </button>
              </div>
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
