import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';

// Import Assets
import mindHackImg from '../assets/MindHack.jpg';
import showcaseImg from '../assets/showcase.jpg';
import friendGetFriendImg from '../assets/Friendgetfriend.png';

type PromoCard = {
  title: string;
  subtitle: string;
  image: string;
  href?: string;
};

const PROMOS: PromoCard[] = [
  {
    title: 'MineHack International 2025',
    subtitle: 'Moments and experiences from an international competition where students showcased their problem-solving, analytical thinking, and teamwork skills.',
    image: mindHackImg,
    href: 'https://www.facebook.com/share/p/1anx9tM45W/',
  },
  {
    title: 'Project Showcase',
    subtitle: 'Real student projects created during the learning journey, highlighting growth in coding skills and structured design thinking.',
    image: showcaseImg,
    href: 'https://www.facebook.com/share/p/1A7oz28vEb/',
  },
  {
    title: 'Friend Get Friend',
    subtitle: 'Invite your friends to join CIY.CLUB and enjoy special rewards together. Learn, share, and grow coding skills with friends.',
    image: friendGetFriendImg,
    href: 'https://line.me/R/ti/p/@862omjdr',
  },
];

export function Landing() {
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSlideInterval = 5000;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === PROMOS.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? PROMOS.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <section className="bg-white min-h-screen">
      {/* ✅ Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-b from-sky-50 to-white rounded-[2.5rem] p-10 md:p-16 border border-sky-100 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-slate-900 tracking-tight">
              {t('landingTitle')}
            </h1>
            <p className="text-lg text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed">
              {t('landingDesc')}
            </p>
           <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
  <Button
    variant="primary" // ✅ ใช้ค่าเดิมที่ระบบรองรับ
    size="lg"        // ✅ แก้จาก "xl" เป็น "lg"
    onClick={() => navigate('/parent')}
    className="px-10 shadow-lg shadow-sky-200 h-14 text-lg font-bold"
  >
    {t('parentLogin')}
  </Button>
  <Button
    variant="blue"    // ✅ แก้จาก "outline" เป็น "blue" (ตามที่ Button.tsx คุณมี)
    size="lg"        // ✅ แก้จาก "xl" เป็น "lg"
    onClick={() => navigate('/coach')}
    className="px-10 h-14 text-lg font-bold"
  >
    {t('coachLogin')}
  </Button>
</div>
          </div>
        </div>

        {/* ✅ Carousel Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Featured Activities</h2>
              <div className="h-1.5 w-20 bg-sky-500 rounded-full mt-2"></div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={prevSlide} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-400 hover:text-sky-600 transition-all shadow-sm">
                <span className="text-2xl font-light">‹</span>
              </button>
              <button onClick={nextSlide} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-400 hover:text-sky-600 transition-all shadow-sm">
                <span className="text-2xl font-light">›</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-2xl">
            <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {PROMOS.map((p, index) => (
                <div key={index} className="w-full shrink-0 flex flex-col md:flex-row items-center">
                  <div className="w-full md:w-[55%] aspect-video md:aspect-square lg:aspect-video overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover" alt={p.title} />
                  </div>
                  <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col justify-center bg-white">
                    <span className="text-sky-600 font-bold text-sm tracking-widest uppercase mb-3">CIY Highlight</span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-5 leading-tight">{p.title}</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed text-base md:text-lg">{p.subtitle}</p>
                    <a href={p.href} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors w-fit">
                      Learn More
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-6 left-1/2 md:left-auto md:right-12 -translate-x-1/2 md:translate-x-0 flex gap-2.5">
              {PROMOS.map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)} className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-8 bg-sky-500' : 'w-2.5 bg-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Footer */}
      <footer className="w-full border-t border-slate-100 bg-slate-50 mt-20">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-500">© 2025 CIY.Club Thailand. All rights reserved.</p>
              <p className="text-xs text-slate-400 mt-1">Designed by <span className="font-semibold text-slate-600">pranai_haamton</span></p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a href="https://www.facebook.com/ciyclubthailand" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.061C22 6.505 17.523 2 12 2S2 6.505 2 12.061c0 5.021 3.657 9.183 8.438 9.938v-7.03h-2.54V12.06h2.54V9.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.913h2.773l-.443 2.89h-2.33v7.03C18.343 21.244 22 17.082 22 12.061z"/></svg>
              </a>
              {/* Line */}
              <a href="https://lin.ee/qUqJPay" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-green-500 hover:border-green-200 transition-all shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 5.145 2 9.022c0 1.554.72 2.976 1.933 4.108-.184.664-.666 2.373-.762 2.768-.112.459.208.45.437.3l3.197-2.1c.38.106.778.162 1.195.162 5.523 0 10-3.145 10-7.022S17.523 2 12 2z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/CIYCLUBTHAILAND" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-pink-500 hover:border-pink-200 transition-all shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              {/* Youtube */}
              <a href="https://www.youtube.com/@CIYClubTH" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}