// helpers/indexedDB.ts

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("MyStoriesDB", 2);

    openRequest.onerror = () => reject(openRequest.error);
    openRequest.onupgradeneeded = (event) => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains("stories")) {
        const store = db.createObjectStore("stories", { keyPath: "id" });
        store.createIndex("walletAddress", "walletAddress", { unique: false });
      }
    };
    openRequest.onsuccess = () => resolve(openRequest.result);
  });
};

export const getNextIdFromDB = async (): Promise<number> => {
  const db = await openDB();
  const transaction = db.transaction("stories", "readonly");
  const store = transaction.objectStore("stories");

  return new Promise((resolve, reject) => {
    const keysRequest = store.getAllKeys();

    keysRequest.onsuccess = () => {
      const keys: IDBValidKey[] = keysRequest.result;
      const numberKeys = keys.filter(
        (key): key is number => typeof key === "number"
      );
      const maxKey = numberKeys.length > 0 ? Math.max(...numberKeys) : -1;
      resolve(maxKey + 1);
    };
    keysRequest.onerror = () => reject(keysRequest.error);
  });
};

export const assignNewId = async () => {
  const db = await openDB();
  const transaction = db.transaction("stories", "readonly");
  const store = transaction.objectStore("stories");
  const allKeysRequest = store.getAllKeys();

  return new Promise((resolve, reject) => {
    allKeysRequest.onsuccess = () => {
      let keys: any;
      keys = allKeysRequest.result;
      const highestKey = keys.length > 0 ? Math.max(...keys) : 0;
      resolve(highestKey + 1); // Assuming `id` is numeric.
    };
    allKeysRequest.onerror = () => reject(allKeysRequest.error);
  });
};

export const saveOrUpdateStory = async (story: any) => {
  if (!story || typeof story !== 'object') {
    console.error("Invalid story data, not saving.", story);
    return;
  }
  
  // 필수 속성 검사 - 더 엄격하게 체크
  const requiredProps = [
    'chosenCharacter', 
    'chosenGenre', 
    'characterBio', 
    'characterImage',
    'previousParagraph'
  ];
  
  const missingProps = requiredProps.filter(prop => {
    // 속성이 없거나 빈 문자열인 경우
    const propValue = story[prop];
    return propValue === undefined || propValue === null || 
           (typeof propValue === 'string' && propValue.trim() === '');
  });
  
  if (missingProps.length > 0) {
    console.error(`Story data missing required properties: ${missingProps.join(', ')}, not saving.`, story);
    return;
  }
  
  // 스토리 내용이 너무 짧은 경우 저장하지 않음
  if (typeof story.previousParagraph === 'string' && story.previousParagraph.length < 20) {
    console.error("Story content too short, not saving.", story.previousParagraph);
    return;
  }
  
  const walletAddress = localStorage.getItem('current_wallet_address') || 'anonymous';
  console.log(`Preparing to save story for wallet: ${walletAddress}`);
  
  if (story.walletAddress && story.walletAddress !== walletAddress) {
    console.warn("Wallet address changed. Creating a new story copy.");
    const { id, ...storyWithoutId } = story;
    story = storyWithoutId;
  }
  
  story.walletAddress = walletAddress;
  story.lastSaved = new Date().toISOString();
  
  if (!story.id) {
    story.id = await assignNewId();
    console.log(`Assigned new ID: ${story.id} to story`);
  }
  
  try {
    await saveStoryToDB(story);
    console.log(`Story saved successfully. ID: ${story.id}, Wallet: ${walletAddress}, Character: ${story.chosenCharacter}`);
  } catch (error) {
    console.error("Error saving the story:", error);
  }
};

export const saveStoryToDB = async (storyData: any): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction("stories", "readwrite");
  const store = transaction.objectStore("stories");

  return new Promise((resolve, reject) => {
    console.log("Saving story for wallet:", storyData.walletAddress);
    const request = store.put(storyData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const fetchStoriesFromDB = async (): Promise<any[]> => {
  return fetchStoriesFromDBByWallet(localStorage.getItem('current_wallet_address') || 'anonymous');
};

export const fetchStoriesFromDBByWallet = async (walletAddress: string): Promise<any[]> => {
  if (!walletAddress) {
    console.error("Wallet address is empty or undefined");
    return [];
  }

  try {
    const db = await openDB();
    const transaction = db.transaction("stories", "readonly");
    const store = transaction.objectStore("stories");
    
    // 대소문자 구분 없이 모든 스토리를 가져온 후 필터링
    const allStoriesRequest = store.getAll();
    
    return new Promise((resolve, reject) => {
      allStoriesRequest.onsuccess = () => {
        const allStories = allStoriesRequest.result;
        console.log(`Total stories in DB: ${allStories.length}`);
        
        // 지갑 주소 대소문자 구분 없이 비교
        const filteredStories = allStories.filter(story => {
          const storyWallet = (story.walletAddress || '').toLowerCase();
          const searchWallet = walletAddress.toLowerCase();
          const matches = storyWallet === searchWallet;
          console.log(`Comparing wallet: DB=${storyWallet}, Search=${searchWallet}, Match=${matches}`);
          return matches;
        });
        
        console.log(`Found ${filteredStories.length} stories for wallet: ${walletAddress}`);
        resolve(filteredStories);
      };
      allStoriesRequest.onerror = () => {
        console.error("Error fetching stories:", allStoriesRequest.error);
        reject(allStoriesRequest.error);
      };
    });
  } catch (error) {
    console.error("Error opening DB:", error);
    return [];
  }
};

export const deleteStoryFromDB = async (id: number): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction("stories", "readwrite");
  const store = transaction.objectStore("stories");

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadStoryFromDB = async (id: number): Promise<any> => {
  const db = await openDB();
  const transaction = db.transaction("stories", "readonly");
  const store = transaction.objectStore("stories");

  return new Promise((resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
