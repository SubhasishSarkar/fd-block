import Modal from "react-bootstrap/Modal";
import { Formik } from "formik";
import * as yup from "yup";
import { useContext, useEffect, useState } from "react";
import { StdContext } from "../../../context/StdContext";
import User from "../../../helpers/User";
import { Button, Container, Form } from "react-bootstrap";
import { toast } from "react-hot-toast";
export function UpdateUserModal() {
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState();
  const { user_data, user_id, isFetching } = useContext(StdContext);

  useEffect(() => {
    if (!isFetching && user_data?.user_id) {
      setUserData(user_data);
    }
  }, [isFetching, user_data]);

  useEffect(() => {
    if (user_id && (!userData?.name || !userData?.address || !userData?.plot)) {
      setShow(true);
    }
  }, [userData]);

  return (
    <>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete your profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UpdateUser userData={userData} uid={user_id} setShow={setShow} />
        </Modal.Body>
      </Modal>
    </>
  );
}

const UpdateUser = ({ userData, uid, setShow, updateProfile = false }) => {
  const { UpdateUserData } = useContext(StdContext);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(false);
  const [newPhno, setNewPhno] = useState();
  const [step, setStep] = useState(1);
  const phoneRegExp = /^[\+][9][1][1-9]{1}[0-9]{9}$/;

  const schema = yup.object().shape({
    name: yup.string().required(),
    address: yup.string().required(),
    plot: yup.string().required(),
    ...(updateProfile && {
      phno: yup
        .string()
        .required()
        .matches(phoneRegExp, "Phone number is not valid"),
    }),
  });

  const updateUser = async () => {
    setLoading(true);
    await User.Update(uid, user);
    await UpdateUserData(true);
    setShow(false);

    setStep(1);
    setLoading(false);
    toast.success("Updated your profile");
  };
  return (
    <Container>
      {step === 1 && !loading && (
        <Formik
          initialValues={{
            name: userData?.name,
            address: userData?.address,
            plot: userData?.plot,
            ...(updateProfile && { phno: userData?.phone_number }),
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            const user = {
              ...userData,
              name: values.name || "",
              address: values.address || "",
              plot: values.plot || "",
              phone_number: values.phno || userData.phone_number,
            };

            // check if already existing
            if (
              userData.phone_number != values.phno &&
              (await User.FindExistingUser(user.phone_number))
            ) {
              toast.error(`${values.phno} is already used`);
            } else if (userData.phone_number != values.phno) {
              setStep(2);
              setUser(user);
              setNewPhno({
                new: user.phone_number,
                old: userData.phone_number,
              });
            } else {
              setLoading(true);
              await User.Update(uid, user);
              await UpdateUserData(true);
              setShow(false);

              setStep(1);
              setLoading(false);
              toast.success("Updated your profile");
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
              />
              <Form.Text className="text-danger">
                {touched.name && errors.name ? (
                  <div className="text-danger">{errors.name}</div>
                ) : null}
              </Form.Text>
              <Form.Label>Plot</Form.Label>
              <Form.Control
                name="plot"
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.plot}
              />
              <Form.Text className="text-danger">
                {touched.plot && errors.plot ? (
                  <div className="text-danger">{errors.plot}</div>
                ) : null}
              </Form.Text>

              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address"
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.address}
              />
              <Form.Text className="text-danger">
                {touched.address && errors.address ? (
                  <div className="text-danger">{errors.address}</div>
                ) : null}
              </Form.Text>
              {updateProfile && (
                <>
                  <Form.Label>Phone number</Form.Label>
                  <Form.Control
                    name="phno"
                    type="text"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.phno}
                  />
                  <Form.Text className="text-danger">
                    {touched.phno && errors.phno ? (
                      <div className="text-danger">{errors.phno}</div>
                    ) : null}
                  </Form.Text>
                </>
              )}

              <div className="flex gap-0.5 mt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Submit
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShow(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
      {step === 2 && (
        <div>
          <div className="p-2">
            <h2 className="mb-2">
              Are you sure you want to change your phone number from{" "}
              {newPhno.old} to {newPhno.new} ?
            </h2>
            <p className="text-slate-400 text-xs italic">
              Note : Once changed, you have to login with the new phone number
            </p>
          </div>
          <div className="flex gap-0.5">
            <Button
              className="flex-1"
              onClick={() => {
                setStep(3);
                updateUser();
              }}
            >
              Yes
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShow(false);
                setStep(1);
              }}
            >
              No
            </Button>
          </div>
        </div>
      )}
      {loading && <div>Updating.....</div>}
    </Container>
  );
};

export default UpdateUser;
