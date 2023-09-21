import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  getFirestore,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import app from "../firebase.config";
import { Collections } from "../helpers/constants";
import { Chip } from "@mui/material";
import { Card } from "flowbite-react";
import { useNavigate } from "react-router-dom";

const columns = [
  {
    field: "name",
    headerName: "Name",
    width: 200,
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
    valueGetter: (params) => params.row.name,
  },
  {
    field: "phone_number",
    headerName: "Phone Number",
    width: 200,
    editable: false,
  },
  {
    field: "address",
    headerName: "Address",
    width: 200,
    editable: false,
  },
  {
    field: "plot",
    headerName: "Plot",
    width: 200,
    editable: false,
  },
];

function BlockDir() {
  const [usres, setUsers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const getAllUsers = async () => {
      const db = getFirestore(app);
      let user_data_set = [];
      const user_collection = collection(db, Collections.USERS);
      const q = query(user_collection, where("is_member", "==", true));
      const users = await getDocs(q);
      users.forEach((doc) => {
        const user_obj = doc.data();
        user_data_set.push({ ...user_obj, id: user_obj.plot });
      });
      setUsers(user_data_set);
      setIsLoading(false);
    };
    setIsLoading(true);
    getAllUsers();
  }, []);

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
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />
    </Card>
  );
}

export default BlockDir;
