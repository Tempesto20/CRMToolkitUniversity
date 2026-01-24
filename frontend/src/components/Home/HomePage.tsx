import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.scss';

const HomePage: React.FC = () => {
  return (
    <div className={styles.homePage}>
      <div className={styles.heroSection}>
        <h1>Система управления персоналом и техникой</h1>
        <p className={styles.subtitle}>
          Комплексная система для управления сотрудниками, локомотивами и производственными процессами
        </p>
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>👥</div>
          <h3>Управление персоналом</h3>
          <p>Добавление, редактирование и отслеживание информации о сотрудниках</p>
          <Link to="/add-employee" className={styles.featureLink}>
            Добавить сотрудника →
          </Link>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🚂</div>
          <h3>Управление локомотивами</h3>
          <p>Контроль за состоянием и распределением локомотивного парка</p>
          <Link to="/locomotives" className={styles.featureLink}>
            Перейти к локомотивам →
          </Link>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📅</div>
          <h3>Отпуска и графики</h3>
          <p>Управление отпусками сотрудников и рабочими графиками</p>
          <Link to="/leaves" className={styles.featureLink}>
            Управление отпусками →
          </Link>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🏭</div>
          <h3>Производственные ресурсы</h3>
          <p>Управление местами работы, службами и видами работ</p>
          <Link to="/work-types" className={styles.featureLink}>
            Смотреть ресурсы →
          </Link>
        </div>
      </div>

      <div className={styles.statsSection}>
        <h2>Быстрый доступ</h2>
        <div className={styles.quickLinks}>
          <Link to="/add-employee" className={styles.quickLink}>
            <span className={styles.quickIcon}>➕</span>
            Добавить сотрудника
          </Link>
          <Link to="/locomotives" className={styles.quickLink}>
            <span className={styles.quickIcon}>🚂</span>
            Локомотивы
          </Link>
          <Link to="/leaves" className={styles.quickLink}>
            <span className={styles.quickIcon}>📅</span>
            Отпуска
          </Link>
          <Link to="/employees" className={styles.quickLink}>
            <span className={styles.quickIcon}>👥</span>
            Все сотрудники
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;