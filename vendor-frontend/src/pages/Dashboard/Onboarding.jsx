import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ ADD THIS
import SlideCard from "../../components/SlideCard";
import "./Onboarding.css";

import food1 from "../../assets/food2.jpeg";
import food2 from "../../assets/food1.jpeg";
import food3 from "../../assets/food3.jpeg";
import food4 from "../../assets/food4.jpeg";

const slides = [
  {
    image: food1,
    text: "Ghar Ka Swad, Office Tak Pure Veg Tiffins!",
  },
  {
    image: food2,
    text: "Maa Ke Haath Jaisa Swad, Roz Office Tak",
  },
  {
    image: food3,
    text: "Office Ho Ya Ghar, Swad Ho Ghar Jaisa",
  },
  {
    image: food4,
    text: "Ghar ka Swad, Rozana Time Par Tiffin",
  }
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate(); // ✅ ADD

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      // ✅ LAST SLIDE → GO TO LOGIN
      navigate("/login");
    }
  };

  return (
    <div className="onboarding-container">

            {/* 🔵 Background Half Circles */}
            
    <div className="circle left"></div>
    <div className="circle right"></div>

      <SlideCard
        image={slides[current].image}
        text={slides[current].text}
      />

      {/* Dots */}
      <div className="dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={index === current ? "dot active" : "dot"}
          ></span>
        ))}
      </div>

      <button className="next-btn" onClick={nextSlide}>
        {current === slides.length - 1 ? "GET STARTED" : "NEXT"}
      </button>

      <p className="skip" onClick={() => navigate("/login")}>
        Skip
      </p>
    </div>
  );
};

export default Onboarding;