import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import app from "../../../../firebase.config.js";
import { Collections } from "../../../../helpers/constants";
import { Chip } from "@mui/material";
import { Card } from "flowbite-react";
import { useNavigate } from "react-router-dom";

const columns = [
  {
    field: "name",
    headerName: "Name",
    width: 150,
    editable: false,
    renderCell: (value) => {
      if (value.row.isAdmin)
        return (
          <div>
            {value.value + "  "}
            <Chip
              label="Admin"
              color="success"
              variant="outlined"
              size="small"
            />
          </div>
        );

      return value.value;
    },
  },
  {
    field: "phone_number",
    headerName: "Phone Number",
    width: 150,
    editable: false,
  },
  {
    field: "address",
    headerName: "Address",
    width: 150,
    editable: false,
  },
  {
    field: "plot",
    headerName: "Plot",
    width: 150,
    editable: false,
  },
  {
    field: "is_member",
    headerName: "Is Member",
    width: 150,
    editable: false,
    renderCell: (value) => {
      if (value.value) return <Chip label="Yes" color="success" />;

      return <Chip label="No" color="error" />;
    },
  },
  {
    field: "is_permanent_member",
    headerName: "Is Lifetime Member",
    width: 150,
    editable: false,
    renderCell: (value) => {
      if (value.value) return <Chip label="Yes" color="success" />;

      return <Chip label="No" color="error" />;
    },
  },
];

function AllUsers() {
  const [usres, setUsers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const getAllUsers = async () => {
      const db = getFirestore(app);
      let user_data_set = [];
      const user_collection = collection(db, Collections.USERS);
      const users = await getDocs(user_collection);

      let idx = 1;
      users.forEach((doc) => {
        const user_obj = doc.data();
        user_data_set.push({
          ...user_obj,
          id: user_obj?.id ? user_obj.id : idx,
        });
        idx++;
      });
      setUsers(user_data_set);
      setIsLoading(false);
    };
    setIsLoading(true);
    getAllUsers();
  }, []);

  const handleRowClick = (data) => {
    const { field, row } = data;
    switch (field) {
      case "name":
        navigate(`/dashboard/profile/admin_view?uid=${row.phone_number}`);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return <div>Loading.....</div>;
  }
  return (
    <Card>
      <DataGrid
        rows={usres}
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
    </Card>
  );
}

export default AllUsers;
