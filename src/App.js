import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import { StdContextProvider } from "./context/StdContext.jsx";
import ContactUs from "./components/ContactUs.jsx";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth.jsx";
import BookingsPage from "./components/bookings/index";
import CompleteBooking from "./components/bookings/CompleteBooking.jsx";
import Bookings from "./components/dashboard/bookings/index.js";
import Profile from "./components/dashboard/User/Profile.jsx";
import AboutUs from "./components/AboutUs.jsx";
import EditBookingPage from "./components/dashboard/bookings/edit_booking.js";
import UpdateUser from "./components/dashboard/User/UpdateUser.jsx";
import AllUsers from "./components/dashboard/admin/features/AllUsers.jsx";
import AllBookings from "./components/dashboard/admin/features/AllBookings.jsx";
function App() {
  return (
    <div className="App">
      <StdContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route element={<Home />} index />
              <Route path="login" element={<Login />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="aboutus" element={<AboutUs />} />
              <Route element={<RequireAuth />}>
                <Route path="bookings" element={<BookingsPage />} />
                <Route
                  path="bookings/complete-booking"
                  element={<CompleteBooking />}
                />
                <Route
                  path="dashboard/bookings/view_booking/:view"
                  element={<Bookings />}
                />
                <Route path="dashboard/profile" element={<Profile />} />
                <Route
                  path="dashboard/profile/admin_view"
                  element={<Profile adminView={true} />}
                />
                <Route
                  path="/dashboard/bookings/edit_booking"
                  element={<EditBookingPage />}
                />
                <Route path="/dashboard/user/update" element={<UpdateUser />} />
                <Route path="/dashboard/users" element={<AllUsers />} />
                <Route path="/dashboard/bookings" element={<AllBookings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </StdContextProvider>
    </div>
  );
}

export default App;
