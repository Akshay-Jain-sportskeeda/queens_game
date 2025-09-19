import React, { useState } from 'react';
import styles from '../styles/PFSNHeader.module.css';

interface HeaderProps {
  currentPage?: 'CBB' | 'CFB' | 'Fantasy' | 'MLB' | 'NASCAR' | 'NBA' | 'NFL' | 'NHL' | 'Tennis' | 'WNBA' | 'WWE';
  logoUrl?: string;
  logoAlt?: string;
}

const PFSNHeader: React.FC<HeaderProps> = ({ 
  currentPage = 'NFL',
  logoUrl = "https://statico.profootballnetwork.com/wp-content/uploads/2025/06/12093424/tools-navigation-06-12-25.jpg",
  logoAlt = "PFSN Logo"
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock/unlock body scroll when mobile menu opens/closes
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'CBB', href: 'https://www.profootballnetwork.com/mens-cbb/' },
    { label: 'CFB', href: 'https://www.profootballnetwork.com/cfb/' },
    { label: 'Fantasy', href: 'https://www.profootballnetwork.com/fantasy-football/' },
    { label: 'MLB', href: 'https://www.profootballnetwork.com/mlb/' },
    { label: 'NASCAR', href: 'https://www.profootballnetwork.com/nascar/' },
    { label: 'NBA', href: 'https://www.profootballnetwork.com/nba/' },
    { label: 'NFL', href: 'https://www.profootballnetwork.com/nfl/' },
    { label: 'NHL', href: 'https://www.profootballnetwork.com/nhl/' },
    { label: 'Tennis', href: 'https://www.profootballnetwork.com/tennis/' },
    { label: 'WNBA', href: 'https://www.profootballnetwork.com/wnba/' },
    { label: 'WWE', href: 'https://www.profootballnetwork.com/wwe-player-guessing-game/' },
  ];

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };
  return (
    <>
      {/* Top Navigation Bar */}
      <div className={styles.pfsnHeaderWrap}>
        <div className={styles.pfsnHeaderContainer}>
          <button 
            className={styles.mobileMenuToggle}
            onClick={handleMenuToggle}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
          
          <div className={styles.pfsnLogoSection}>
            <a href="https://www.profootballnetwork.com" target="_blank" rel="noopener noreferrer">
              <img 
                src={logoUrl}
                alt={logoAlt}
                className={styles.pfsnLogo}
                width="300"
                height="124"
              />
            </a>
            <span className={styles.mobileGameTitle}>NFL Octobox</span>
          </div>
          
          <div className={styles.pfsnTagline}>
            {/* Empty for spacing */}
          </div>
          
          <nav className={`${styles.pfsnMainNav} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
            <ul className={styles.navMenu}>
              {navItems.map((item) => (
                <li key={item.label} className={currentPage === item.label ? styles.currentPage : ''}>
                  <a 
                    href={item.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={handleMenuClose}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenuOverlay} ${mobileMenuOpen ? styles.active : ''}`} onClick={handleMenuClose}></div>
    </>
  );
};

export default PFSNHeader;