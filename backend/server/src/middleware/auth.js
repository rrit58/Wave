import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is Invalid."
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing."
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userID = decodedToken.id;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Authorization token is expired."
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export default auth;