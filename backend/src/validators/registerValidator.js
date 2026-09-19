import yup from "yup";

const registerValidator = yup.object({
    fullName: yup
        .string()
        .min(3, "Full Name must be at least 3 characters long.")
        .max(50, "Full Name must be at most 50 characters long.")
        .required("Full Name is required."),
    email: yup
        .string()
        .email("Invalid email.")
        .required("Email is required."),
    password: yup
        .string()
        .min(6, "Password must be at least 6 characters long.")
        .max(20, "Password must be at most 20 characters long.")
        .required("Password is required."),
    confirmPassword: yup
        .string()
        .min(6, "Password must be at least 6 characters long.")
        .max(20, "Password must be at most 20 characters long.")
        .required("Confirm Password is required.")
        .oneOf([yup.ref("password")], "Passwords do not match.")
});

export default registerValidator;