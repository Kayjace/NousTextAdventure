import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fetchGenres from './fetchGenres';

const useFetchGenres = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      // 현재 언어를 fetchGenres에 전달
      const genresData = await fetchGenres(i18n.language);
      setGenres(genresData);
    };

    fetchData();
  }, [i18n.language]); // 언어가 변경될 때마다 다시 실행

  return genres;
};

export default useFetchGenres;
