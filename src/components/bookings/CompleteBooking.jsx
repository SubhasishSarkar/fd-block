// Front end
import React from "react";
import { useLocation } from "react-router-dom";

import EditBooking from "../EditBooking";

const CompleteBooking = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sd = params.get("sd");
  const ed = params.get("ed");
  const uid = params.get("uid");
  const start_date = new Date(parseInt(sd));
  const end_date = new Date(parseInt(ed));

  return (
    <EditBooking
      startDate={start_date}
      endDate={end_date}
      editMode={false}
      uid={uid}
    />
  );
};

export default CompleteBooking;
