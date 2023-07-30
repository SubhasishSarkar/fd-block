import React, { useContext, useEffect, useState } from "react";
import { StdContext } from "../../../context/StdContext";
import { Table } from "flowbite-react";
import { Card, Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import UpdateUser from "./UpdateUser";
import User from "../../../helpers/User";
import { useSearchParams } from "react-router-dom";

function Profile({ adminView = false, userId }) {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState(null);
  const { user_data, isFetching, user_id } = useContext(StdContext);
  useEffect(() => {
    const getUser = async () => {
      if (adminView && user_data.isAdmin) {
        const fetched_data = await User.GetDataFromFirestore(uid);
        setUserData(fetched_data);
      } else if (!isFetching && user_data != null) {
        setUserData(user_data);
      }
    };
    getUser();
  }, [adminView, isFetching, user_data, uid]);

  if (isFetching || userData == null) {
    return <div>Lodaing.....</div>;
  }

  return (
    <>
      <Card>
        <Card.Header>Profile : {userData.name}</Card.Header>
        <Card.Body>
          <Table>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Full Name</Table.Cell>
                <Table.Cell>{userData.name}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Address</Table.Cell>
                <Table.Cell>{userData.address}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Plot</Table.Cell>
                <Table.Cell>{userData.plot}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Phone Number</Table.Cell>
                <Table.Cell>{userData.phone_number}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Card.Body>
        <Card.Footer>
          <Button
            onClick={() => {
              setShow(true);
            }}
          >
            Edit profile
          </Button>
        </Card.Footer>
      </Card>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Complete your profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UpdateUser
            userData={userData}
            uid={user_id}
            setShow={setShow}
            updateProfile
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Profile;
