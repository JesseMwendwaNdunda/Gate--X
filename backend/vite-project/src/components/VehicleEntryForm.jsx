import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

function VehicleEntryForm() {
  const navigate = useNavigate();

  return (
    <div className="vehicle-form-container">
      <button className="back-btn" onClick={() => navigate("/login")}>
        ⬅ Back to Login
      </button>

      <h2>Register Vehicle</h2>

      <Formik
        initialValues={{
          number_plate: "",
          owner_name: "",
          phone_number: "",
          id_number: "",
          office_id: "", 
        }}
        validationSchema={Yup.object({
          number_plate: Yup.string().required("Required"),
          owner_name: Yup.string().required("Required"),
          phone_number: Yup.string().required("Required"),
          id_number: Yup.string().required("Required"),
          office_id: Yup.string().required("Required"), 
        })}
        onSubmit={async (values, { resetForm }) => {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/vehicle_entries", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(values),
            });

            if (res.ok) {
              alert("Vehicle entry added!");
              resetForm();
            } else {
              const data = await res.json();
              alert(` ${data.message || "Error adding vehicle"}`);
            }
          } catch (err) {
            alert(" Server error. Try again later.");
          }
        }}
      >
        {() => (
          <Form className="vehicle-form">
            <div className="form-group">
              <Field name="number_plate" placeholder="Number Plate" />
              <ErrorMessage name="number_plate" component="div" className="error" />
            </div>

            <div className="form-group">
              <Field name="owner_name" placeholder="Owner Name" />
              <ErrorMessage name="owner_name" component="div" className="error" />
            </div>

            <div className="form-group">
              <Field name="phone_number" placeholder="Phone Number" />
              <ErrorMessage name="phone_number" component="div" className="error" />
            </div>

            <div className="form-group">
              <Field name="id_number" placeholder="ID Number" />
              <ErrorMessage name="id_number" component="div" className="error" />
            </div>

            <div className="form-group">
              <label htmlFor="office_id">Office</label>
              <Field as="select" name="office_id">
                <option value="">Select Office</option>
                <option value="1">Moringa School</option>
                <option value="2">Lexing Kenya</option>
                <option value="3">Bima Finance</option>
                <option value="4">Get-X Security Office</option>
              </Field>
              <ErrorMessage name="office_id" component="div" className="error" />
            </div>

            <button type="submit" className="submit-btn">
              Add Vehicle
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default VehicleEntryForm;
