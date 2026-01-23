// Layout.tsx
import React from 'react';
import Header from './Header/Header';
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
          <p>© {new Date().getFullYear()} Локомотивное депо. Все права защищены.</p>
          <p className={styles.footerSubtext}>
            Система управления персоналом и производственными процессами
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;