import React, { useState } from "react";
import "./ForgotPassword.scss";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axiosClient.post("/auth/forgetPassword", {
        email,
      });
      navigate(`/resetPassword/${response.result}`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password-box">
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input type="submit" className="submit" />
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
