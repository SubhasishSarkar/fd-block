// Front end
import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

// Internal
import { StdContext } from "../context/StdContext";
//import fd_block_logo from "/public/assets/images/fdblock.png";

// Define the URLs and their page titles below
// TODO: Make this dynamic with graphql
const routes = new Map();
routes.set("home", ["/", "Home"]);
routes.set("bookings", ["/bookings", "Bookings"]);
routes.set("contact", ["/contact", "Contact"]);
routes.set("aboutus", ["/aboutus", "About"]);
routes.set("blockdir", ["/blockdir", "Block"]);

const Header = () => {
  const location = useLocation();
  const page_route = location?.pathname;
  const navbar_elements = [];
  routes.forEach((page_title, _) => {
    navbar_elements.push({
      route: page_title[0],
      title: page_title[1],
      active: page_title[0] === page_route,
    });
  });

  const { user_phone_number, SignedIn, SignOut, user_data, isFetching } =
    useContext(StdContext);
  return (
    // <Navbar fluid={true} rounded={true}>
    //     <Navbar.Brand href="/">
    //         <img src="assets/images/fdblock.png" className="mr-3 h-6 sm:h-9" alt="fdblock.org logo" />
    //         <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">fdblock.org</span>
    //     </Navbar.Brand>
    //     <div className="flex md:order-2">
    //         {NoData() ? (
    //             <Spinner aria-label="Default status example" />
    //         ) : SignedIn() ? (
    //             <div className="flex md:order-2">
    //                 <Dropdown arrowIcon={false} inline={true} label={<TfiUser className="text-2xl" />}>
    //                     <Dropdown.Header>
    //                         <span className="block text-sm">{user_data?.name}</span>
    //                         <span className="block truncate text-sm font-medium">{user_phone_number}</span>
    //                     </Dropdown.Header>
    //                     <Dropdown.Item>
    //                         <Link to="/dashboard/profile">Profile</Link>
    //                     </Dropdown.Item>
    //                     <Dropdown.Item>
    //                         <Link to="/dashboard/bookings">Bookings</Link>
    //                     </Dropdown.Item>
    //                     <Dropdown.Item>
    //                         <Link to="/dashboard/block-dir">Block Directory</Link>
    //                     </Dropdown.Item>
    //                     <Dropdown.Divider />
    //                     {user_data?.is_admin ? (
    //                         <>
    //                             <Dropdown.Item>
    //                                 <Link to="/dashboard/admin/manage-bookings">Manage Bookings</Link>
    //                             </Dropdown.Item>
    //                             <Dropdown.Item>
    //                                 <Link to="/dashboard/admin/manage-users">Manage Users</Link>
    //                             </Dropdown.Item>
    //                             <Dropdown.Divider />
    //                         </>
    //                     ) : null}
    //                     <Dropdown.Item onClick={e => SignOut()}>Sign out</Dropdown.Item>
    //                 </Dropdown>
    //             </div>
    //         ) : (
    //             <Navbar.Link href={routes.get("login")[0]}>
    //                 <span className="">{routes.get("login")[1]}</span>
    //             </Navbar.Link>
    //         )}
    //     <Navbar.Toggle />
    //     </div>
    //     <Navbar.Collapse>
    //         {navbar_elements.map(navbar_link => (
    //             <Navbar.Link key={navbar_link.route} href={navbar_link.route} active={navbar_link.active}>
    //                 {navbar_link.title}
    //             </Navbar.Link>
    //         ))}
    //     </Navbar.Collapse>
    // </Navbar>
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">
          <img
            src="/assets/images/fdblock.png"
            className="mr-3 h-6 sm:h-9"
            alt="fdblock.org logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            fdblock.org
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navbar_elements.map((elmnt) => {
              return (
                <LinkContainer to={elmnt.route} key={elmnt.route}>
                  <Nav.Link active={elmnt.active}>{elmnt.title}</Nav.Link>
                </LinkContainer>
              );
            })}
            {SignedIn() && !isFetching && user_data?.isAdmin && (
              <NavDropdown title="Admin" id="basic-nav-dropdown">
                <LinkContainer to="dashboard/users">
                  <NavDropdown.Item>Users</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="dashboard/bookings">
                  <NavDropdown.Item>Bookings</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            )}
            {SignedIn() ? (
              <NavDropdown title="Account" id="basic-nav-dropdown">
                <LinkContainer to="dashboard/profile">
                  <NavDropdown.Item>My Profile</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="dashboard/bookings/view_booking/user_view">
                  <NavDropdown.Item>My Bookings</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => SignOut()}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              ""
            )}

            {SignedIn() ? (
              <Navbar.Text>
                Signed in as: <a href="#login">{user_phone_number}</a>
              </Navbar.Text>
            ) : (
              <Nav.Link href="login">
                <span className="">Login</span>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
