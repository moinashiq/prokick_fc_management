import React from 'react';
import { CLUB_ASSETS } from '../data/initialSquad';

interface HeaderProps {
  title: string;
  onOpenCoachModal: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenCoachModal,
  isAuthenticated,
  onLogout,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#060e20]/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-b border-[#222a3d]/60 pt-safe">
      <div className="h-16 px-4 md:px-6 max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Club Crest & Titles */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={CLUB_ASSETS.crestUrl}
            alt="PROKICK FC Crest"
            className="h-9 w-auto object-contain shrink-0 drop-shadow-[0_0_8px_rgba(195,244,0,0.3)]"
          />
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-label-caps-sm text-[11px] text-[#c3f400] tracking-wider uppercase truncate">
              PROKICK FC
            </span>
            <span className="font-headline-md text-xl md:text-2xl uppercase tracking-tight text-[#dae2fd] truncate leading-none mt-0.5">
              {title}
            </span>
          </div>
        </div>

        {/* Right: Live Pill, Authentication Status, and Coach Avatar */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#131b2e] border border-[#2d3449] hover:border-[#ffb4ab]/50 text-[#bfc5e4] hover:text-[#ffdad6] text-[10px] font-label-caps-sm uppercase tracking-wider transition-all cursor-pointer"
              title="Lock portal terminal & log out"
            >
              <span className="material-symbols-outlined text-[13px] text-[#ffb4ab]">
                lock
              </span>
              <span className="hidden sm:inline">Lock Portal</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#93000a]/20 border border-[#93000a]/40 text-[#ffb4ab] text-[10px] font-label-caps-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              <span className="hidden sm:inline">Locked</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#222a3d] border border-[#2d3449] shadow-[0_0_12px_rgba(195,244,0,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse-glow"></span>
            <span className="font-label-caps-sm text-[11px] uppercase text-[#c3f400] font-bold tracking-widest">
              LIVE
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenCoachModal}
            aria-label="Head Coach Profile"
            className="w-10 h-10 rounded-full p-0.5 ring-2 ring-[#c3f400]/40 hover:ring-[#c3f400] transition-all overflow-hidden flex items-center justify-center bg-[#171f33] cursor-pointer"
            title="Head Coach Profile & Pitch Settings"
          >
            <img
              src={CLUB_ASSETS.coachAvatarUrl}
              alt="Coach Rajnish Shankar"
              className="w-full h-full rounded-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
