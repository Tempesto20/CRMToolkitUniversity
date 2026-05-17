import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/employees', label: 'Сотрудники', icon: '👥' },
    { path: '/locomotives', label: 'Локомотивы', icon: '🚂' },
    { path: '/leaves', label: 'Отпуска', icon: '📅' },
    { path: '/location-works', label: 'Районы работы', icon: '📍' },
    { path: '/dispatch-plan', label: 'Раскрепление', icon: '➕' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <span className={styles.logoIcon}>🚂</span>
            <span className={styles.logoText}>CRM - Локомотивный</span>
          </Link>
        </div>

        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Меню"
        >
          <span className={styles.menuIcon}>
            {isMenuOpen ? '✕' : '☰'}
          </span>
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            {navigationLinks.map((link) => (
              <li key={link.path} className={styles.navItem}>
                <Link
                  to={link.path}
                  className={`${styles.navLink} ${
                    location.pathname === link.path ? styles.active : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={styles.navIcon}>{link.icon}</span>
                  <span className={styles.navLabel}>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;