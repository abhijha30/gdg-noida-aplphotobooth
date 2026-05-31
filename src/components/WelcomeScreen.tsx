import React from "react";

interface WelcomeScreenProps {
  onStart: () => void;
  selfieCount?: number;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  selfieCount = 0,
}) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="logo-section">
          <img
            src="/gdg-noida-logo.png"
            alt="GDG Noida"
            className="gdg-logo"
          />
        </div>

        {/* FULL jersey image — do NOT crop, do NOT replace */}
        <div className="jersey-showcase">
          <img
            src="/jersey.jpeg.png"
            alt="GDG Noida Jersey"
            className="jersey-full-image"
          />
        </div>

        <div className="title-section">
          <h1 className="main-title">I Am GDG Noida</h1>
          <p className="subtitle">PHOTO BOOTH</p>
          <div className="tagline">
            <span>LEARN</span>
            <span className="dot">•</span>
            <span>BUILD</span>
            <span className="dot">•</span>
            <span>CONNECT</span>
          </div>
        </div>

        {selfieCount > 0 && (
          <p className="selfie-count">{selfieCount} selfies taken today</p>
        )}

        <button className="start-btn" onClick={onStart}>
          📸 Start Photo Booth
        </button>

        <p className="privacy-note">
          Camera access required • No photos are stored on servers
        </p>

        <div className="steps">
          <div className="step">
            <span className="step-icon">📷</span>
            <span>Allow Camera</span>
          </div>
          <div className="step">
            <span className="step-icon">👕</span>
            <span>Wear Jersey</span>
          </div>
          <div className="step">
            <span className="step-icon">🤳</span>
            <span>Take Selfie</span>
          </div>
          <div className="step">
            <span className="step-icon">📱</span>
            <span>Share Story</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
