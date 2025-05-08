import React, { useEffect, useRef } from "react";
import "./GameOutput.css";
import Options from "./Options";
import LoadingOverlay from "./LoadingOverlay";
import { MoralAlignment } from '../types/story';

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment;
  traitAlignment?: string;
}

interface GameOutputProps {
  output: string[];
  genre: string;
  turnCount: number;
  isLoading: boolean;
  options: { [key: string]: { text: string; risk: string } };
  isFinal: boolean;
  handleOptionsClick: (option: Option) => void;
}

const GameOutput: React.FC<GameOutputProps> = ({
  output,
  genre,
  turnCount,
  isLoading,
  options,
  isFinal,
  handleOptionsClick,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [output, isLoading]);

  // Normalize options to ensure alignment is present
  const normalizedOptions = Object.entries(options).reduce((acc, [key, option]) => {
    acc[key] = {
      ...option,
      alignment: 'neutral' as MoralAlignment,
      traitAlignment: undefined
    };
    return acc;
  }, {} as { [key: string]: Option });

  return (
    <div className="game-output component-container">
      <div className="game-output-info">
        <p>Genre: {genre}</p>
        <p>Turns: {turnCount}</p>
      </div>
      <div className="game-output-content" ref={contentRef}>
        {output.map((text, index) => (
          <div key={index}>
            <p>{text + "\n"}</p>
            {index === output.length - 1 &&
              !isLoading &&
              !isFinal && (
                <Options options={normalizedOptions} handleClick={handleOptionsClick} />
              )}
          </div>
        ))}
      </div>
      <LoadingOverlay show={isLoading} />
    </div>
  );
};

export default GameOutput;
