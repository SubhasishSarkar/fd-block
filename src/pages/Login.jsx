import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";

import OtpInput from "otp-input-react";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "../firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [otp, setOtp] = useState("");
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [enableResend, setEnableResend] = useState(true);
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    let interval;
    if (enableResend && showOTP) {
      interval = setTimeout(() => {
        setEnableResend(false);
      }, 12000);
    }

    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [enableResend, showOTP]);

  function onCaptchVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSignup();
          },
          "expired-callback": () => {},
        },
        auth
      );
    }
  }

  function onSignup(evt) {
    evt.preventDefault();
    setLoading(true);
    onCaptchVerify();

    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+" + ph;

    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        toast.success("OTP sent");
      })
      .catch((error) => {
        toast.error("Unable to send otp");
        setLoading(false);
      });
  }

  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        setUser(res.user);
        setLoading(false);
        navigate(from);
      })
      .catch((err) => {
        toast.error("OTP verfication failed");
        setLoading(false);
      });
  }

  function resendOTP(e) {
    setEnableResend(true);
    onSignup(e);
  }
  return (
    <section className=" flex items-start justify-center h-screen">
      <div>
        <div id="recaptcha-container"></div>
        {!user && (
          <div className="w-80 flex flex-col gap-4 rounded-lg p-4">
            {showOTP ? (
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                  <BsFillShieldLockFill size={30} />
                </div>
                <label
                  htmlFor="otp"
                  className="font-bold text-xl text-emerald-500 text-center"
                >
                  Enter your OTP
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  disabled={false}
                  autoFocus
                  className="opt-container "
                ></OtpInput>
                <button
                  onClick={onOTPVerify}
                  className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                >
                  {loading ? (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  ) : (
                    " Verify OTP"
                  )}
                </button>
                <div className="flex items-center justify-center">
                  <button
                    className={
                      enableResend
                        ? "text-slate-300"
                        : "text-green-700 underline decoration-1"
                    }
                    onClick={(e) => {
                      resendOTP(e);
                    }}
                    disabled={enableResend}
                  >
                    Resend OTP {enableResend && "after 2 min"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                  <BsTelephoneFill size={30} />
                </div>
                <label htmlFor="" className="font-bold text-xl  text-center">
                  Verify your phone number
                </label>
                <PhoneInput country={"in"} value={ph} onChange={setPh} />
                <button
                  onClick={onSignup}
                  className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                >
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Send code via SMS</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
