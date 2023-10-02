import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "react-bootstrap/Card";
import { Table, Alert } from "flowbite-react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import CancelIcon from "@mui/icons-material/Cancel";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { PriceSummary } from "../../../components/EditBooking";
import PendingIcon from "@mui/icons-material/Pending";
import app from "../../../firebase.config";
import { StdContext } from "../../../context/StdContext";
import { BlockDates, UnblockDates } from "../../../helpers/utils";
import { cost_table } from "../../../helpers/community_hall_rates.js";
import { Constants, Collections } from "../../../helpers/constants";
import Booking from "../../../helpers/Booking";
import { DataGrid } from "@mui/x-data-grid";
import { Form } from "react-bootstrap";
import { Chip, Paper } from "@mui/material";

// TODO: Share the booking object via context. Use it by verifying proper details. Clear it at the proper time.
// If it is not available, fetch and set it on the context
const columns = [
  {
    field: "timestamp",
    headerName: "Modified Date",
    width: 150,
    editable: false,
    renderCell: ({ value }) => {
      return new Date(value.seconds * 1000).toDateString();
    },
  },
  {
    field: "name",
    headerName: "Modified By",
    width: 150,
    editable: false,
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    editable: false,
    renderCell: (value) => {},
  },

  {
    field: "phone_number",
    headerName: "Phone Number",
    width: 150,
    editable: false,
  },
];
const BookingDetails = ({
  booking,
  display_user = false,
  user_data,
  adminView,
}) => {
  //const { GetUserData, user_data, isFetching } = useContext(StdContext);
  //const user_data = GetUserData();
  const resident =
    user_data && user_data["is_member"] === true
      ? "residents"
      : "non_residents";
  const event = booking.GetEventType();
  const floor = booking.GetFloorOption();
  const event_floor_unit_cost = cost_table[resident][event][floor];
  const refundable_deposit_cost =
    cost_table[resident][event]["security_deposit"];
  const date_diff = booking.GetDuration();

  return (
    <div className="flex space-x-4">
      <div className="flex-1 p-2">
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <div className="flex justify-between text-black">
                  <span className="text-lg font-semibold">Booking code</span>
                  <span className="text-base">{booking.GetBookingCode()}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-black">
                  <span className="text-lg font-semibold">Status</span>
                  <span className="text-base">{booking.GetStatusString()}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-black">
                  <span className="text-lg font-semibold">Booking date</span>
                  <span className="text-base">
                    {booking.GetStartDateString()}
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-black">
                  <span className="text-lg font-semibold">Duration</span>
                  <span className="text-base">
                    {booking.GetDuration()} days
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-black">
                  <span className="text-lg font-semibold">Purpose</span>
                  <span className="text-base">{booking.GetEventString()}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-black">
                  <span className="text-lg font-semibold">
                    Number of floors booked
                  </span>
                  <span className="text-base">
                    {booking.GetFloorOptionString()}
                  </span>
                </div>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
      <div className="flex flex-col flex-1">
        <PriceSummary
          eventFloorUnitCost={event_floor_unit_cost}
          refundableDepositCost={refundable_deposit_cost}
          dateDiff={date_diff}
          show_heading={false}
          styles="text-base"
        />
        <Paper elevation="2" className="p-4">
          <span>Booking Status</span>
          <span>
            {booking.status === Constants.STATUS_CONFIRMED && (
              <Chip
                icon={<CheckCircleOutlineIcon />}
                label="Your booking is confirmed"
                color="success"
              ></Chip>
            )}
            {booking.status === Constants.STATUS_REJECTED && (
              <div>
                <Chip
                  icon={<CancelIcon />}
                  label="Your booking is rejected"
                  color="error"
                ></Chip>
                <div>{booking.comments.rejection_reason}</div>
              </div>
            )}
            {booking.status === Constants.STATUS_REQUEST && (
              <div>
                <Chip
                  icon={<PendingIcon />}
                  label="Pending admin action"
                  color="warning"
                ></Chip>
                <div>{booking.comments.rejection_reason}</div>
              </div>
            )}
          </span>
        </Paper>
      </div>
    </div>
  );
};

