import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FAQ.css";

const faqs = [
  {
    question: "What is Shubham Cuisine tiffin service?",
    answer:
      "A tiffin service providing healthy homemade meals delivered daily.",
  },
  {
    question: "What cuisines do we offer?",
    answer: "We offer Indian home-style meals.",
  },
  {
    question: "What is our delivery area?",
    answer: "Within 2-5 km radius.",
  },
  {
    question: "Do we deliver at doorsteps?",
    answer: "Yes, we deliver to your doorstep.",
  },
  {
    question: "How often do we deliver?",
    answer: "Daily lunch and dinner.",
  },
];

const FAQ = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  return (
    <div className="faq-container">
      {/* Header */}
      <div className="faq-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>FAQ</h3>
      </div>

      {/* Image */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/1040/1040230.png"
        className="faq-img"
        alt="faq"
      />

      {/* Questions */}
      {faqs.map((item, index) => (
        <div key={index} className="faq-item">
          <div
            className="faq-question"
            onClick={() => setActive(active === index ? null : index)}
          >
            {item.question}
            <span>⬇</span>
          </div>

          {active === index && (
            <div className="faq-answer">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQ;