import React from 'react';
import { CLUB_ASSETS } from '../data/initialSquad';

interface HeaderProps {
  title: string;
  onOpenCoachModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenCoachModal }) => {
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

        {/* Right: Live Pill & Coach Profile Avatar */}
        <div className="flex items-center gap-3 shrink-0">
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
            className="w-10 h-10 rounded-full p-0.5 ring-2 ring-[#c3f400]/40 hover:ring-[#c3f400] transition-all overflow-hidden flex items-center justify-center bg-[#171f33]"
            title="Head Coach Profile & Pitch Settings"
          >
            <img
              src={CLUB_ASSETS.coachAvatarUrl}
              alt="Coach Marcus Vance"
              className="w-full h-full rounded-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