const Bookings = ({ adminView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const booking_id = params.get("id");

  const { user_phone_number, isFetching, user_data } = useContext(StdContext);
  // const user_data = GetUserData();
  const [booking_obj, SetBookingObj] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  // UI stuff
  const [booking_deletion_in_progress, SetBookingDeletionInProgress] =
    useState(false);
  const [booking_acceptance_in_progress, SetBookingAcceptanceInProgress] =
    useState(false);

  const [show_unauthorized_access, SetShowUnauthorizedAccess] = useState(false);
  const [show_delete_confirmation, SetShowDeleteConfirmation] = useState(false);
  const [show_cancel_booking_request, SetShowCancelBookingRequest] =
    useState(false);
  const [show_accept_booking_request, SetShowAcceptBookingRequest] =
    useState(false);

  const [rejectionNote, setRejectionNote] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (booking_obj !== null) return;

    const GetBookingDetails = async () => {
      //if (NoData()) return;

      const db = getFirestore(app);
      const booking_ref = doc(db, Collections.BOOKINGS, booking_id);
      const booking_doc = await getDoc(
        booking_ref.withConverter(Booking.FirestoreConverter)
      );
      if (booking_doc.exists()) {
        console.warn("Querying data");
        const booking_data = booking_doc.data();
        if (user_data?.isAdmin || booking_data.user_id === user_phone_number) {
          SetShowUnauthorizedAccess(false); // Just in case it was enabled due to some unexpected state-change
          SetBookingObj(booking_doc.data()); // Booking object will get set
          return;
        } else {
          console.warn("Preventing unauthorized access");
          SetShowUnauthorizedAccess(true);
          setTimeout(() => {
            navigate(-1);
          }, 2000);
        }
      } else {
        // TODO: Issue an alert
        console.error("Could not find any booking doc");
      }

      SetBookingObj({});
    };

    if (!isFetching && Object.keys(user_data).length > 0) {
      GetBookingDetails();
    }
  }, [user_data, user_phone_number, isFetching]);

  useEffect(() => {
    if (booking_obj === null || booking_obj === undefined) return;
    const getBookingActions = async () => {
      let history = [];
      console.log(booking_obj);
      const history_data = booking_obj.modified_by;
      for (let idx = 0; idx < history_data.length; idx++) {
        const user_doc = await getDoc(history_data[idx].modifier);
        if (user_doc.exists()) {
          const user_obj = user_doc.data();
          history.push({
            ...history_data[idx],
            ...user_obj,
            id: idx,
          });
        }
      }
      if (adminView) setHistoryList(history);
      else setHistoryList(history.slice(0, 1));
    };

    if (booking_obj) getBookingActions();
  }, [booking_obj]);

  const HandleEditBooking = () => {
    navigate(`/dashboard/bookings/edit_booking?id=${booking_obj.id}`);
  };

  const HandleBookingDeletion = async () => {
    SetBookingDeletionInProgress(true);
    await booking_obj.DeleteDoc();
    setTimeout(() => {
      SetBookingDeletionInProgress(false);
      SetShowDeleteConfirmation(false);
      console.debug("Deleted!");
      navigate("/dashboard/bookings/view_booking/user_view");
    }, 1000);
  };

  const HandleBookingAcceptance = async () => {
    SetBookingAcceptanceInProgress(true);
    await booking_obj.SetBookingStatus(
      Constants.STATUS_CONFIRMED,
      user_phone_number
    );
    await BlockDates(booking_obj.start_date, booking_obj.end_date);
    setTimeout(() => {
      SetBookingAcceptanceInProgress(false);
      SetShowAcceptBookingRequest(false);
      navigate(-1);
    }, 1000);
  };

  const HandleBookingRejection = async () => {
    if (rejectionNote) {
      setError(false);
    } else {
      setError(true);
      return;
    }
    await booking_obj.SetBookingStatus(
      Constants.STATUS_REJECTED,
      user_phone_number,
      rejectionNote
    );
    await UnblockDates(booking_obj.start_date, booking_obj.end_date);
    setTimeout(() => {
      SetShowCancelBookingRequest(false);
      navigate(-1);
    }, 1000);
  };
  if (isFetching || user_data == null) {
    return <div>Loading....</div>;
  }

  /* TODO: SHOW REJECTION REASON (in case request has been rejected) */
  return (
    <>
      <div className="w-full">
        <Card>
          <Card.Body>
            <Card.Title>Booking Details</Card.Title>
            <div>
              <div className="">
                {show_unauthorized_access ? (
                  <Alert color="failure">
                    <span>
                      {/* TODO: Do not make an empty threat, record this activity into 'system' */}
                      <span className="font-bold">Unauthorized access!</span>{" "}
                      This will be reported
                    </span>
                  </Alert>
                ) : null}

                {booking_obj === null ? (
                  <div className="w-full text-center">
                    <Spinner size="xl" />
                  </div>
                ) : Object.keys(booking_obj).length === 0 ? null : (
                  <BookingDetails booking={booking_obj} user_data={user_data} />
                )}
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            {booking_obj === null ||
            Object.keys(booking_obj).length === 0 ? null : (
              <div className=" flex justify-end">
                {!adminView && booking_obj.user_id === user_phone_number && (
                  <>
                    {booking_obj.status !== Constants.STATUS_CONFIRMED && (
                      <span className="mr-5">
                        <Button color="light" onClick={HandleEditBooking}>
                          Edit booking request
                        </Button>
                      </span>
                    )}
                    <span className="">
                      <Button
                        color="failure"
                        onClick={() => {
                          SetShowDeleteConfirmation(true);
                        }}
                      >
                        Delete booking request
                      </Button>
                    </span>
                  </>
                )}

                {user_data?.isAdmin && adminView ? (
                  <>
                    {booking_obj.IsRequest() || booking_obj.IsRejected() ? (
                      <span className="mx-5">
                        <Button
                          color="success"
                          onClick={() => {
                            SetShowAcceptBookingRequest(true);
                          }}
                        >
                          Accept booking request
                        </Button>
                      </span>
                    ) : null}
                    {(booking_obj.IsRequest() || booking_obj.IsConfirmed()) &&
                    user_data?.isAdmin &&
                    adminView ? (
                      <span className="">
                        <Button
                          color="failure"
                          onClick={() => {
                            //true
                            SetShowCancelBookingRequest(true);
                          }}
                        >
                          Reject booking request
                        </Button>
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
            )}
          </Card.Footer>
        </Card>
        {historyList.length > 0 && (
          <Card className="mt-2">
            <Card.Body>
              <Card.Title>Admin action</Card.Title>
              <div>
                {/* {historyList === null || historyList.length === 0
                ? null
                : historyList.map((item) => {
                  const date = new Date(item.timestamp.seconds * 1000);
                  
                    return <div>{date.toDateString()}</div>;
                  })} */}
              </div>
              {adminView ? (
                <DataGrid
                  rows={historyList}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[10, 15, 20]}
                  disableRowSelectionOnClick
                  disableDensitySelector
                />
              ) : (
                <DataGrid
                  rows={historyList}
                  columns={columns}
                  disableRowSelectionOnClick
                  disableDensitySelector
                />
              )}
            </Card.Body>
          </Card>
        )}
      </div>

      {/* //Cancle booking request */}
      <Modal
        show={show_delete_confirmation}
        size="md"
        popup={true}
        onClose={() => {
          SetShowDeleteConfirmation(false);
        }}
      >
        <Modal.Header />

        <Modal.Body>
          {booking_deletion_in_progress === false ? (
            <div className="text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Confirm deleting this booking request
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="failure" onClick={HandleBookingDeletion}>
                  Yes, I'm sure
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    SetShowDeleteConfirmation(false);
                  }}
                >
                  No, don't delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col text-center">
              <span className="mb-5 text-lg">Deleting booking request</span>
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
        </Modal.Body>
      </Modal>

      <Modal
        show={show_accept_booking_request}
        size="md"
        popup={true}
        onClose={() => {
          SetShowAcceptBookingRequest(false);
        }}
      >
        <Modal.Header />
        <Modal.Body>
          {booking_acceptance_in_progress === false ? (
            <div className="text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Sure you want to accept this booking request?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="success" onClick={HandleBookingAcceptance}>
                  Yes, I'm sure
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    SetShowAcceptBookingRequest(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col text-center">
              <span className="mb-5 text-lg">Accepting booking request</span>
              <Spinner color="success" size="xl" />
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={show_cancel_booking_request}
        size="md"
        popup={true}
        onHide={() => {
          SetShowCancelBookingRequest(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Reject Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Rejection reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
              />
              <Form.Text className="text-danger">
                {error && (
                  <div className="text-danger">Please enter a reason</div>
                )}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setError(false);
              SetShowCancelBookingRequest(false);
              setRejectionNote("");
            }}
          >
            No, don't cancel
          </Button>
          <Button variant="primary" onClick={HandleBookingRejection}>
            Yes, Cancle
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Bookings;
