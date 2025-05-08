// src/components/Options.tsx
import React from "react";
import "./Options.css";
import { MoralAlignment } from '../types/story';

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment; // 이 속성 추가
  traitAlignment?: string; // 이 속성 추가 (선택적)
}

interface OptionsProps {
  options: { [key: string]: Option };
  handleClick: (option: Option) => void; // Update the type here
}

const Options: React.FC<OptionsProps> = ({ options, handleClick }) => {
  return (
    <div className="options">
      {Object.entries(options).map(([optionKey, option]) => (
        <button
          onClick={() => handleClick(option)} // Pass the whole option object
          key={optionKey}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};

export default Options;
