import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";
const ResetPassword = () => {
  const [email, setEmail] = React.useState("");
  const[newpassword,setnewPassword]=React.useState("");
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const[otp,setOtp]=React.useState(0);
  const[isOtpSubmitted,setIsOtpSubmitted]=React.useState(false);


  const navigate = useNavigate(); // Defined navigate
  const inputRefs = React.useRef([]); // Added inputRefs
  axios.defaults.withCredentials = true; // Added axios.defaults.withCredentials
  const { backendurl, isLoggedin, userData, getUserdata } =
    useContext(AppContent); // Added backendurl
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      const { data } = await axios.post(
        `${backendurl}/api/auth/verify-account`,
        { otp }
      );
      if (data.success) {
        toast.success(data.message);

        getUserdata();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendurl}/api/auth/send-reset-otp`, {
        email,
      });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""));
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`${backendurl}/api/auth/reset-password`, {
        email,
        otp,
       password: newpassword
      });
      if (data.success) {
        toast.success(data.message);
      
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      {!isEmailSent  && 
      <form onSubmit={onSubmitEmail}className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Reset password
        </h1>
        <p className="text-indigo-300 text-center mb-6">
          Enter your registered email address
        </p>
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
          <img src={assets.mail_icon} alt="" className="w-4 h-4" />
          <input
            type="email"
            placeholder="Email id"
            className="bg-transparent text-white outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
          Submit
        </button>
      </form>
}
      {!isOtpSubmitted && isEmailSent && 
      <form onSubmit={onSubmitOtp}className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Reset password Otp
        </h1>
        <p className="text-indigo-300 text-center mb-6">
          Enter the OTP sent to your email
        </p>
        <div className="flex justify-between mb-8 " onPaste={handlePaste}>
          {Array(6)
            .fill()
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1} // Corrected attribute
                required
                className="w-12 h-12 text-center bg-[#333A5C] text-white text-xl rounded-lg"
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>

        <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
          Submit
        </button>
      </form>
}
      {isEmailSent && isOtpSubmitted &&
      <form  onSubmit={onSubmitNewPassword}className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          New password
        </h1>
        <p className="text-indigo-300 text-center mb-6">
          Enter your new password
        </p>
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
          <img src={assets.lock_icon} alt="" className="w-4 h-4" />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent text-white outline-none"
            value={newpassword}
            onChange={(e) => setnewPassword(e.target.value)}
          />
        </div>
        <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
          Submit
        </button>
      </form>
}
    </div>
  );
};

export default ResetPassword;
