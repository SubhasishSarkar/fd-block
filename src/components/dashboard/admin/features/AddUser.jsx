import { Formik } from "formik";
import React, { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateBlockDirOnMemberChange } from "../../../../helpers/blockDir";
import User from "../../../../helpers/User";
import * as yup from "yup";

const phoneRegExp = /^[\+][9][1][1-9]{1}[0-9]{9}$/;

function AddUser() {
  const [loading, setLoading] = useState(false);

  const schema = yup.object().shape({
    name: yup.string().required(),
    address: yup.string().required(),
    plot: yup.string().required(),
    phone_number: yup
      .string()
      .required()
      .matches(phoneRegExp, "Phone number is not valid"),
    is_member: yup.boolean(),
    is_permanent_member: yup.boolean(),
  });

  return (
    <Container className="p-2">
      <Card className="p-4">
        <div>
          <h1 className="font-bold">Create New User</h1>
        </div>
        <Formik
          initialValues={{
            name: "",
            address: "",
            plot: "",
            phone_number: "",
            is_member: false,
            is_permanent_member: false,
          }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            const user = {
              name: values.name,
              address: values.address,
              plot: values.plot,
              phone_number: values.phone_number,
              is_member: values.is_member,
              is_permanent_member: values.is_permanent_member,
            };

            const res = await User.CreateNewUser(user);

            if (res) {
              toast.success("User Created");
              resetForm({ values: "" });
            } else toast.error("Phone number already taken");
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
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                name="phone_number"
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.phone_number}
                placeholder="+91XXXXXXXXXX"
              />
              <Form.Text className="text-danger">
                {touched.phone_number && errors.phone_number ? (
                  <div className="text-danger">{errors.phone_number}</div>
                ) : null}
              </Form.Text>

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

              <div>
                <Form.Label>Is Member?</Form.Label>{" "}
                <Form.Control
                  name="is_member"
                  type="checkbox"
                  onChange={(e) => {
                    e.preventDefault();
                    if (!e.target.value) {
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
                <Form.Label>Is Lifetime Member?</Form.Label>{" "}
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
                  {touched.is_permanent_member && errors.is_permanent_member ? (
                    <div className="text-danger">
                      {errors.is_permanent_member}
                    </div>
                  ) : null}
                </Form.Text>
              </div>

              <div className="flex gap-0.5 mt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </Container>
  );
}

export default AddUser;
