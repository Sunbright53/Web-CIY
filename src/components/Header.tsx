import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';
import { Button } from './ui/Button';

export function Header() {
  const navigate = useNavigate();
  const { session, lang, setLang, logout } = useAuthStore();
  const { t } = useI18n();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleLanguage = () => {
    setLang(lang === 'th' ? 'en' : 'th');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderSessionBox = () => {
    if (!session.role) return null;

    const roleLabel = session.role === 'coach' 
      ? t('coach')
      : `${t('parent')}${session.parentId ? ' · ' + session.parentId : ''}`;

    return (
      <div className="ml-2 flex items-center gap-2">
        <span className="text-white/70 text-sm">{roleLabel}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          {t('logout')}
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-sky-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://static.wixstatic.com/media/437090_cd922165d6ba4d568dde8680dff0b0df~mv2.png/v1/fill/w_249,h_63,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/437090_cd922165d6ba4d568dde8680dff0b0df~mv2.png" 
            alt="CIY Logo" 
            className="h-9 w-auto"
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.alt = 'Logo failed to load';
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleNavigation('/')}>
            {t('home')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleNavigation('/parent')}>
            {t('parent')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleNavigation('/coach')}>
            {t('coach')}
          </Button>
          
          <button 
            className="ml-1 px-3 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-1"
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            <span 
              className="flag-th"
              style={{ 
                opacity: lang === 'th' ? '1' : '0.35',
                filter: lang === 'th' ? 'none' : 'grayscale(1)'
              }}
            >
              🇹🇭
            </span>
            <span 
              className="flag-en"
              style={{ 
                opacity: lang === 'en' ? '1' : '0.35',
                filter: lang === 'en' ? 'none' : 'grayscale(1)'
              }}
            >
              🇬🇧
            </span>
          </button>
          
          {renderSessionBox()}
        </div>
      </div>
    </header>
  );
}