import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function SignupForm() {
  return (
    <div className="container">
      <h2>Signup</h2>
      <Formik
        initialValues={{ username: '', password: '', role: '' }}
        validationSchema={Yup.object({
          username: Yup.string().required('Required'),
          password: Yup.string().min(6, 'Min 6 characters').required('Required'),
          role: Yup.string().oneOf(['admin', 'office', 'guard'], 'Invalid role').required('Required')
        })}
        onSubmit={async (values, { resetForm }) => {
          try {
            const res = await fetch('http://localhost:5000/api/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            });
            const data = await res.json();
            if (res.status === 201) {
              alert('User created successfully!');
              resetForm();
            } else {
              alert(` ${data.message || 'Signup failed'}`);
            }
          } catch (err) {
            alert('Server error. Try again later.');
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

            <label>Role:</label>
            <Field as="select" name="role">
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="office">Office</option>
              <option value="guard">Guard</option>
            </Field>
            <ErrorMessage name="role" component="div" className="error" />

            <button type="submit">Signup</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default SignupForm;