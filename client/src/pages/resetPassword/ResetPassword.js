import React, { useState } from "react";
import "./ResetPassword.scss";
import { useNavigate, useParams } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axiosClient.put(`/auth/resetPassword/${params.token}`, {
        password,
      });
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="reset-password">
      <div className="resetPassword-box">
        <h2 className="heading">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            className="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input type="submit" className="submit" />
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
