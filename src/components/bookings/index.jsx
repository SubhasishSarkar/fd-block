import React, { useState, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "flowbite-react";

import CommunityHallImageSlider from "../SvgCommunityGroup";
import DatePicker from "../DatePicker";
import Button from "react-bootstrap/Button";

export default function BookingsPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const [start_date, SetStartDate] = useState(new Date());
  const [end_date, SetEndDate] = useState(new Date());
  const navigate = useNavigate();

  function Proceed(e) {
    const url_query = uid
      ? `?sd=${start_date.valueOf()}&ed=${end_date.valueOf()}&uid=${uid}`
      : `?sd=${start_date.valueOf()}&ed=${end_date.valueOf()}`;
    navigate(`/bookings/complete-booking${url_query}`);
  }
  return (
    <>
      <div className="text-4xl text-center pt-10 mb-10">
        Community Hall Booking
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <CommunityHallImageSlider className="min-w-[50%]" />
        <div className="flex flex-col items-center content-center justify-center w-full mb-14">
          <Suspense
            fallback={
              <Spinner color="success" aria-label="Success spinner example" />
            }
          >
            <DatePicker
              StartDate={start_date}
              SetStartDate={SetStartDate}
              EndDate={end_date}
              SetEndDate={SetEndDate}
            />
          </Suspense>
          <div className="flex justify-center w-full my-10">
            <Button variant="primary" onClick={(e) => Proceed(e)}>
              Proceed
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
