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
  const navigate = useNavigate();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="home-button">
            {t('Home')}
          </Link>
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