import React, { useContext, useEffect } from "react";
import { StdContext } from "../context/StdContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function RequireAuth() {
  const { SignedIn, isFetching } = useContext(StdContext);
  const location = useLocation();

  if (isFetching) {
    return <div>Loading......</div>;
  } else {
    return (
      <div>
        {SignedIn() ? (
          <Outlet />
        ) : (
          <Navigate to="/login" state={{ from: location }} replace />
        )}
      </div>
    );
  }
}

export default RequireAuth;
