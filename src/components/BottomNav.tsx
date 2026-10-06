import React from 'react';

export type AppTab = 'access' | 'attendance' | 'registration';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  squadCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  squadCount,
}) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#060e20]/95 backdrop-blur-xl border-t border-[#222a3d]/80 shadow-[0_-4px_24px_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-around h-16 px-3 max-w-lg mx-auto">
        {/* Access Tab */}
        <button
          type="button"
          onClick={() => onTabChange('access')}
          className={`flex flex-col items-center justify-center min-w-[76px] h-12 rounded-xl transition-all duration-200 ${
            currentTab === 'access'
              ? 'text-[#c3f400] bg-[#222a3d]/90 shadow-[0_0_16px_rgba(195,244,0,0.25)] font-bold'
              : 'text-[#bfc5e4] hover:text-[#dae2fd]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px] leading-none">
            verified_user
          </span>
          <span className="font-label-caps-sm text-[11px] uppercase tracking-wider mt-1">
            Access
          </span>
        </button>

        {/* Attendance Tab */}
        <button
          type="button"
          onClick={() => onTabChange('attendance')}
          className={`relative flex flex-col items-center justify-center min-w-[80px] h-12 rounded-xl transition-all duration-200 ${
            currentTab === 'attendance'
              ? 'text-[#c3f400] bg-[#222a3d]/90 shadow-[0_0_16px_rgba(195,244,0,0.25)] font-bold'
              : 'text-[#bfc5e4] hover:text-[#dae2fd]'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px] leading-none">
              fact_check
            </span>
            <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#c3f400] font-label-caps-sm text-[9px] text-[#161e00] font-extrabold shadow-sm">
              {squadCount}
            </span>
          </div>
          <span className="font-label-caps-sm text-[11px] uppercase tracking-wider mt-1">
            Attendance
          </span>
        </button>

        {/* Register Tab */}
        <button
          type="button"
          onClick={() => onTabChange('registration')}
          className={`flex flex-col items-center justify-center min-w-[76px] h-12 rounded-xl transition-all duration-200 ${
            currentTab === 'registration'
              ? 'text-[#c3f400] bg-[#222a3d]/90 shadow-[0_0_16px_rgba(195,244,0,0.25)] font-bold'
              : 'text-[#bfc5e4] hover:text-[#dae2fd]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px] leading-none">
            badge
          </span>
          <span className="font-label-caps-sm text-[11px] uppercase tracking-wider mt-1">
            Register
          </span>
        </button>
      </div>
    </nav>
  );
};
