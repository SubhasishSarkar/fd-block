import React from "react";
import Header from "./Header";
import { Footer } from "flowbite-react";
import { Link, Outlet } from "react-router-dom";
import { UpdateUserModal } from "./dashboard/User/UpdateUser";
import { ToastContainer } from "react-toastify";
export default function Layout({
  enableBackgroundPattern = true,
  className = "",
}) {
  const style_classes = `max-w-6xl container mx-auto ${className}`;

  // Background style sheet (if enabled)
  // background-color: #eeeeee;
  // opacity: 0.7;
  // background-image:  radial-gradient(#1151a8 0.8px, transparent 0.8px), radial-gradient(#1151a8 0.8px, #eeeeee 0.8px);
  // background-size: 32px 32px;
  // background-position: 0 0,16px 16px;

  return (
    <div>
      <UpdateUserModal />
      <div className="bg-white">
        <Header />
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
      />
      <div className={style_classes}>
        {enableBackgroundPattern ? (
          <div className="-z-10 fixed top-0 left-0 w-full h-full opacity-70 bg-polka bg-[length:32px_32px]" />
        ) : (
          ""
        )}
        <Outlet />
      </div>
      <div className="mt-7">
        <Footer container={true} className="p-2">
          <Footer.Copyright by="fdblock.org" year={2022} />
          <Footer.LinkGroup className="flex gap-2">
            <Footer.Link>
              <Link to="/">Home</Link>
            </Footer.Link>
            <Footer.Link>
              <Link to="/bookings">Bookings</Link>
            </Footer.Link>
            <Footer.Link>
              <Link to="/contact">Contact</Link>
            </Footer.Link>
            <Footer.Link>
              <Link to="/aboutus">About</Link>
            </Footer.Link>
          </Footer.LinkGroup>
        </Footer>
      </div>
    </div>
  );
}
