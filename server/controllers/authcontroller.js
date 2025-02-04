import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModel from "../models/usermodel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// Register function
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Please fill all fields" });
  }

  try {
    const existinguser = await userModel.findOne({ email });
    if (existinguser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to our platform!",
      text: `Hello ${name}, welcome to our platform!. We're glad to have you. Have a great day!`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};

// Login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Please fill all fields" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};

// Logout function
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};

export const sendverifyOtp = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: "Please provide an email" });
  }

  try {
    const user = await userModel.findOne({ _id: userId });
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account aleready verified" });
    }
    const otp = String(Math.floor(Math.random() * 900000 + 100000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 *1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
    
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };

    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Please provide an email and OTP" });
  }

  try {
    const user = await userModel.findOne({ _id: userId });
    if(!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    if (user.verifyOtp !== otp || user.verifyOtp=== "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > user.verifyOtpExpireAt) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "User not authenticated" });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Please provide an email" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(Math.random() * 900000 + 100000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      // text: `Hello ${user.name}, your OTP for password reset is ${otp}`,
      html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };

    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.json({ success: false, message: "Please provide an email, OTP and new password" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > user.resetOtpExpireAt) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};
