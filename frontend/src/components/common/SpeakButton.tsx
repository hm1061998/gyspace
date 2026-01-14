import React, { useState } from "react";
import { SpeakerIcon, SpeakerWaveIcon } from "./icons";

interface SpeakButtonProps {
  text: string;
  lang?: "zh-CN" | "vi-VN";
  className?: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  lang = "zh-CN",
  className = "",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for better clarity

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-1.5 rounded-full transition-all hover:bg-slate-100 text-slate-400 hover:text-red-500 active:scale-90 ${className} ${
        isSpeaking ? "text-red-500 bg-red-50 animate-pulse" : ""
      }`}
      title={
        lang === "zh-CN"
          ? "Nghe phát âm tiếng Trung"
          : "Nghe phát âm tiếng Việt"
      }
    >
      {isSpeaking ? (
        <SpeakerWaveIcon className="w-5 h-5" />
      ) : (
        <SpeakerIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default SpeakButton;
