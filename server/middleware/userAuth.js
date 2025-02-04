import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.json({ success: false, message: "User not authenticated login again" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) {
            return res.json({ success: false, message: "User not authenticated" });
        }   
        req.body.userId = decoded.id;
        next();
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "User not authenticated" });
    }
    };

export default userAuth;