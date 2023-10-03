// Front end
import React, { useState, Suspense, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { Card, Select, Table } from "flowbite-react";

// Firebase

// Internal UI components
import LoadingAnimation from "./LoadingAnimation";
import Datepicker from "./DatePicker";

// Internal data utils
import {
  event_types,
  floor_options,
  cost_table,
} from "../helpers/community_hall_rates.js";
import Booking from "../helpers/Booking";
import { MoneyFormat, DateDiff, GetSetOfDates } from "../helpers/utils";
import { StdContext } from "../context/StdContext";
import { Constants } from "../helpers/constants";
import { toast } from "react-toastify";

const PriceSummary = ({
  eventFloorUnitCost,
  refundableDepositCost,
  dateDiff,
  requestButtonAction,
  show_heading = true,
  styles = null,
}) => {
  const style_props = styles ? styles : "";
  return (
    <>
      {show_heading ? (
        <div className="mb-2 block mt-7">
          <span className="text-xl">Summary</span>
        </div>
      ) : null}
      <div className="p-2">
        <Table className={style_props}>
          <Table.Body className="divide-y text-black text-sm">
            <Table.Row className={style_props}>
              <Table.Cell className="font-semibold">Cost</Table.Cell>
              <Table.Cell>
                {MoneyFormat(eventFloorUnitCost)} &times; {dateDiff} day
                {dateDiff > 1 ? "s" : ""}
              </Table.Cell>
              <Table.Cell>
                {MoneyFormat(eventFloorUnitCost * dateDiff)}
              </Table.Cell>
            </Table.Row>
            <Table.Row className={style_props}>
              <Table.Cell className="font-semibold">
                Refundable deposit
              </Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell>{MoneyFormat(refundableDepositCost)}</Table.Cell>
            </Table.Row>
            <Table.Row className={style_props}>
              <Table.Cell className="font-semibold">Total</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell>
                {MoneyFormat(
                  eventFloorUnitCost * dateDiff + refundableDepositCost
                )}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
      {requestButtonAction ? (
        <div className="mt-7 flex">
          <div className="ml-auto">
            <Button onClick={requestButtonAction}>Request to reserve</Button>
          </div>
        </div>
      ) : null}
    </>
  );
};

const EditBooking = ({
  startDate = new Date(),
  endDate = new Date(),
  bookingObject = null,
  editMode = false,
  uid = null,
}) => {
  const navigate = useNavigate();
  const {
    NoData,
    SignedIn,
    GetUserData,
    user_phone_number,
    isFetching,
    user_data,
  } = useContext(StdContext);
  // Utility functions
  const CreateOptions = (obj) => {
    const options = [];
    for (const [k, v] of Object.entries(obj)) {
      options.push(
        <option key={k} value={k}>
          {v}
        </option>
      );
    }

    return options;
  };

  const [start_date, SetStartDate] = useState(startDate);
  const [end_date, SetEndDate] = useState(endDate);
  const [event, SetEvent] = useState(
    bookingObject === null
      ? Object.keys(event_types)[0]
      : bookingObject.event_type
  );
  const [floor, SetFloor] = useState(
    bookingObject === null
      ? Object.keys(floor_options[event])[0]
      : bookingObject.floor_option
  );
  const [show_modal, SetShowModal] = useState(false);
  const [request_handle_in_process, SetRequestHandleInProcess] =
    useState(false);

  const event_types_element = CreateOptions(event_types);
  const [floor_options_element, SetFloorOptionsElement] = useState(
    CreateOptions(floor_options[event])
  );
  const [resident, setResidents] = useState();
  const [event_floor_unit_cost, set_event_floor_unit_cost] = useState();
  const [refundable_deposit_cost, set_refundable_deposit_cost] = useState();
  useEffect(() => {
    if (!isFetching && user_data != null) {
      if (user_data && user_data["is_member"] === true)
        setResidents("residents");
      else setResidents("non_residents");
    }
  }, [user_data, isFetching]);

  useEffect(() => {
    if (resident && event && floor) {
      set_event_floor_unit_cost(cost_table[resident][event][floor]);
      set_refundable_deposit_cost(
        cost_table[resident][event]["security_deposit"]
      );
    }
  }, [resident, event, floor]);
  // Costs are different for block-residents and non-residents, for which we first have to determine what kind of user we are dealing with

  // Get a set of epoch timestamps denoting the dates which are to be shown as unblocked (if in edit mode)
  const unblock_dates =
    editMode === true
      ? GetSetOfDates(bookingObject.start_date, bookingObject.end_date)
      : null;
  // Event handlers
  const HandleEventTypeChange = (e) => {
    const event_type = e.target.value;
    SetEvent(event_type);
    SetFloorOptionsElement(CreateOptions(floor_options[event_type]));
    SetFloor(Object.keys(floor_options[event_type])[0]);
  };

  const HandleFloorChange = (e) => {
    const floor = e.target.value;
    SetFloor(floor);
  };

  const HandleProceed = async (e) => {
    e.preventDefault();

    SetRequestHandleInProcess(true);
    let booking_id = null;

    try {
      if (editMode) {
        await bookingObject.UpdateDoc({
          start_date: start_date,
          end_date: end_date,
          event_type: event,
          floor_option: floor,
          status: Constants.STATUS_REQUEST,
        });
        booking_id = bookingObject.id;
      } else {
        let phone_number = user_phone_number;
        if (user_data?.isAdmin && uid) {
          phone_number = "+" + uid.trim();
        }

        booking_id = await Booking.CreateDoc({
          user_id: phone_number,
          is_block_member: user_data && user_data["is_member"] === true,
          start_date: start_date,
          end_date: end_date,
          event_type: event,
          floor_option: floor,
        });
      }

      setTimeout(() => {
        toast.success("Booking request created");
        SetRequestHandleInProcess(false);
        SetShowModal(false);
        if (booking_id)
          navigate(
            `/dashboard/bookings/view_booking/user_view?id=${booking_id}`
          );
        else console.error("Could not create/update booking"); // TODO: Create an alert
      }, 1000);
    } catch (err) {}
  };
  ////////////////////////////////////////////////////////////////////////////////

  // Calculate the number of days to be booked
  const date_diff = DateDiff(start_date, end_date);

  // Fetch data from the cost table

  if (isFetching) {
    // When the user's logged in state is yet to be determined, show a loading animation
    return <p>Loading...</p>;
  }

  return (
    <Card>
      {editMode === false ? (
        <div>
          <div className="text-3xl text-center mt-5 mb-10">
            Complete your booking
          </div>
          <hr />
        </div>
      ) : (
        <div>
          <div className="text-xl mb-5">Edit booking request</div>
          <hr />
        </div>
      )}
      <div>
        {/***** End of calendar and billing details *****/}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="p-2 flex justify-center items-center">
            <Suspense
              fallback={
                <Spinner color="success" aria-label="Success spinner example" />
              }
            >
              <Datepicker
                StartDate={start_date}
                SetStartDate={SetStartDate}
                EndDate={end_date}
                SetEndDate={SetEndDate}
                unblockedSetOfDates={unblock_dates}
              />
            </Suspense>
          </div>

          <div className="p-2">
            <div>
              {/***** Event type dropdown menu *****/}
              <div>
                <div className="">
                  <span className="text-xl">Purpose of booking</span>
                </div>
                <div className="mt-3">
                  <Select
                    value={event}
                    onChange={HandleEventTypeChange}
                    id="event-type"
                    required={true}
                  >
                    {event_types_element}
                  </Select>
                </div>
              </div>

              {/***** End of event type dropdown menu *****/}

              {/***** Floor dropdown menu *****/}
              <div>
                <div className="mb-2 block mt-7">
                  <span className="text-xl">Number of floors</span>
                </div>
                <div className="mt-3">
                  <Select
                    value={floor}
                    onChange={HandleFloorChange}
                    required={true}
                  >
                    {floor_options_element}
                  </Select>
                </div>
              </div>
              {/***** End of floor dropdown menu *****/}
            </div>
            {/***** Price summary *****/}
            {editMode === false ? (
              <PriceSummary
                eventFloorUnitCost={event_floor_unit_cost}
                refundableDepositCost={refundable_deposit_cost}
                dateDiff={date_diff}
                requestButtonAction={() => {
                  SetShowModal(true);
                }}
              />
            ) : null}
            {/***** End of price summary *****/}

            {/***** Proceed button *****/}
            {/***** End of proceed button *****/}
          </div>
        </div>
        {/***** End of calendar and billing details *****/}

        {editMode === true ? (
          <div className="">
            <hr />
            <PriceSummary
              eventFloorUnitCost={event_floor_unit_cost}
              refundableDepositCost={refundable_deposit_cost}
              dateDiff={date_diff}
              requestButtonAction={() => {
                SetShowModal(true);
              }}
            />
          </div>
        ) : null}

        {/***** Cancellation and security deposite details *****/}

        <hr />

        <div className="grid grid-cols-1 sm:grid-cols-2 px-4 my-7">
          <div className="text-slate-500 py-2">
            <h5 className="text-lg font-semibold">Cancellation Policy</h5>
            <ul className="list-none mt-1">
              <li>Prior to three days before event: 75% of the cost</li>
              <li>One to three days before event: 50% of the cost</li>
              <li>On the day of the event: ₹0 will be refunded</li>
              <li>Nothing will be deducted from the security deposit</li>
            </ul>
          </div>
          <div className="text-slate-500 py-2">
            <h5 className="text-lg font-semibold">Security Deposit</h5>
            <ul className="list-none mt-1">
              <li>Electricity consumption will be deducted</li>
              <li>
                Lift usage cost will be deducted (₹500 per every 12 hours)
              </li>
              <li>Note: A lift operator will be provided</li>
            </ul>
          </div>
        </div>
        {/***** End of cancellation and security deposite details *****/}
      </div>
      <Modal
        show={show_modal}
        onHide={() => {
          SetShowModal(false);
        }}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {request_handle_in_process === false ? (
            <div className="text-center">
              <h3 className="mb-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                Confirm {editMode === true ? "changes to" : ""} this booking
                request?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="success" onClick={HandleProceed}>
                  Yes, I'm sure
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    SetShowModal(false);
                  }}
                >
                  No, cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col text-center">
              <span className="mb-2 text-lg">
                {editMode === true ? "Updating" : "Creating"} booking request
              </span>
              <div>
                <Spinner animation="grow" variant="primary" />
                <Spinner animation="grow" variant="secondary" />
                <Spinner animation="grow" variant="success" />
                <Spinner animation="grow" variant="danger" />
                <Spinner animation="grow" variant="warning" />
                <Spinner animation="grow" variant="info" />
              </div>
            </div>
          )}
          <hr className="my-4" />
          <div className="text-slate-500">
            <h5 className="text-base font-semibold mt-2 text-left">Note</h5>
            <ul className="list-none text-sm mt-2 text-left">
              <li>This request will be notified to the block committee.</li>
              <li>
                Once they approve this booking, payment options will be
                presented which when completed will confirm these dates to your
                name.
              </li>
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export { PriceSummary };
export default EditBooking;
