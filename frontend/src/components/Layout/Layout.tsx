import React from 'react';
import Header from '../Header/Header';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© {new Date().getFullYear()} Курсовая работа Суткового Алексея Максимович</p>
          <p className={styles.footerSubtext}>
            Разработка информационной системы по управлению персоналом
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;