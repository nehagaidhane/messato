import "./SlideCard.css";

const SlideCard = ({ image, text }) => {
  return (
    <div className="slide">
      <img src={image} alt="slide" className="slide-img" />
      <p className="slide-text">{text}</p>
    </div>
  );
};

export default SlideCard;