import React, { useState, useEffect } from 'react';
import { RoleClearance } from '../types';

interface AccessScreenProps {
  onLoginSuccess: () => void;
  onOpenFieldSupport: () => void;
  onGoogleSignIn?: () => Promise<any>;
  googleUser?: any;
  isLoggingInGoogle?: boolean;
}

export const AccessScreen: React.FC<AccessScreenProps> = ({
  onLoginSuccess,
  onOpenFieldSupport,
  onGoogleSignIn,
  googleUser,
  isLoggingInGoogle,
}) => {
  const [role, setRole] = useState<RoleClearance>('coach');
  const [email, setEmail] = useState('Coaches@prokickfc.com');
  const [password, setPassword] = useState('Prokick@2022');
  const [showPassword, setShowPassword] = useState(false);
  const [pitchStationActive, setPitchStationActive] = useState(true);
  const [offlineCacheActive, setOfflineCacheActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Kickoff Clock countdown simulation
  const [countdownSeconds, setCountdownSeconds] = useState(13500); // ~3h 45m

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 13500));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}H ${m < 10 ? '0' : ''}${m}M ${s < 10 ? '0' : ''}${s}S`;
  };

  const handleRoleChange = (selectedRole: RoleClearance) => {
    setRole(selectedRole);
    if (selectedRole === 'coach') {
      setEmail('Rajnish@prokickfc.com');
      setPassword('Prokick#2025');
    } else if (selectedRole === 'admin') {
      setEmail('admin.operations@prokickfc.com');
      setPassword('AdminDirector#2026');
    } else {
      setEmail('elena.silva@parent.com');
      setPassword('Player@123');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Clearance verified. Entering Touchline Station...');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    }, 600);
  };

  const handleToggleWakeLock = () => {
    const nextState = !pitchStationActive;
    setPitchStationActive(nextState);
    showToast(
      nextState
        ? 'Touchline Station Mode: ON (Screen kept active)'
        : 'Station Mode: OFF (System sleep allowed)'
    );
  };

  const handleToggleOfflineCache = () => {
    const nextState = !offlineCacheActive;
    setOfflineCacheActive(nextState);
    showToast(
      nextState
        ? 'Local Offline Cache: Synced & Ready'
        : 'Local Cache: Offline mode suspended'
    );
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-3 space-y-4 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171f33] border border-[#c3f400] text-[#c3f400] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Selection Card */}
      <div className="bg-[#171f33] border border-[#222a3d] rounded-xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps-sm text-[11px] text-[#c3f400] uppercase tracking-wider">
              Access Clearance
            </span>
            <span className="font-headline-md text-xl md:text-2xl uppercase text-[#dae2fd] truncate">
              PROKICK FC Academy HQ
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#222a3d] border border-[#2d3449] flex items-center justify-center text-[#c3f400] shrink-0 shadow-inner">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              shield_person
            </span>
          </div>
        </div>

        <p className="font-body-sm text-[12px] text-[#bfc5e4] mb-3">
          Select credential role to authenticate touchline station privileges.
        </p>

        {/* Athletic Role Segmented Pill Control */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#060e20] p-1.5 rounded-xl border border-[#131b2e]">
          <button
            type="button"
            onClick={() => handleRoleChange('coach')}
            className={`py-2 px-1 rounded-lg font-label-caps-sm text-[11px] text-center uppercase transition-all duration-200 cursor-pointer ${
              role === 'coach'
                ? 'bg-[#c3f400] text-[#161e00] font-extrabold shadow-[0_0_12px_rgba(195,244,0,0.35)]'
                : 'text-[#bfc5e4] hover:text-[#dae2fd]'
            }`}
          >
            Coach / Staff
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`py-2 px-1 rounded-lg font-label-caps-sm text-[11px] text-center uppercase transition-all duration-200 cursor-pointer ${
              role === 'admin'
                ? 'bg-[#c3f400] text-[#161e00] font-extrabold shadow-[0_0_12px_rgba(195,244,0,0.35)]'
                : 'text-[#bfc5e4] hover:text-[#dae2fd]'
            }`}
          >
            Club Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('player')}
            className={`py-2 px-1 rounded-lg font-label-caps-sm text-[11px] text-center uppercase transition-all duration-200 cursor-pointer ${
              role === 'player'
                ? 'bg-[#c3f400] text-[#161e00] font-extrabold shadow-[0_0_12px_rgba(195,244,0,0.35)]'
                : 'text-[#bfc5e4] hover:text-[#dae2fd]'
            }`}
          >
            Player / Parent
          </button>
        </div>
      </div>

      {/* Authentication Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#171f33] border border-[#222a3d] rounded-xl p-4 shadow-xl flex flex-col space-y-4"
      >
        {/* Email Field */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="coach-email"
              className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#c4c9ac] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#c3f400]">
                alternate_email
              </span>
              Registered Club Email
            </label>
            <span className="font-label-caps-sm text-[11px] text-[#6ffbbe] uppercase font-semibold">
              {role === 'coach'
                ? 'Active Staff ID'
                : role === 'admin'
                ? 'Director Access'
                : 'Player Link'}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              id="coach-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@prokickfc.com"
              required
              className="w-full bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] placeholder:text-[#8e9379] font-body-md text-sm rounded-lg px-3 py-2.5 outline-none transition-all duration-150 focus:bg-[#31394d] focus:border-[#c3f400]/60 pr-9"
            />
            <span className="material-symbols-outlined absolute right-3 text-[#6ffbbe] text-[18px]">
              verified
            </span>
          </div>
        </div>

        {/* Password Field with Strength Bar */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="tactical-key"
              className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#c4c9ac] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#c3f400]">
                key
              </span>
              Tactical Password Key
            </label>
            <button
              type="button"
              onClick={() => showToast('Temporary tactical unlock pin sent to registered device')}
              className="font-label-caps-sm text-[11px] uppercase text-[#bfc5e4] hover:text-[#c3f400] transition-colors"
            >
              Forgot Tactical Key?
            </button>
          </div>

          <div className="relative flex items-center">
            <input
              id="tactical-key"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] placeholder:text-[#8e9379] font-body-md text-sm rounded-lg px-3 py-2.5 pr-10 outline-none transition-all duration-150 focus:bg-[#31394d] focus:border-[#c3f400]/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle Password Visibility"
              className="absolute right-2.5 w-7 h-7 flex items-center justify-center text-[#bfc5e4] hover:text-[#dae2fd]"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Tactical Key Vault Security Bars */}
          <div className="pt-1 flex flex-col space-y-1">
            <div className="flex items-center justify-between text-[#bfc5e4]">
              <span className="font-label-caps-sm text-[11px] uppercase text-[#bfc5e4]">
                Cipher Strength
              </span>
              <span className="font-label-caps-sm text-[11px] uppercase text-[#c3f400] font-bold">
                Pitchside Ready (High)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-[#060e20] p-0.5 rounded-full">
              <div className="h-full rounded-full bg-[#c3f400]"></div>
              <div className="h-full rounded-full bg-[#c3f400]"></div>
              <div className="h-full rounded-full bg-[#c3f400]"></div>
              <div className="h-full rounded-full bg-[#c3f400]/30"></div>
            </div>
          </div>
        </div>

        {/* Match Station Mode & Pitch Toggle */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#222a3d] flex items-center justify-center text-[#c3f400] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">
                touchpad_mouse
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps-md text-[13px] uppercase text-[#dae2fd] truncate">
                Keep Active on Pitch Station
              </span>
              <span className="font-body-sm text-[11px] text-[#bfc5e4] truncate">
                Prevents auto-lock on touchline tablet
              </span>
            </div>
          </div>

          {/* High-contrast Athletic Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={pitchStationActive}
            onClick={handleToggleWakeLock}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              pitchStationActive ? 'bg-[#c3f400]' : 'bg-[#222a3d]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0b1326] shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                pitchStationActive ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Primary Athletic Match-Critical CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-13 py-3 rounded-lg bg-[#c3f400] text-[#161e00] font-headline-md text-xl uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_18px_rgba(195,244,0,0.35)] hover:shadow-[0_0_24px_rgba(195,244,0,0.5)] cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
              <span>Authenticating...</span>
            </span>
          ) : (
            <>
              <span>Enter Squad Portal</span>
              <span className="material-symbols-outlined text-[24px]">
                sports_soccer
              </span>
            </>
          )}
        </button>

        {/* Quick Sideline Access Row */}
        <div className="pt-1 flex flex-col space-y-2">
          <div className="flex items-center justify-center gap-2 py-1">
            <div className="h-px bg-[#2d3449] flex-1"></div>
            <span className="font-label-caps-sm text-[10px] uppercase tracking-wider text-[#bfc5e4] px-2">
              Quick Sideline SSO
            </span>
            <div className="h-px bg-[#2d3449] flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                showToast('Authenticated via Apple Pass ID');
                setTimeout(onLoginSuccess, 600);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] hover:bg-[#31394d] active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.79-11.88-14.23-5.75-8.79-10.2-18.73-13.33-29.83-3.14-11.1-4.71-21.75-4.71-31.95 0-14.89 3.84-27.18 11.51-36.87 7.68-9.7 17.06-14.66 28.16-14.9 5.34 0 10.98 1.41 16.92 4.23 5.94 2.82 10.15 4.3 12.63 4.43 2.12 0 6.46-1.55 13.01-4.66 6.56-3.11 12.39-4.55 17.5-4.32 13.59.65 24.58 5.66 32.96 15.04-11.83 7.18-17.63 16.99-17.41 29.43.21 9.8 4.02 18.06 11.43 24.78 7.41 6.72 16.29 10.51 26.64 11.37-2.61 7.82-5.78 15.71-9.5 23.67zM119.22 33.15c0-7.39 2.65-14.46 7.95-21.21 5.3-6.75 11.88-11.16 19.74-13.23.44 2.07.65 4.02.65 5.87 0 7.39-2.73 14.54-8.19 21.46-5.46 6.92-12.16 11.38-20.1 13.38-.05-2.07-.05-4.16-.05-6.27z" />
              </svg>
              <span className="font-label-caps-sm text-[11px] uppercase">
                Apple ID
              </span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (onGoogleSignIn) {
                  try {
                    await onGoogleSignIn();
                    showToast('Authenticated via Google Academy Workspace');
                    setTimeout(onLoginSuccess, 600);
                  } catch (err: any) {
                    showToast('Google Sign-in cancelled or failed');
                  }
                } else {
                  showToast('Authenticated via Google Academy Workspace');
                  setTimeout(onLoginSuccess, 600);
                }
              }}
              disabled={isLoggingInGoogle}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#222a3d] border border-[#2d3449] text-[#dae2fd] hover:bg-[#31394d] active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  fill="#4285F4"
                />
                <path
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  fill="#34A853"
                />
                <path
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-label-caps-sm text-[11px] uppercase">
                Google
              </span>
            </button>
          </div>
        </div>

        {/* Security Encryption Assurance Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[#8e9379]">
          <span className="material-symbols-outlined text-[15px] text-[#6ffbbe]">
            lock
          </span>
          <span className="font-label-caps-sm text-[10px] tracking-wider uppercase">
            256-Bit SSL • End-to-End Encrypted Database
          </span>
        </div>
      </form>

      {/* Upcoming Squad Fixture Card Docked Widget */}
      <div className="bg-[#171f33] border border-[#222a3d] rounded-xl p-4 shadow-xl flex flex-col space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c3f400] animate-pulse-glow"></span>
            <span className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#c3f400] font-bold">
              Matchday Briefing
            </span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[#2d3449] font-label-caps-sm text-[11px] uppercase text-[#bfc5e4]">
            Pitch 2 • Floodlit
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#2d3449] border border-[#424862] flex items-center justify-center font-headline-md text-xl text-[#c3f400] shrink-0 font-bold">
              U17
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-md text-lg uppercase text-[#dae2fd] truncate">
                PROKICK Academy
              </span>
              <span className="font-body-sm text-[12px] text-[#bfc5e4] truncate">
                vs Metro Athletic FC
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="font-stat-numeral-md text-2xl text-[#c3f400] tracking-tight">
              {formatCountdown(countdownSeconds)}
            </span>
            <span className="font-label-caps-sm text-[10px] text-[#8e9379] uppercase tracking-wider">
              Kickoff Clock
            </span>
          </div>
        </div>

        {/* Match Visual Pill Bar */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#222a3d]">
          <div className="flex items-center gap-2 text-[#c4c9ac] font-body-sm text-xs">
            <span className="material-symbols-outlined text-[18px] text-[#c3f400]">
              checkroom
            </span>
            <span>
              Kit Alert: <strong className="text-[#dae2fd]">Navy / Electric Volt</strong>
            </span>
          </div>
          <span className="font-label-caps-sm text-[11px] uppercase text-[#6ffbbe] font-bold">
            Squad Sheet Ready
          </span>
        </div>
      </div>

      {/* Touchline Emergency Quick Access */}
      <div className="py-1 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onOpenFieldSupport}
          className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4] hover:text-[#dae2fd] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            contact_support
          </span>
          Field Support Desk
        </button>

        <button
          type="button"
          onClick={handleToggleOfflineCache}
          className={`font-label-caps-sm text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
            offlineCacheActive
              ? 'text-[#c3f400] hover:underline'
              : 'text-[#bfc5e4] line-through'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            offline_bolt
          </span>
          Offline Local Cache: {offlineCacheActive ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
};
