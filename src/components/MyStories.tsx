// MyStories.tsx

import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next"; // i18n 훅 추가
import {
  fetchStoriesFromDB,
  fetchStoriesFromDBByWallet,
  deleteStoryFromDB,
  loadStoryFromDB,
} from "../helpers/indexedDB";
import { AppContext } from "../AppContext";
import "./MyStories.css";

type Story = {
  id: number;
  chosenCharacter: string;
  previousParagraph: string;
  characterImage: string;
  walletAddress?: string;
  lastSaved?: string;
};

const MyStories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(); // 번역 함수 가져오기

  // 지갑 주소 변경 감지하여 스토리 다시 로드
  useEffect(() => {
    const checkWalletAndLoadStories = async () => {
      const walletAddress = localStorage.getItem('current_wallet_address');
      
      // 지갑 주소가 변경된 경우에만 스토리 다시 로드
      if (walletAddress !== currentWallet) {
        setCurrentWallet(walletAddress);
        await loadStoriesForCurrentWallet();
      }
    };
    
    // 초기 로드
    checkWalletAndLoadStories();
    
    // 지갑 연결 상태 변경 감지를 위한 이벤트 리스너
    const walletChangeInterval = setInterval(checkWalletAndLoadStories, 2000);
    
    return () => {
      clearInterval(walletChangeInterval);
    };
  }, [currentWallet]);

  // 수동으로 스토리 다시 로드하는 함수
  const refreshStories = () => {
    loadStoriesForCurrentWallet();
  };

  const loadStoriesForCurrentWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const walletAddress = localStorage.getItem('current_wallet_address') || 'anonymous';
      console.log("Loading stories for wallet:", walletAddress);
      
      // IndexedDB에서 직접 모든 스토리 가져오기
      const fetchedStories = await fetchStoriesFromDBByWallet(walletAddress);
      
      // 불완전한 스토리 필터링 및 자동 삭제
      const invalidStories: number[] = [];
      const validStories = fetchedStories.filter(story => {
        // 필수 속성 확인
        const hasRequiredProps = 
          story.chosenCharacter && 
          story.characterBio && 
          story.characterImage && 
          story.previousParagraph;
        
        // 스토리 내용이 충분히 있는지 확인
        const hasContent = 
          typeof story.previousParagraph === 'string' && 
          story.previousParagraph.length >= 20;
        
        const isValid = hasRequiredProps && hasContent;
        if (!isValid && story.id) {
          console.log(`Filtering out incomplete story ID ${story.id}`);
          invalidStories.push(story.id);
        }
        return isValid;
      });
      
      // 불완전한 스토리 자동 삭제
      if (invalidStories.length > 0) {
        console.log(`Auto-deleting ${invalidStories.length} incomplete stories`);
        for (const id of invalidStories) {
          try {
            await deleteStoryFromDB(id);
          } catch (err) {
            console.error(`Failed to delete incomplete story ${id}:`, err);
          }
        }
      }
      
      console.log(`Found ${fetchedStories.length} stories, ${validStories.length} valid for wallet ${walletAddress}:`, 
        validStories.map(s => ({ 
          id: s.id, 
          character: s.chosenCharacter, 
          wallet: s.walletAddress,
          lastSaved: s.lastSaved 
        }))
      );
      
      // 최신 저장 순으로 정렬
      const sortedStories = [...validStories].sort((a, b) => {
        const dateA = a.lastSaved ? new Date(a.lastSaved).getTime() : 0;
        const dateB = b.lastSaved ? new Date(b.lastSaved).getTime() : 0;
        return dateB - dateA; // 내림차순 정렬
      });
      
      setStories(sortedStories);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      setError(t('Failed to load stories'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteStoryFromDB(id);
      setStories(stories.filter((story) => story.id !== id));
      alert(t('Story deleted!'));
    } catch (error) {
      console.error("Failed to delete story:", error);
    }
  };

  const { setState, state } = useContext(AppContext);

  const handleLoad = async (id: number) => {
    try {
      const storyData = await loadStoryFromDB(id);
      console.log("Loading story data:", storyData);
      
      const apiKeySave = state.apiKey;
      setState(storyData);
      setState((prevState) => ({
        ...prevState,
        apiKey: apiKeySave,
        isLoading: false,
        gameState: storyData.isFinal ? "endingScreen" : "playing"
      }));
      alert(t('Story loaded!'));
    } catch (error) {
      console.error("Failed to load story:", error);
    }
  };

  const truncate = (input: string, num: number) => {
    if (!input) return "";
    const words = input.split(" ");
    return words.length > num ? `${words.slice(0, num).join(" ")}...` : input;
  };

  // 마지막 저장 시간 포맷팅
  const formatLastSaved = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      {currentWallet && (
        <div className="wallet-info-message">
          {t('Showing stories for wallet')}: {`${currentWallet.substring(0, 6)}...${currentWallet.substring(currentWallet.length - 4)}`}
          <button onClick={refreshStories} className="refresh-button">
            {loading ? t('Loading...') : t('Refresh')}
          </button>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-message">{t('Loading stories...')}</div>
      ) : stories.length > 0 ? (
        <div className="stories-container">
          {stories.map((story) => (
            <div className="story-card" key={story.id}>
              <div className="card-content-story">
                <h3 className="character-name-story">
                  {story.chosenCharacter}
                </h3>
                <div className="story-meta">
                  <span>ID: {story.id}</span>
                  {story.lastSaved && (
                    <span>{t('Saved')}: {formatLastSaved(story.lastSaved)}</span>
                  )}
                </div>
                <img
                  className="character-image-story"
                  src={story.characterImage}
                  alt={story.chosenCharacter}
                />
                <p className="story-paragraph">
                  {truncate(story.previousParagraph, 50)}
                </p>
              </div>
              <div className="card-buttons">
                <button onClick={() => handleDelete(story.id)}>{t('Delete')}</button>
                <button onClick={() => handleLoad(story.id)}>{t('Load')}</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-stories-message">
          {currentWallet 
            ? t('No saved stories available for this wallet')
            : t('No saved stories available')}
        </div>
      )}
    </>
  );
};

export default MyStories;
