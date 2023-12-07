import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import { StdContextProvider } from "./context/StdContext.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth.jsx";
import BookingsPage from "./pages/BookingPage.jsx";
import CompleteBooking from "./pages/CompleteBooking.jsx";
import Bookings from "./pages/Booking.jsx";
import Profile from "./pages/Profile.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import EditBookingPage from "./components/dashboard/bookings/edit_booking";
import AllUsers from "./pages/AllUsers.jsx";
import AllBookings from "./pages/AllBookings.jsx";
import BlockDir from "./pages/BlockDir.jsx";
import AddUser from "./pages/AddUser.jsx";
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
                <Route path="/dashboard/user/add" element={<AddUser />} />
                <Route path="/dashboard/users" element={<AllUsers />} />
                <Route path="/dashboard/bookings" element={<AllBookings />} />
                <Route path="/blockdir" element={<BlockDir />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </StdContextProvider>
    </div>
  );
}

export default App;
