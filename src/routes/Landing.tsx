import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';

export function Landing() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <section className="max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-8 shadow-strong">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-sky-900">
          {t('landingTitle')}
        </h1>
        <p className="text-sky-700/80 mt-3">
          {t('landingDesc')}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/parent')}
            className="text-center"
          >
            {t('parentLogin')}
          </Button>
          <Button 
            variant="blue" 
            size="lg"
            onClick={() => navigate('/coach')}
            className="text-center"
          >
            {t('coachLogin')}
          </Button>
        </div>
      </div>
    </section>
  );
}