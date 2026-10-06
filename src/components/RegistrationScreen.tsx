import React, { useState, useId, useEffect } from 'react';
import { User } from 'firebase/auth';
import { PositionCode, Player, SquadCategory } from '../types';
import { CLUB_ASSETS } from '../data/initialSquad';
import {
  appendRegistrationToSheet,
  getCachedSpreadsheetUrl,
  SheetAppendResult,
} from '../services/googleSheets';

interface RegistrationScreenProps {
  onRegisterPlayer: (newPlayer: Player) => void;
  onGoToAttendance: () => void;
  googleToken: string | null;
  googleUser: User | null;
  onGoogleSignIn: () => Promise<any>;
  onGoogleSignOut: () => Promise<void>;
  isLoggingInGoogle: boolean;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onRegisterPlayer,
  onGoToAttendance,
  googleToken,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  isLoggingInGoogle,
}) => {
  const [fullName, setFullName] = useState('Lucas Silva');
  const [nickname, setNickname] = useState('Speedy');
  const [dobDay, setDobDay] = useState('14');
  const [dobMonth, setDobMonth] = useState('Mar');
  const [dobYear, setDobYear] = useState('2009');
  const [selectedPosition, setSelectedPosition] = useState<PositionCode>('MID');
  const [squadCategory, setSquadCategory] = useState<SquadCategory>('U-17 Academy');
  const [kitNumber, setKitNumber] = useState<number>(10);
  const [kitSize, setKitSize] = useState('M');
  const [trainingSlot, setTrainingSlot] = useState<'A' | 'B'>('A');
  const [guardianName, setGuardianName] = useState('Elena Silva');
  const [guardianPhone, setGuardianPhone] = useState('+1 (555) 234-8901');
  const [guardianRel, setGuardianRel] = useState('Mother');
  const [medicalNotes, setMedicalNotes] = useState(
    'Mild asthma (inhaler in sideline gear kit). No dietary food allergies.'
  );
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(CLUB_ASSETS.defaultPassPlayerUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [lastSheetResult, setLastSheetResult] = useState<SheetAppendResult | null>(null);
  const [cachedSheetUrl, setCachedSheetUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const photoInputId = useId();

  useEffect(() => {
    setCachedSheetUrl(getCachedSpreadsheetUrl());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Calculate age & division bracket based on birth year
  const birthYearNum = parseInt(dobYear, 10) || 2009;
  const currentYear = 2025;
  const estimatedAge = currentYear - birthYearNum;
  let divisionBracket = 'U-16 Elite';
  if (estimatedAge <= 10) divisionBracket = 'U-10 Elite';
  else if (estimatedAge <= 12) divisionBracket = 'U-12 Elite';
  else if (estimatedAge <= 14) divisionBracket = 'U-14 Academy';
  else if (estimatedAge <= 16) divisionBracket = 'U-16 Elite';
  else if (estimatedAge <= 18) divisionBracket = 'U-18 Reserves';
  else divisionBracket = 'Senior Academy';

  // Automatically adjust default squad category when DOB changes if not manually locked
  useEffect(() => {
    if (estimatedAge <= 10) {
      setSquadCategory('U-10 kids');
    } else if (estimatedAge <= 15) {
      setSquadCategory('U-15 Boys');
    } else if (estimatedAge <= 17) {
      setSquadCategory('U-17 Academy');
    } else {
      setSquadCategory('U-19 Reserves');
    }
  }, [estimatedAge]);

  // Format dynamic pass name display
  const formatPassName = () => {
    const full = fullName.trim() || 'NEW PLAYER';
    const nick = nickname.trim();
    if (nick) {
      const parts = full.split(' ');
      if (parts.length > 1) {
        return `${parts[0].toUpperCase()} "${nick.toUpperCase()}" ${parts
          .slice(1)
          .join(' ')
          .toUpperCase()}`;
      }
      return `${full.toUpperCase()} "${nick.toUpperCase()}"`;
    }
    return full.toUpperCase();
  };

  const getPositionLabel = (pos: PositionCode) => {
    switch (pos) {
      case 'GK':
        return 'GK • Goalkeeper';
      case 'DEF':
        return 'DEF • Center Back';
      case 'MID':
        return 'MID • Central Playmaker';
      case 'FWD':
        return 'FWD • Striker / Wing';
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          showToast('Player portrait uploaded to Digital Pass');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter full legal name');
      return;
    }
    if (!termsAgreed) {
      showToast('Guardian must agree to the Code of Conduct & Medical Waiver');
      return;
    }

    setIsSubmitting(true);

    const newPlayer: Player = {
      id: `pk-${Date.now()}`,
      name: fullName.trim(),
      nickname: nickname.trim() || undefined,
      photoUrl: photoUrl,
      kitNumber: kitNumber || 99,
      position: selectedPosition,
      positionFull: getPositionLabel(selectedPosition),
      squadCategory: squadCategory,
      seasonFitRate: 98,
      tacticalStatus: 'Newly Enrolled',
      attendanceStatus: 'present',
      coachNote: `Enrolled in ${
        trainingSlot === 'A' ? 'Morning Session (Main Pitch A)' : 'Evening Session (Field B)'
      } • Kit Size ${kitSize}`,
      noteIcon: 'badge',
      division: divisionBracket,
      kitSize: kitSize,
      emergencyContact: {
        guardianName: guardianName.trim(),
        phone: guardianPhone.trim(),
        relationship: guardianRel,
      },
      medicalNotes: medicalNotes.trim(),
      preferredFoot: 'Right',
      sprintSpeed: '32.5 km/h',
      matchFitnessRating: 95,
    };

    // 1. Add player to live app attendance roster
    onRegisterPlayer(newPlayer);

    // 2. If Google Sheets OAuth is active, append row to Google Sheet
    if (googleToken) {
      try {
        const sheetResult = await appendRegistrationToSheet(googleToken, newPlayer, {
          dobDay,
          dobMonth,
          dobYear,
          trainingSlot,
        });
        setLastSheetResult(sheetResult);
        setCachedSheetUrl(sheetResult.spreadsheetUrl);
        showToast('Player enrolled & appended to Google Sheet!');
      } catch (sheetErr: any) {
        console.error('Failed to append to Google Sheet:', sheetErr);
        showToast(`Roster updated. Google Sheet note: ${sheetErr.message || 'Check connection'}`);
      }
    } else {
      showToast('Player enrolled into live roster! (Connect Google Sheet below to sync)');
    }

    setIsSubmitting(false);
    setEnrollSuccess(true);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-32 pt-2">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171f33] border border-[#c3f400] text-[#c3f400] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 animate-bounce max-w-[90vw]">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Google Sheets Live Integration Status Bar */}
      <div className="px-4 pb-2">
        <div className="bg-[#171f33] border border-[#2d3449] rounded-xl p-3 shadow-md flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#0F9D58"
                  d="M19.5 3h-15C3.67 3 3 3.67 3 4.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5z"
                />
                <path
                  fill="#FFF"
                  d="M14 6H7v12h10V9l-3-3zm-1 3.5V7l2.5 2.5H13zm-4 4.5h6v1.5H9V14zm0-2h6v1.5H9V12z"
                />
              </svg>
              <div className="flex flex-col min-w-0">
                <span className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#dae2fd] font-bold truncate">
                  Google Sheets Cloud Sync
                </span>
                <span className="font-body-sm text-[10px] text-[#bfc5e4] truncate">
                  {googleToken
                    ? `Connected: ${googleUser?.email || 'Active Account'}`
                    : 'Sign in to auto-record registrations in Google Sheets'}
                </span>
              </div>
            </div>

            {googleToken ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#003824] border border-[#4edea3]/40 text-[#6ffbbe] font-label-caps-sm text-[9px] uppercase font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                  Active
                </span>
                <button
                  type="button"
                  onClick={onGoogleSignOut}
                  className="text-[10px] uppercase text-[#bfc5e4] hover:text-[#ffb4ab] px-1.5 py-0.5 rounded bg-[#222a3d]"
                  title="Disconnect Google Account"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isLoggingInGoogle}
                className="h-8 px-2.5 rounded-lg bg-[#c3f400] text-[#161e00] font-label-caps-sm text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 shrink-0 shadow-sm hover:shadow-[0_0_12px_rgba(195,244,0,0.3)] transition-all cursor-pointer"
              >
                {isLoggingInGoogle ? (
                  <>
                    <span className="material-symbols-outlined text-[13px] animate-spin">
                      progress_activity
                    </span>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    <span>Connect Sheets</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Active Spreadsheet Link if available */}
          {(lastSheetResult?.spreadsheetUrl || cachedSheetUrl) && (
            <div className="pt-2 border-t border-[#222a3d] flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#6ffbbe] truncate flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">table_chart</span>
                PROKICK FC Academy - Registrations 2025/26
              </span>
              <a
                href={lastSheetResult?.spreadsheetUrl || cachedSheetUrl!}
                target="_blank"
                rel="noreferrer"
                className="font-label-caps-sm text-[10px] uppercase tracking-wider text-[#c3f400] hover:underline flex items-center gap-0.5 shrink-0 font-bold"
              >
                <span>Open Sheet</span>
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Live Digital Pass Preview */}
      <div className="px-4 pt-1">
        <div className="relative overflow-hidden rounded-xl bg-[#222a3d] border border-[#2d3449] shadow-2xl">
          {/* Ambient Volt Underglow Gradient */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#c3f400]/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Decorative Ribbon */}
          <div className="bg-[#c3f400] px-4 py-1.5 flex items-center justify-between">
            <span className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#161e00] font-extrabold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">sports_soccer</span>
              ACADEMY PASS 2025/26
            </span>
            <span className="font-label-caps-sm text-[11px] text-[#161e00]/90 tracking-widest font-mono font-bold">
              #PK-88492
            </span>
          </div>

          {/* Pass Card Body */}
          <div className="p-4 flex flex-col gap-3.5 relative">
            <div className="flex items-center gap-3.5">
              {/* Avatar Slot with Upload Trigger */}
              <label
                htmlFor={photoInputId}
                className="relative group cursor-pointer shrink-0"
                title="Tap to change headshot image"
              >
                <div className="w-16 h-16 rounded-xl bg-[#171f33] border border-[#2d3449] flex flex-col items-center justify-center text-[#bfc5e4] relative overflow-hidden shadow-inner">
                  <img
                    src={photoUrl}
                    alt="Player headshot preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#060e20]/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-[#c3f400] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[20px]">
                      add_a_photo
                    </span>
                    <span className="font-label-caps-sm text-[8px] uppercase tracking-tighter mt-0.5 font-bold">
                      Change Photo
                    </span>
                  </div>
                </div>

                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c3f400] text-[#161e00] shadow-sm">
                  <span className="material-symbols-outlined text-[10px] font-bold">
                    check
                  </span>
                </span>
                <input
                  id={photoInputId}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Dynamic Player Details */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-label-caps-sm text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#2d3449] text-[#c3f400] font-bold">
                    OFFICIAL RECRUIT
                  </span>
                  <span className="font-label-caps-sm text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#6ffbbe]/20 text-[#6ffbbe] font-bold">
                    PROSPECT
                  </span>
                </div>

                <div className="font-headline-md text-xl md:text-2xl tracking-tight uppercase text-[#dae2fd] truncate">
                  {formatPassName()}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="font-label-caps-sm text-[10px] px-2 py-0.5 rounded-full bg-[#c3f400] text-[#161e00] font-extrabold uppercase">
                    {divisionBracket}
                  </span>
                  <span className="font-label-caps-sm text-[11px] text-[#bfc5e4] truncate">
                    {getPositionLabel(selectedPosition)}
                  </span>
                </div>
              </div>

              {/* Kit Number Badge */}
              <div className="flex flex-col items-center justify-center w-12 h-14 rounded-lg bg-[#060e20] border border-[#222a3d] shadow-sm shrink-0">
                <span className="font-label-caps-sm text-[8px] uppercase tracking-widest text-[#bfc5e4] font-bold">
                  KIT
                </span>
                <span className="font-stat-numeral-md text-2xl text-[#c3f400] leading-none mt-0.5">
                  {kitNumber || '--'}
                </span>
              </div>
            </div>

            {/* Lower Barcode Strip */}
            <div className="flex items-center justify-between pt-1 bg-[#131b2e] border border-[#222a3d] px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bfc5e4] text-[20px]">
                  qr_code_2
                </span>
                <div className="flex flex-col">
                  <span className="font-label-caps-sm text-[9px] tracking-wider text-[#dae2fd] uppercase font-bold">
                    BIOMETRIC ENCRYPTED
                  </span>
                  <span className="font-body-sm text-[10px] text-[#bfc5e4]">
                    Ready for pitch gate scan
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400] animate-pulse-glow"></span>
                <span className="font-label-caps-sm text-[9px] uppercase tracking-widest text-[#c3f400] font-bold">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Bar if just enrolled */}
      {enrollSuccess && (
        <div className="mx-4 mt-3 p-3.5 bg-[#003824] border border-[#4edea3] rounded-xl flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6ffbbe] text-[24px]">
                task_alt
              </span>
              <div className="flex flex-col">
                <span className="font-headline-md text-sm uppercase text-[#6ffbbe] font-bold">
                  Player Enrolled &amp; Pass Active!
                </span>
                <span className="font-body-sm text-xs text-[#dae2fd]">
                  {fullName} has been added to the touchline attendance roster.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoToAttendance}
              className="px-3 py-1.5 rounded-lg bg-[#c3f400] text-[#161e00] font-label-caps-sm text-[11px] uppercase font-extrabold cursor-pointer hover:bg-white shrink-0"
            >
              Go to Roll Call
            </button>
          </div>

          {/* Google Sheets Confirmation row */}
          {lastSheetResult && (
            <div className="pt-2 border-t border-[#005236] flex items-center justify-between text-xs">
              <span className="text-[#6ffbbe] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Appended to Google Sheet row successfully
              </span>
              <a
                href={lastSheetResult.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#c3f400] hover:underline flex items-center gap-0.5 font-bold uppercase text-[10px]"
              >
                <span>View Sheet</span>
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleEnrollSubmit} className="flex flex-col space-y-5">
        {/* Step 1 Header */}
        <div className="px-4 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#c3f400] text-[#161e00] flex items-center justify-center font-label-caps-sm text-xs font-black">
              1
            </div>
            <span className="font-headline-md text-lg md:text-xl tracking-tight uppercase text-[#dae2fd]">
              Player Profile
            </span>
          </div>
          <span className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#c3f400] font-bold">
            Step 1 of 2
          </span>
        </div>

        {/* Section 1: Player Essentials Form Container */}
        <div className="px-4 flex flex-col gap-3.5">
          {/* Full Name & Nickname */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="input-fullname"
                className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]"
              >
                Full Legal Name *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#bfc5e4] text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  id="input-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Lucas Silva"
                  required
                  className="w-full bg-[#171f33] border border-[#222a3d] h-12 pl-10 pr-3 rounded-lg text-[#dae2fd] font-body-md text-sm placeholder:text-[#bfc5e4]/50 focus:outline-none focus:border-[#c3f400]/60 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="input-nickname"
                className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]"
              >
                Jersey Print / Nickname
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#bfc5e4] text-[20px] pointer-events-none">
                  badge
                </span>
                <input
                  id="input-nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Optional on-pitch callout"
                  className="w-full bg-[#171f33] border border-[#222a3d] h-12 pl-10 pr-3 rounded-lg text-[#dae2fd] font-body-md text-sm placeholder:text-[#bfc5e4]/50 focus:outline-none focus:border-[#c3f400]/60 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Date of Birth & Auto Division Calculator */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]">
              Date of Birth (Eligibility Check) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  className="w-full bg-[#171f33] border border-[#222a3d] h-12 px-3 rounded-lg text-[#dae2fd] font-body-md text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d < 10 ? `0${d}` : `${d}`}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[#bfc5e4] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className="w-full bg-[#171f33] border border-[#222a3d] h-12 px-3 rounded-lg text-[#dae2fd] font-body-md text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  {[
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[#bfc5e4] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className="w-full bg-[#171f33] border border-[#222a3d] h-12 px-3 rounded-lg text-[#dae2fd] font-body-md text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  {[
                    '2018',
                    '2017',
                    '2016',
                    '2015',
                    '2014',
                    '2013',
                    '2012',
                    '2011',
                    '2010',
                    '2009',
                    '2008',
                    '2007',
                    '2006',
                  ].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[#bfc5e4] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Auto Calculated Dynamic Pill */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#222a3d] border border-[#2d3449] mt-1 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c3f400] text-[18px]">
                  verified
                </span>
                <span className="font-body-sm text-[12px] text-[#bfc5e4]">
                  Division Bracket
                </span>
              </div>
              <span className="font-label-caps-sm text-[11px] px-2.5 py-0.5 rounded-full bg-[#c3f400] text-[#161e00] font-extrabold uppercase">
                Auto: {divisionBracket} ({estimatedAge} yrs)
              </span>
            </div>
          </div>

          {/* Squad Category Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]">
              Assigned Squad Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  'U-17 Academy',
                  'U-15 Boys',
                  'U-10 kids',
                  'Girls Elite',
                  'U-19 Reserves',
                ] as const
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSquadCategory(cat)}
                  className={`py-2 px-1 text-center rounded-lg font-label-caps-sm text-[11px] uppercase transition-all cursor-pointer ${
                    squadCategory === cat
                      ? 'bg-[#c3f400] text-[#161e00] font-extrabold shadow-sm'
                      : 'bg-[#171f33] border border-[#222a3d] text-[#bfc5e4] hover:bg-[#222a3d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Position Selector */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]">
                Primary Position *
              </label>
              <span className="font-body-sm text-[11px] text-[#c3f400]">
                Pitch Profile Activated
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { code: 'GK', label: 'Keeper', icon: 'sports_handball' },
                  { code: 'DEF', label: 'Defense', icon: 'shield' },
                  { code: 'MID', label: 'Midfield', icon: 'hub' },
                  { code: 'FWD', label: 'Attack', icon: 'electric_bolt' },
                ] as const
              ).map((pos) => {
                const isActive = selectedPosition === pos.code;
                return (
                  <button
                    key={pos.code}
                    type="button"
                    onClick={() => setSelectedPosition(pos.code)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all focus:outline-none cursor-pointer ${
                      isActive
                        ? 'bg-[#c3f400] text-[#161e00] font-extrabold shadow-sm'
                        : 'bg-[#171f33] border border-[#222a3d] text-[#bfc5e4] hover:bg-[#222a3d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">
                      {pos.icon}
                    </span>
                    <span className="font-headline-md text-[13px] leading-tight font-bold">
                      {pos.code}
                    </span>
                    <span className="font-label-caps-sm text-[9px] uppercase tracking-tighter opacity-80">
                      {pos.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kit Customization: Number + Size */}
          <div className="p-3.5 rounded-xl bg-[#171f33] border border-[#222a3d] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c3f400] text-[20px]">
                  stadium
                </span>
                <span className="font-label-caps-md text-[13px] uppercase tracking-wider text-[#dae2fd]">
                  Matchday Kit Fitting
                </span>
              </div>
              <span className="font-label-caps-sm text-[11px] text-[#bfc5e4]">
                Official Club Pro
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Squad Number */}
              <div className="flex flex-col gap-1 w-28 shrink-0">
                <label
                  htmlFor="input-kit-num"
                  className="font-label-caps-sm text-[10px] uppercase tracking-wider text-[#bfc5e4]"
                >
                  Squad No. *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#bfc5e4] text-[18px] pointer-events-none">
                    tag
                  </span>
                  <input
                    id="input-kit-num"
                    type="number"
                    min={1}
                    max={99}
                    value={kitNumber || ''}
                    onChange={(e) => setKitNumber(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#222a3d] border border-[#2d3449] h-11 pl-8 pr-2 rounded-lg text-[#c3f400] font-stat-numeral-md text-xl leading-none focus:outline-none"
                  />
                </div>
              </div>

              {/* Kit Sizes */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="font-label-caps-sm text-[10px] uppercase tracking-wider text-[#bfc5e4]">
                  Apparel Fit *
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['Y-L', 'S', 'M', 'L', 'XL'].map((size) => {
                    const isSelected = kitSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setKitSize(size)}
                        className={`h-11 px-3 rounded-lg font-label-caps-sm text-[11px] uppercase shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#c3f400] text-[#161e00] font-extrabold shadow-sm'
                            : 'bg-[#222a3d] border border-[#2d3449] text-[#bfc5e4] hover:text-[#dae2fd]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 Header */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2d3449] text-[#c3f400] flex items-center justify-center font-label-caps-sm text-xs font-black">
              2
            </div>
            <span className="font-headline-md text-lg md:text-xl tracking-tight uppercase text-[#dae2fd]">
              Schedule &amp; Safety
            </span>
          </div>
          <span className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]">
            Academy Term 1
          </span>
        </div>

        {/* Section 2: Batch Schedule & Emergency Info */}
        <div className="px-4 flex flex-col gap-3">
          {/* Training Slot Radio Options */}
          <div className="flex flex-col gap-2.5">
            {/* Option A (Morning) */}
            <label
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                trainingSlot === 'A'
                  ? 'bg-[#171f33] border-[#c3f400] shadow-[0_0_12px_rgba(195,244,0,0.15)]'
                  : 'bg-[#171f33] border-[#222a3d] hover:bg-[#222a3d]'
              }`}
            >
              <input
                type="radio"
                name="training_slot"
                value="A"
                checked={trainingSlot === 'A'}
                onChange={() => setTrainingSlot('A')}
                className="mt-1 accent-[#c3f400] h-4 w-4"
              />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-headline-md text-[15px] uppercase tracking-wide text-[#dae2fd] font-bold">
                    Morning Session
                  </span>
                  <span className="font-label-caps-sm text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#c3f400]/20 text-[#c3f400] font-bold">
                    High Intensity
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-[#bfc5e4]">
                  Mon, Tue, Wed, Thu, Fri 05:30am – 07:00am + Saturday : Gym day / Matchday
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 font-label-caps-sm text-[10px] text-[#6ffbbe] font-semibold">
                    <span className="material-symbols-outlined text-[13px]">
                      location_on
                    </span>
                    Main Pitch A
                  </span>
                  <span className="flex items-center gap-1 font-label-caps-sm text-[10px] text-[#bfc5e4]">
                    <span className="material-symbols-outlined text-[13px]">
                      group
                    </span>
                    Enrollment Slot Available
                  </span>
                </div>
              </div>
            </label>

            {/* Option B (Evening) */}
            <label
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                trainingSlot === 'B'
                  ? 'bg-[#171f33] border-[#c3f400] shadow-[0_0_12px_rgba(195,244,0,0.15)]'
                  : 'bg-[#171f33] border-[#222a3d] hover:bg-[#222a3d]'
              }`}
            >
              <input
                type="radio"
                name="training_slot"
                value="B"
                checked={trainingSlot === 'B'}
                onChange={() => setTrainingSlot('B')}
                className="mt-1 accent-[#c3f400] h-4 w-4"
              />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-headline-md text-[15px] uppercase tracking-wide text-[#dae2fd] font-bold">
                    Evening Session
                  </span>
                  <span className="font-label-caps-sm text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#2d3449] text-[#bfc5e4] font-bold">
                    Intensive
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-[#bfc5e4]">
                  Mon, Tue, Wed, Thu, Fri 17:00pm – 19:00pm + Saturday : Matchday Phase
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 font-label-caps-sm text-[10px] text-[#bfc5e4] font-semibold">
                    <span className="material-symbols-outlined text-[13px]">
                      location_on
                    </span>
                    Field B
                  </span>
                  <span className="flex items-center gap-1 font-label-caps-sm text-[10px] text-[#bfc5e4]">
                    <span className="material-symbols-outlined text-[13px]">
                      group
                    </span>
                    Enrollment Slot Available
                  </span>
                </div>
              </div>
            </label>
          </div>

          {/* Guardian & Emergency Contact Card */}
          <div className="p-3.5 rounded-xl bg-[#171f33] border border-[#222a3d] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c3f400] text-[20px]">
                  contact_emergency
                </span>
                <span className="font-label-caps-md text-[13px] uppercase tracking-wider text-[#dae2fd]">
                  Primary Guardian &amp; Sideline Safety
                </span>
              </div>
              <span className="font-label-caps-sm text-[10px] text-[#bfc5e4]">
                Required
              </span>
            </div>

            {/* Guardian Name */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="guardian-name"
                className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]"
              >
                Guardian Full Name *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#bfc5e4] text-[20px] pointer-events-none">
                  family_restroom
                </span>
                <input
                  id="guardian-name"
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Parent or legal guardian"
                  required
                  className="w-full bg-[#222a3d] border border-[#2d3449] h-12 pl-10 pr-3 rounded-lg text-[#dae2fd] font-body-md text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Phone & Relationship */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="guardian-phone"
                  className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]"
                >
                  Emergency Phone *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#bfc5e4] text-[18px] pointer-events-none">
                    call
                  </span>
                  <input
                    id="guardian-phone"
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    required
                    className="w-full bg-[#222a3d] border border-[#2d3449] h-12 pl-8 pr-2 rounded-lg text-[#dae2fd] font-body-md text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="guardian-rel"
                  className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4]"
                >
                  Relationship *
                </label>
                <div className="relative flex items-center">
                  <select
                    id="guardian-rel"
                    value={guardianRel}
                    onChange={(e) => setGuardianRel(e.target.value)}
                    className="w-full bg-[#222a3d] border border-[#2d3449] h-12 px-3 rounded-lg text-[#dae2fd] font-body-md text-sm focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Legal Guardian">Guardian</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[#bfc5e4] text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Medical & Sideline Allergy Notes */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="medical-notes"
                  className="font-label-caps-sm text-[11px] uppercase tracking-wider text-[#bfc5e4] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#6ffbbe]">
                    health_and_safety
                  </span>
                  Sideline Medical &amp; Allergy Notes
                </label>
                <span className="font-label-caps-sm text-[10px] text-[#bfc5e4]">
                  Paramedic Access
                </span>
              </div>
              <textarea
                id="medical-notes"
                rows={2}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="e.g. Mild exercise asthma (inhaler kept in sideline gym bag), peanut allergy"
                className="w-full bg-[#222a3d] border border-[#2d3449] p-3 rounded-lg text-[#dae2fd] font-body-sm text-xs focus:outline-none resize-none placeholder:text-[#bfc5e4]/50"
              />
            </div>
          </div>
        </div>

        {/* Submission CTA & Code of Conduct */}
        <div className="px-4 flex flex-col gap-3.5">
          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-[#131b2e] border border-[#222a3d] cursor-pointer">
            <input
              type="checkbox"
              id="terms-agree"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 rounded bg-[#171f33] text-[#c3f400] accent-[#c3f400] h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="font-body-md text-sm text-[#dae2fd] font-medium leading-snug">
                Guardian confirms Academy Code of Conduct &amp; Medical Waiver
              </span>
              <span className="font-body-sm text-[11px] text-[#bfc5e4] mt-0.5">
                Includes match insurance, hydration guidelines, media release consent, and cloud spreadsheet record storage.
              </span>
            </div>
          </label>

          {/* Full-Width High-Energy Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-lg bg-[#c3f400] text-[#161e00] font-headline-md text-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,244,0,0.35)] hover:shadow-[0_0_28px_rgba(195,244,0,0.5)] active:scale-[0.98] transition-all cursor-pointer font-extrabold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[22px]">
                  progress_activity
                </span>
                <span>
                  {googleToken
                    ? 'SYNCING TO GOOGLE SHEETS & ENROLLING...'
                    : 'GENERATING ACADEMY PASS...'}
                </span>
              </span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[24px]">
                  verified
                </span>
                <span>ISSUE DIGITAL PASS &amp; ENROLL</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[#bfc5e4]">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="font-label-caps-sm text-[10px] uppercase tracking-widest">
              PROKICK FC Encrypted Registration Gateway • Google Sheets Connected
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
