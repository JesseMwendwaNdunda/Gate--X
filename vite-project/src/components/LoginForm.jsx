import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Login</h2>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={Yup.object({
          username: Yup.string().required("Required"),
          password: Yup.string().required("Required"),
        })}
        onSubmit={async (values, { resetForm }) => {
          try {
            const res = await fetch("http://localhost:5000/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });
            const data = await res.json();

            if (res.ok && data.token) {
              // Save token, role, and username
              localStorage.setItem("token", data.token);
              localStorage.setItem("role", data.role);
              localStorage.setItem("username", values.username); // <-- store username

              // Redirect based on role
              if (data.role === "guard") navigate("/entry");
              else navigate("/vehicles"); // admin and office staff

              resetForm();
            } else {
              alert(`${data.message || "Login failed"}`);
            }
          } catch (err) {
            alert("Server error. Try again later.");
          }
        }}
      >
        {() => (
          <Form>
            <label>Username:</label>
            <Field name="username" />
            <ErrorMessage name="username" component="div" className="error" />

            <label>Password:</label>
            <Field name="password" type="password" />
            <ErrorMessage name="password" component="div" className="error" />

            <button type="submit">Login</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default LoginForm;
