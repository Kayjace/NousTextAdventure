import React, { useState, useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import ImageCarousel from "./components/CharacterImageSelection";
import APIKeyInput from "./components/APIKeyInput";
import GameOutput from "./components/GameOutput";
import CharacterInfo from "./components/CharacterInfo";
import LoadingBar from "./components/LoadingBar";
import GenreSelectionContainer from "./containers/GenreSelectionContainer";
import CharacterSelectionContainer from "./containers/CharacterSelectionContainer";
import useFetchGameData from "./hooks/useFetchGameData";
import { AppContext } from "./AppContext";
import useStoryProgress from "./hooks/useStoryProgress";
import EndingScreen from "./components/EndingScreen";
import GameLoadOrCreate from "./components/GameLoadOrCreate";
import { saveOrUpdateStory } from "./helpers/indexedDB";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";

// API 키 입력 페이지 컴포넌트
const ApiKeyPage: React.FC = () => {
  return (
    <Layout>
      <APIKeyInput />
    </Layout>
  );
};

// 디버깅 래퍼 컴포넌트 - 라우팅과 상태를 추적
const GameWrapper: React.FC = () => {
  return <Game />;
};

// 게임 컴포넌트 - 기존 App 컴포넌트의 내용을 이동
const Game: React.FC = () => {
  const { state, setState } = useContext(AppContext);
  const {
    chosenGenre,
    chosenCharacter,
    characterTraits,
    characterBio,
    chosenImage,
    options,
    gameState,
    storyAndUserInputs,
    turnCount,
    isLoading,
    isFinal,
    wrapUpParagraph,
    bigMoment,
    frequentActivity,
    characterTraitHighlight,
    themeExploration,
  } = state;

  // 상태 변경 디버깅
  useEffect(() => {
    console.log("게임 컴포넌트 내부 상태 변경:", gameState);
  }, [gameState]);

  if (isFinal) {
    setState((prevState) => ({ ...prevState, gameState: "endingScreen" }));
  }

  useEffect(() => {
    if (gameState === "playing") {
      console.log("Saving game state due to options or story update");
      saveOrUpdateStory(state);
    }
  }, [options, storyAndUserInputs, gameState, state]);

  // 추가 저장 트리거 - 턴 카운트 변경 시에도 저장
  useEffect(() => {
    if (turnCount > 0 && gameState === "playing") {
      console.log(`Saving game state due to turn count update: ${turnCount}`);
      saveOrUpdateStory(state);
    }
  }, [turnCount, gameState, state]);

  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  useFetchGameData(setLoadingProgress);

  const handleUserInput = useStoryProgress();

  return (
    <Layout>
      {gameState === "apiKeyInput" && (
        <div>
          <APIKeyInput />
        </div>
      )}
      {gameState === "loadOrCreate" && <GameLoadOrCreate />}
      {gameState === "genreSelection" && <GenreSelectionContainer />}
      {gameState === "characterSelection" && <CharacterSelectionContainer />}
      {gameState === "characterImageSelection" && (
        <div>
          <ImageCarousel />
        </div>
      )}
      {gameState === "loading" && <LoadingBar progress={loadingProgress} />}
      {gameState === "playing" && (
        <div className="playing-container">
          <div className="game-and-user-input">
            <GameOutput
              output={storyAndUserInputs}
              genre={chosenGenre}
              turnCount={turnCount}
              isLoading={isLoading}
              options={options}
              isFinal={isFinal}
              handleOptionsClick={handleUserInput}
              outcomes={state.successfulChoices}
            />
          </div>
          <CharacterInfo
            characterName={chosenCharacter}
            characterTraits={characterTraits}
            characterBio={characterBio}
            characterImage={chosenImage}
          />
        </div>
      )}
      {gameState === "endingScreen" && (
        <EndingScreen
          characterImage={chosenImage}
          output={storyAndUserInputs}
          wrapUpParagraph={wrapUpParagraph}
          bigMoment={bigMoment}
          frequentActivity={frequentActivity}
          characterTraitHighlight={characterTraitHighlight}
          themeExploration={themeExploration}
        />
      )}
    </Layout>
  );
};

// 메인 App 컴포넌트 - 라우팅 설정
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ApiKeyPage />} />
        <Route path="/game" element={<GameWrapper />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;