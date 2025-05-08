import React, { useState, useContext } from "react";
import { AppContext } from "../AppContext";
import "./CharacterImageSelection.css";
import { useTranslation } from 'react-i18next';

const CharacterImageSelection: React.FC = () => {
  const { t } = useTranslation();
  const { state, setState } = useContext(AppContext);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("1.png");

  const characters = Array.from({ length: 32 }, (_, i) => `${i + 1}.png`);

  const handleSelectCharacter = (character: string) => {
    setSelectedCharacter(character);
  };

  const handleSubmitCharacter = () => {
    setState({
      ...state,
      chosenImage: `/characters/${selectedCharacter}`,
      gameState: "characterSelection",
    });
  };

  return (
    <>
      <div className="selected-character-display">
        <img
          src={`/characters/${selectedCharacter}`}
          alt="Selected Character"
          className="selected-character-image"
        />
        <button className="pulse-button" onClick={handleSubmitCharacter}>
          {t('Choose me')}
        </button>
      </div>
      <div className="character-image-selection-container">
        {characters.map((character, index) => (
          <button
            key={index}
            className={`character-image-button ${
              selectedCharacter === character ? "selected" : ""
            }`}
            onClick={() => handleSelectCharacter(character)}
          >
            <img
              src={`/characters/${character}`}
              alt={`Character ${index + 1}`}
            />
          </button>
        ))}
      </div>
    </>
  );
};

export default CharacterImageSelection;
