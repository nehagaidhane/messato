import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Group 37.png";
import "./Splash.css";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/onboarding");
    }, 8000);
  }, []);

  return (
    <div className="splash-container">

         {/* 🔵 Blue Line Background */}
      <div className="bg-lines">
        <div className="line l1"></div>
        <div className="line l2"></div>
        <div className="line l3"></div>
        <div className="line l4"></div>
        <div className="line l5"></div>
      </div>

      <div className="splash-content">
        <img src={logo} alt="logo" className="logo" />
        <h1 className="brand">Messato</h1>

        <p className="tagline">
          " Daily Mess " " Home Kitchens " <br />
          " Subscription "
        </p>
      </div>
    </div>
  );
};

export default Splash;