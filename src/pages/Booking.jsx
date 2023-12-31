import React from "react";
import Card from "react-bootstrap/Card";

import ListBookings from "../components/ListBookings";
import { useParams, useSearchParams } from "react-router-dom";
import BookingDetails from "../components/dashboard/bookings/view_booking";

const Bookings = () => {
  let [searchParams] = useSearchParams();

  const booking_id = searchParams.get("id");
  const { view } = useParams();
  if (booking_id && view) {
    return <BookingDetails adminView={view === "admin_view" ? true : false} />;
  }
  return (
    <div className="w-full">
      <Card className="p-2">
        <h3 className="text-xl">My Bookings</h3>
        <ListBookings /* listAll = false, i.e., user only */ />
      </Card>
    </div>
  );
};

export default Bookings;
