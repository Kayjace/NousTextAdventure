import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../AppContext";
import "./GenreSelection.css";

interface GenreSelectionProps {
  genres: string[];
}

const GenreSelection: React.FC<GenreSelectionProps> = ({ genres }) => {
  const { state, setState } = useContext(AppContext);
  const [customGenre, setCustomGenre] = useState<string>("");
  const { t } = useTranslation();

  const handleCustomGenreChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomGenre(event.target.value);
  };

  const handleCustomGenreSubmit = () => {
    if (customGenre.trim()) {
      setState({
        ...state,
        chosenGenre: customGenre,
        gameState: "characterImageSelection",
      });
    }
  };

  return (
    <>
      <h2>{t('Select a genre:')}</h2>
      <div className="custom-genre-input">
        <input
          type="text"
          placeholder={t('Enter custom genre')}
          required
          value={customGenre}
          onChange={handleCustomGenreChange}
        />
        <button onClick={handleCustomGenreSubmit}>{t('Submit Genre')}</button>
      </div>
      <div className="genre-selection-container">
        {genres.map((genre, index) => (
          <button
            key={genre}
            onClick={() => {
              setCustomGenre(genre);
            }}
          >
            {genre}
          </button>
        ))}
      </div>
    </>
  );
};

export default GenreSelection;
