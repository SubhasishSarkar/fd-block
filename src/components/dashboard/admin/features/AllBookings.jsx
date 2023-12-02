import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  getDoc,
  getFirestore,
  getDocs,
  collection,
  Timestamp,
  where,
} from "firebase/firestore";
import app from "../../../../firebase.config.js";
import { Collections } from "../../../../helpers/constants";
import { Box, Chip, Tab } from "@mui/material";
import { Card } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import Booking from "../../../../helpers/Booking";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

const columns = [
  {
    field: "booking_reference_id",
    headerName: "Id",
    width: 150,
    editable: false,
    renderCell: (value) => {
      return <div className="cursor-pointer font-bold">{value.value}</div>;
    },
  },
  {
    field: "created_on",
    headerName: "Booking Date",
    width: 150,
    editable: false,
    renderCell: (value) => {
      return value.value.toDateString();
    },
  },
  {
    field: "event_type",
    headerName: "Type",
    width: 150,
    editable: false,
  },
  {
    field: "floor_option",
    headerName: "Floor",
    width: 150,
    editable: false,
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    editable: false,
    renderCell: (value) => {
      switch (value.value) {
        case "request":
          return <Chip label={value.value} color="warning" />;
        case "confirmed":
          return <Chip label={value.value} color="success" />;
        case "rejected":
          return <Chip label={value.value} color="error" />;
        default:
          break;
      }
    },
  },
  {
    field: "name",
    headerName: "Name",
    width: 150,
    editable: false,
  },
  {
    field: "phone_number",
    headerName: "Phone Number",
    width: 150,
    editable: false,
  },
];
const filterBookings = (bookings, filter_type) => {
  const today = new Date();
  return bookings.filter((booking) => {
    switch (filter_type) {
      case "upcoming":
        if (today <= booking.end_date) return true;
        break;
      case "past":
        if (today >= booking.end_date) return true;
        break;
      default:
        return false;
    }
  });
};
function AllBookings() {
  const [users, setUsers] = useState();
  const [bookings, setBookings] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    const getAllUsers = async () => {
      const db = getFirestore(app);
      let user_data_set = [];
      const user_collection = collection(db, Collections.USERS);
      const users = await getDocs(user_collection, where("bookings", "!=", []));
      users.forEach((doc) => {
        const user_obj = doc.data();
        user_data_set.push(user_obj);
      });
      setUsers(user_data_set);
    };
    setIsLoading(true);
    getAllUsers();
  }, []);

  useEffect(() => {
    const getBookings = async () => {
      let booking_data_set = [];

      for (let j = 0; j < users.length; j++) {
        const data = users[j];

        const bookings = data.bookings;
        if (bookings === undefined) {
          continue;
        }
        for (let idx = 0; idx < bookings.length; idx++) {
          const booking_doc = await getDoc(
            bookings[idx].withConverter(Booking.FirestoreConverter)
          );
          if (booking_doc.exists()) {
            const booking_obj = booking_doc.data();
            booking_data_set.push({
              ...booking_obj,
              // ...data,
            });
          }
        }
      }
      setBookings(booking_data_set);
      setIsLoading(false);
    };
    if (users) getBookings();
  }, [users]);
  if (isLoading) {
    return <div>Loading.....</div>;
  }
  const handleRowClick = (data) => {
    const { field, id } = data;
    switch (field) {
      case "booking_reference_id":
        navigate(`/dashboard/bookings/view_booking/admin_view?id=${id}`);
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="All" value="1" />
              <Tab label="Upcoming" value="2" />
              <Tab label="Past" value="3" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <DataGrid
              rows={bookings}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 15, 20]}
              disableRowSelectionOnClick
              disableDensitySelector
              slots={{ toolbar: GridToolbar }}
              onCellDoubleClick={handleRowClick}
            />
          </TabPanel>
          <TabPanel value="2">
            <DataGrid
              rows={filterBookings(bookings, "upcoming")}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 15, 20]}
              disableRowSelectionOnClick
              disableDensitySelector
              slots={{ toolbar: GridToolbar }}
              onCellDoubleClick={handleRowClick}
            />
          </TabPanel>
          <TabPanel value="3">
            <DataGrid
              rows={filterBookings(bookings, "past")}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 15, 20]}
              disableRowSelectionOnClick
              disableDensitySelector
              slots={{ toolbar: GridToolbar }}
              onCellDoubleClick={handleRowClick}
            />
          </TabPanel>
        </TabContext>
      </Box>
    </Card>
  );
}

export default AllBookings;
