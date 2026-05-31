import React, { useCallback } from "react";

interface ResultScreenProps {
  photoUrl: string;
  onRetake: () => void;
  onHome: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  photoUrl,
  onRetake,
  onHome,
}) => {
  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `gdg-noida-selfie-${Date.now()}.jpg`;
    a.click();
  }, [photoUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        // Convert dataURL → Blob → File for Web Share API
        const res   = await fetch(photoUrl);
        const blob  = await res.blob();
        const file  = new File([blob], "gdg-noida-selfie.jpg", {
          type: "image/jpeg",
        });

        await navigator.share({
          title: "I Am GDG Noida 🎽",
          text: "#IAmGDGNoida #GDGNoida — Take your jersey selfie!",
          files: [file],
        });
      } catch (err) {
        console.error("Share failed:", err);
        handleDownload();
      }
    } else {
      handleDownload();
    }
  }, [photoUrl, handleDownload]);

  return (
    <div className="result-screen">
      <div className="result-header">
        <h2>Your GDG Noida Look! 🎽</h2>
        <p className="result-tagline">#IAmGDGNoida</p>
      </div>

      <div className="result-photo-wrapper">
        <img
          src={photoUrl}
          alt="Your GDG Noida selfie"
          className="result-photo"
        />
      </div>

      <div className="result-actions">
        <button className="action-btn primary-btn" onClick={handleShare}>
          📱 Share to Story
        </button>
        <button className="action-btn secondary-btn" onClick={handleDownload}>
          ⬇ Download
        </button>
        <button className="action-btn ghost-btn" onClick={onRetake}>
          🔄 Retake
        </button>
        <button className="action-btn ghost-btn" onClick={onHome}>
          🏠 Home
        </button>
      </div>

      <p className="share-tip">
        Share on Instagram Stories with <strong>#IAmGDGNoida</strong>
      </p>
    </div>
  );
};

export default ResultScreen;
