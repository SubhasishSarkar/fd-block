import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import app from "../firebase.config";
import { Chip } from "@mui/material";
import { Card } from "flowbite-react";

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
    field: "phoneNumber",
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
  {
    field: "is_permanent_member",
    headerName: "Is Lifetime Member?",
    width: 200,
    editable: false,
    renderCell: (value) => {
      if (value.value) return <Chip label="Yes" color="success" />;
      return <Chip label="No" color="error" />;
    },
  },
];

function BlockDir() {
  const [usres, setUsers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getAllUsers = async () => {
      const db = getFirestore(app);
      let user_data_set = [];
      const block_ref = doc(db, "block_dir", "list");
      const res = await getDoc(block_ref);
      const list = res.data();

      for (const key in list) {
        const user_obj = list[key];
        user_data_set.push({ ...user_obj, id: key });
      }

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
