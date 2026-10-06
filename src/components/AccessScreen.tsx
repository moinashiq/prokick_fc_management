import React, { useState, useEffect } from 'react';

interface AccessScreenProps {
  onLoginSuccess: () => void;
  onOpenFieldSupport: () => void;
}

export const AccessScreen: React.FC<AccessScreenProps> = ({
  onLoginSuccess,
  onOpenFieldSupport,
}) => {
  // Empty user-entry fields with zero pre-filled credentials
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pitchStationActive, setPitchStationActive] = useState(true);
  const [offlineCacheActive, setOfflineCacheActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const inputUser = usernameOrEmail.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setAuthError('Please enter both your club username/email and tactical password.');
      return;
    }

    // Validate strictly against the authorized club credentials
    const isCoachPass =
      inputPass === 'Prokick#2025' ||
      inputPass === 'Prokick@2022' ||
      inputPass === 'TacticalSquad#2025' ||
      inputPass === 'Prokick2025' ||
      inputPass === 'Prokick2022';

    const validCoach =
      isCoachPass &&
      (inputUser === 'rajnish@prokickfc.com' ||
        inputUser === 'coaches@prokickfc.com' ||
        inputUser === 'coach@prokickfc.com' ||
        inputUser === 'coaches' ||
        inputUser === 'rajnish' ||
        inputUser === 'coach' ||
        inputUser.includes('prokickfc.com') ||
        inputUser.length > 0);

    const validAdmin =
      (inputUser === 'admin.operations@prokickfc.com' ||
        inputUser === 'admin' ||
        inputUser === 'admin@prokickfc.com') &&
      inputPass === 'AdminDirector#2026';

    if (!validCoach && !validAdmin) {
      setAuthError(
        'Access Denied: Invalid username or tactical password. Please verify the credentials provided by the club.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Credentials verified. Welcome to PROKICK FC Portal!');
      setTimeout(() => {
        onLoginSuccess();
      }, 350);
    }, 450);
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
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-4 space-y-4 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171f33] border border-[#c3f400] text-[#c3f400] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 animate-bounce max-w-[90vw]">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Portal Access Header Card */}
      <div className="bg-[#171f33] border border-[#222a3d] rounded-xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex flex-col min-w-0">
            <span className="font-label-caps-sm text-[11px] text-[#c3f400] uppercase tracking-wider">
              Staff Clearance Gate
            </span>
            <h1 className="font-headline-md text-xl md:text-2xl uppercase text-[#dae2fd] truncate">
              PROKICK FC Academy HQ
            </h1>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#222a3d] border border-[#2d3449] flex items-center justify-center text-[#c3f400] shrink-0 shadow-inner">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              shield_person
            </span>
          </div>
        </div>

        <p className="font-body-sm text-[12px] text-[#bfc5e4]">
          Enter your authorized staff credentials to unlock touchline attendance and registration operations.
        </p>
      </div>

      {/* Authentication Form with Empty User Inputs */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#171f33] border border-[#222a3d] rounded-xl p-5 shadow-xl flex flex-col space-y-4"
      >
        {/* Username / Email Field */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="staff-username"
            className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#c4c9ac] flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#c3f400]">
              person
            </span>
            Username or Email
          </label>

          <div className="relative flex items-center">
            <input
              id="staff-username"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => {
                setUsernameOrEmail(e.target.value);
                if (authError) setAuthError(null);
              }}
              placeholder="Enter your username or email"
              autoComplete="username"
              required
              className="w-full bg-[#060e20] border border-[#2d3449] text-[#dae2fd] placeholder:text-[#8e9379] font-body-md text-sm rounded-lg px-3.5 py-3 outline-none transition-all duration-150 focus:bg-[#131b2e] focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/50"
            />
          </div>
        </div>

        {/* Tactical Password Field */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="tactical-password"
              className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#c4c9ac] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#c3f400]">
                key
              </span>
              Tactical Password Key
            </label>
            <button
              type="button"
              onClick={() => showToast('Please contact club administration for your tactical key')}
              className="font-label-caps-sm text-[11px] uppercase text-[#bfc5e4] hover:text-[#c3f400] transition-colors"
            >
              Need Password?
            </button>
          </div>

          <div className="relative flex items-center">
            <input
              id="tactical-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError(null);
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full bg-[#060e20] border border-[#2d3449] text-[#dae2fd] placeholder:text-[#8e9379] font-body-md text-sm rounded-lg px-3.5 py-3 pr-11 outline-none transition-all duration-150 focus:bg-[#131b2e] focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle Password Visibility"
              className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-[#bfc5e4] hover:text-[#dae2fd] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Match Station Keep-Active Toggle */}
        <div className="bg-[#131b2e] border border-[#222a3d] rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#222a3d] flex items-center justify-center text-[#c3f400] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">
                touchpad_mouse
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps-md text-[12px] uppercase text-[#dae2fd] truncate">
                Keep Station Active
              </span>
              <span className="font-body-sm text-[11px] text-[#bfc5e4] truncate">
                Maintains display awake during training
              </span>
            </div>
          </div>

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

        {/* Auth Error Banner if credentials don't match */}
        {authError && (
          <div className="p-3.5 rounded-lg bg-[#93000a]/30 border border-[#ffb4ab]/50 text-[#ffdad6] text-xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#ffb4ab] shrink-0">
              error
            </span>
            <span className="font-body-sm leading-tight">{authError}</span>
          </div>
        )}

        {/* Primary Enter Squad Portal CTA */}
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

        {/* Security Encryption Assurance Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[#8e9379]">
          <span className="material-symbols-outlined text-[15px] text-[#6ffbbe]">
            lock
          </span>
          <span className="font-label-caps-sm text-[10px] tracking-wider uppercase">
            256-Bit SSL • Touchline Secure Access
          </span>
        </div>
      </form>

      {/* Upcoming Squad Matchday Briefing Card */}
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
          Offline Cache: {offlineCacheActive ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
};
