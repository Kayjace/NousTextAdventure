import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Layout.css';
import WalletConnect from '../components/WalletConnect';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  // 강제 페이지 이동 함수
  const forceNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="nav-buttons">
            <a href="/" onClick={(e) => { e.preventDefault(); forceNavigate('/'); }} className="nav-button">
              {t('Home')}
            </a>
            <a href="/leaderboard" onClick={(e) => { e.preventDefault(); forceNavigate('/leaderboard'); }} className="nav-button">
              {t('Leaderboard')}
            </a>
          </div>
          <h1 className="site-title">
            <img src="/logo.webp" alt="Nous Logo" className="site-logo" />
            {t('Nous Text Adventure')}
          </h1>
          <WalletConnect />
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout; 