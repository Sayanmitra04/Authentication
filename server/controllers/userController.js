import userModel from "../models/usermodel.js";


export const getUserdata = async (req, res) => {
    try {
       
        const user = await userModel.findOne({ _id: req.body.userId });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, userData: {
            name: user.name,
            isAccountVerified: user.isAccountVerified,
        } });
    }
    catch (error) {
        console.error(error);
        res.json({ success: false, message: "Something went wrong" });
    }
}


