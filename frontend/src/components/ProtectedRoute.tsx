import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user: string | null = localStorage.getItem("wave_user");
    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;