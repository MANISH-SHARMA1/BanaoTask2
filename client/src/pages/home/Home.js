import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { useDispatch } from "react-redux";
import { getMyInfo } from "../../redux/slices/appConfigSlice";

function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      dispatch(getMyInfo());
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div style={{ marginTop: "60px" }}>
        <Outlet />
      </div>
    </>
  );
}

export default Home;