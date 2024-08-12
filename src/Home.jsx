import React, { useEffect, useState } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import { notification, Modal } from "antd";

const Home = () => {
  const navigate = useNavigate();

  // Modal for error
  const error = () => {
    Modal.error({
      title: "*You Are Not Registered",
      content: "Please Register To Continue...",
      okButtonProps: {
        style: {
          backgroundColor: "#087f5b",
          hoverBackgroundColor: "#087f5b",
          borderColor: "#087f5b",
          hoverBorderColor: "#087f5b",
          color: "white",
          activeBackgroundColor: "#087f5b",
          activeBorderColor: "#087f5b",
        },
      },
      okText: "Okay",
      onOk: () => {
        window.location.reload();
      },
    });
  };

  // Toast notifications
  const [phApi, phContextHolder] = notification.useNotification();
  const [sentApi, sentContextHolder] = notification.useNotification();
  const [OTPApi, OTPContextHolder] = notification.useNotification();

  const displaySent = (placement, message) => {
    sentApi.info({
      message: `${message}`,
      placement,
    });
  };

  const displayPhErr = (placement, message) => {
    phApi.warning({
      message: `${message}`,
      placement,
    });
  };

  const displayOTPErr = (placement, message) => {
    OTPApi.error({
      message: `${message}`,
      onClose: () => {
        window.location.reload();
      },
      placement,
    });
  };

  const [phoneNum, setPhoneNum] = useState("");
  const [Otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hidePhInput, setHidePhInput] = useState(false);
  const [OTPBox, setOTPBox] = useState(true);

  // Timer for resend OTP
  const [timer, setTimer] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCounter, setResendCounter] = useState(2);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  
   useEffect(() => {
  let interval;
  if (isResendDisabled && timer > 0) {
    interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);
  } else if (timer === 0) {
    setIsResendDisabled(false);
    clearInterval(interval);
  }

  return () => clearInterval(interval);
}, [isResendDisabled, timer]);


const resendOtpHandler = () => {
  if (resendCounter > 0) {
    setIsResendDisabled(true);
    setTimer(60);
    setResendCounter((prevCount) => prevCount - 1);
    numberSubmitHandler(new Event('resendOtp'));
  }
};


  useEffect(() => {
    const phSubmit = document.getElementById("phSubmit");
    if (phoneNum) {
      phSubmit.removeAttribute("disabled");
    } else {
      phSubmit.setAttribute("disabled", true);
    }
  }, [phoneNum]);

  useEffect(() => {
    const OTPSubmit = document.getElementById("OTPSubmit");
    if (Otp) {
      OTPSubmit.removeAttribute("disabled");
    } else {
      OTPSubmit.setAttribute("disabled", true);
    }
  }, [Otp]);

  const numberChangeHandler = (event) => {
    setPhoneNum(event.target.value);
  };

  const numberSubmitHandler = (event) => {
    event.preventDefault();
    if (!phoneNum) {
      displayPhErr("top", "Enter A Valid Phone Number");
      return;
    }
    // phone number validation for Indian and International
    if (phoneNum.length !== 10) {
      displayPhErr("top", "Enter A Valid Phone Number");
      return;
    }
    if (!/^\d+$/.test(phoneNum)) {
      displayPhErr("top", "Enter A Valid Phone Number");
      return;
    }

    setIsSubmitting(true);

    // Send OTP API call
    const data = {
      Authenticated: "",
      MobileNo: phoneNum,
      OTP: "",
    };

    const url = "http://180.235.120.78/NewHIS/api/his/sendotp_Portal";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Success:", responseData);
        displaySent("top", "OTP sent...");
        setHidePhInput(true);
        setOTPBox(false);
        setCanResend(false); // Disable resend button
        setTimer(60); // Reset timer
      })
      .catch((error) => {
        displayPhErr("top", "Couldn't Send OTP Please Try Again");
        console.error("Error:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const OTPSubmitHandler = (event) => {
    event.preventDefault();
    const url = `http://180.235.120.78/NewHIS/api/his/AuthenticateMobNo_Upload_V1?OTP_MobileNo=${phoneNum}&Otp=${Otp}`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.length === 1 && data[0].response === "OTP Mismatch") {
          displayOTPErr("top", "OTP Invalid");
        } else if (data.length === 0) {
          error();
        } else {
          navigate(`/signature/${data[0].sno}`, { state: { data: data } });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        displayOTPErr("top", "Couldn't Verify OTP Please Try Again");
      });

    setOtp("");
    setPhoneNum("");
  };

  const OtpChangeHandler = (event) => {
    setOtp(event.target.value);
  };


  return (
    <section className={styles.Home}>
      {phContextHolder}
      {OTPContextHolder}
      {sentContextHolder}

      <form
        onSubmit={numberSubmitHandler}
        className={` ${hidePhInput ? styles.hide : styles.numberForm}`}>
        <label htmlFor="telephone-number">Mobile Number:</label>
        <input
          type="text"
          name="telephone-number"
          id="telephone-number"
          value={phoneNum}
          onChange={numberChangeHandler} required/>
        <button type="submit" id="phSubmit" disabled={isSubmitting}>
          Submit
        </button>
      </form>

      <div className={`${OTPBox ? styles.hide : styles.OTPBox}`}>
        <form onSubmit={OTPSubmitHandler}>
          <label htmlFor="otp">Enter OTP:</label>
          <input type="text" value={Otp} onChange={OtpChangeHandler} required />
          <button type="submit" id="OTPSubmit">
            Verify OTP
          </button>
        </form>

        <button
        onClick={resendOtpHandler}
        disabled={isResendDisabled || resendCounter === 0}
        className={`${styles.button} ${styles.resendButton}`}>
        Resend OTP {isResendDisabled && `(${timer}s)`}
        </button>
      </div>
    </section>
  );
};

export default Home;
