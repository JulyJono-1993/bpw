import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store/AppContext';

export default function Header() {
  const navigate = useNavigate();
  const { settings } = useAppContext();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-60 bg-surface-container-lowest/80 backdrop-blur-xl h-16 flex justify-between items-center px-4 border-b border-outline-variant/30">
      <div
        className="cursor-pointer leading-tight"
        onClick={() => navigate('/')}
      >
        <h1 className="font-inter text-xl text-primary font-bold tracking-tight">
          {settings.orgName}
        </h1>
        {settings.regionName && (
          <p className="text-[10px] text-on-surface-variant -mt-0.5">{settings.regionName}</p>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-on-surface">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-on-surface"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
