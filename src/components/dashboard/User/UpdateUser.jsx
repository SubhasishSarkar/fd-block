import Modal from "react-bootstrap/Modal";
import { Formik } from "formik";
import * as yup from "yup";
import { useContext, useEffect, useState } from "react";
import { StdContext } from "../../../context/StdContext";
import User from "../../../helpers/User";
import { Button, Container, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  deleteFromBlockDir,
  updateBlockDirOnMemberChange,
} from "../../../helpers/blockDir";
import { useSearchParams } from "react-router-dom";
export function UpdateUserModal(addUser = false) {
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState();
  const { user_data, user_phone_number, isFetching } = useContext(StdContext);

  useEffect(() => {
    if (!isFetching && user_data?.phone_number) {
      setUserData(user_data);
    }
  }, [isFetching, user_data]);

  useEffect(() => {
    if (
      user_phone_number &&
      (!userData?.name || !userData?.address || !userData?.plot)
    ) {
      setShow(true);
    }
  }, [userData]);

  useEffect(() => {
    if (!user_data) {
      setShow(false);
    }
  }, [user_data]);

  return (
    <>
      <Modal show={show}>
        <Modal.Header>
          <Modal.Title>Complete your profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UpdateUser
            userData={userData}
            uid={user_phone_number}
            setShow={setShow}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

const UpdateUser = ({
  userData,
  uid,
  setShow,
  updateProfile = false,
  isAdmin = "false",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { UpdateUserData, SignOut } = useContext(StdContext);
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
      phone_number: yup
        .string()
        .required()
        .matches(phoneRegExp, "Phone number is not valid"),
    }),
    ...(isAdmin &&
      !updateProfile && {
        is_member: yup.boolean(),
        is_permanent_member: yup.boolean(),
      }),
  });

  const createNewUserFromExisting = async () => {
    setLoading(true);
    await User.CreateUser(newPhno.old, user);
    //await UpdateUserData(true);
    await deleteFromBlockDir(newPhno.old);
    await updateBlockDirOnMemberChange(user);
    setShow(false);

    setStep(1);
    setLoading(false);
    toast.success("Updated your profile");

    if (uid === userData.phone_number) SignOut();
    else {
      setSearchParams(`uid=${newPhno.new}`);
    }
  };
  return (
    <Container>
      {step === 1 && !loading && (
        <Formik
          initialValues={{
            name: userData?.name,
            address: userData?.address,
            plot: userData?.plot,
            phone_number: userData?.phone_number,
            is_member: userData?.is_member,
            is_permanent_member: userData?.is_permanent_member,
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            const user = {
              ...userData,
              name: values.name || "",
              address: values.address || "",
              plot: values.plot || "",
              ...(updateProfile && {
                phone_number: values.phone_number || userData.phone_number,
              }),
              is_member: values.is_member,
              is_permanent_member: values.is_permanent_member,
            };
            if (
              updateProfile &&
              userData.phone_number != values.phone_number &&
              (await User.FindExistingUser(user.phone_number))
            ) {
              toast.error(`${values.phone_number} is already used`);
            } else if (
              updateProfile &&
              userData.phone_number != values.phone_number
            ) {
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
              updateBlockDirOnMemberChange(user);
              setStep(1);
              setLoading(false);
              toast.success("Updated");
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
            setFieldValue,
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
              {isAdmin && updateProfile && (
                <>
                  <div>
                    <Form.Label>Is Member?</Form.Label>
                    <Form.Control
                      name="is_member"
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.value) {
                          setFieldValue("is_permanent_member", false);
                        }
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                      value={values.is_member}
                      checked={values.is_member}
                    />
                    <Form.Text className="text-danger">
                      {touched.is_member && errors.is_member ? (
                        <div className="text-danger">{errors.is_member}</div>
                      ) : null}
                    </Form.Text>
                  </div>
                  <div>
                    <Form.Label>Is Lifetime Member?</Form.Label>
                    <Form.Control
                      name="is_permanent_member"
                      type="checkbox"
                      onChange={(e) => {
                        e.preventDefault();
                        if (e.target.value) {
                          setFieldValue("is_member", true);
                        }
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                      value={values.is_permanent_member}
                      checked={values.is_permanent_member}
                    />
                    <Form.Text className="text-danger">
                      {touched.is_permanent_member &&
                      errors.is_permanent_member ? (
                        <div className="text-danger">
                          {errors.is_permanent_member}
                        </div>
                      ) : null}
                    </Form.Text>
                  </div>
                </>
              )}
              {updateProfile && (
                <>
                  <Form.Label>Phone number</Form.Label>
                  <Form.Control
                    name="phone_number"
                    type="text"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.phone_number}
                  />
                  <Form.Text className="text-danger">
                    {touched.phone_number && errors.phone_number ? (
                      <div className="text-danger">{errors.phone_number}</div>
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
                {updateProfile && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShow(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
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
                createNewUserFromExisting();
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
