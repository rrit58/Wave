import yup from "yup";

const loginValidator = yup.object({
    email: yup
        .string()
        .email("Invalid email.")
        .required("Email is required."),
    password: yup
        .string()
        .required("Password is required.")
});

export default loginValidator;