// UserInput.tsx
import './UserInput.css';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // i18n 훅 추가

interface UserInputProps {
  handleSubmit: ((input: string) => void) | null;
}

const UserInput: React.FC<UserInputProps> = ({ handleSubmit }) => {
  const [input, setInput] = useState('');
  const { t } = useTranslation(); // 번역 함수 가져오기

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleSubmit) {
      handleSubmit(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={onSubmit} className="component-container user-input">
      <input type="text" value={input} onChange={handleChange} placeholder={t('Enter your choice')} />
      <button type="submit">{t('Submit')}</button>
    </form>
  );
};

export default UserInput;
