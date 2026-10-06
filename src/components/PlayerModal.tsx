import React, { useState } from 'react';
import { Player, AttendanceState } from '../types';

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onUpdateStatus: (playerId: string, status: AttendanceState) => void;
  onUpdateNote: (playerId: string, note: string) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  onClose,
  onUpdateStatus,
  onUpdateNote,
}) => {
  if (!player) return null;

  const [noteText, setNoteText] = useState(player.coachNote);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateNote(player.id, noteText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#171f33] border border-[#2d3449] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#222a3d] border-b border-[#2d3449] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3f400]">
              sports_and_outdoors
            </span>
            <span className="font-headline-md text-lg uppercase text-[#dae2fd]">
              Player Scouting &amp; Biometrics
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#2d3449] text-[#bfc5e4] hover:text-[#dae2fd] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Card Hero */}
          <div className="flex items-center gap-4 bg-[#131b2e] border border-[#222a3d] p-3.5 rounded-xl">
            <div className="relative shrink-0">
              <img
                src={player.photoUrl}
                alt={player.name}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#c3f400]/40"
              />
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#060e20] border border-[#222a3d] rounded-full flex items-center justify-center font-label-caps-sm text-xs font-black text-[#c3f400]">
                {player.kitNumber}
              </span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-xl uppercase text-[#dae2fd] truncate">
                  {player.name}
                </h3>
                {player.roleBadge && (
                  <span className="px-1.5 py-0.5 rounded bg-[#222a3d] text-[#c3f400] font-label-caps-sm text-[9px] font-bold">
                    {player.roleBadge}
                  </span>
                )}
              </div>
              <span className="font-label-caps-sm text-xs text-[#c3f400] font-bold uppercase">
                {player.positionFull}
              </span>
              <span className="font-body-sm text-xs text-[#bfc5e4]">
                {player.division || player.squadCategory} • Season Fit: {player.seasonFitRate}%
              </span>
            </div>
          </div>

          {/* Quick Roll Switcher */}
          <div className="space-y-1.5">
            <label className="font-label-caps-sm text-[11px] uppercase text-[#bfc5e4]">
              Match Attendance State
            </label>
            <div className="grid grid-cols-3 bg-[#060e20] p-1 rounded-lg gap-1 border border-[#131b2e]">
              <button
                type="button"
                onClick={() => onUpdateStatus(player.id, 'present')}
                className={`py-2 rounded font-label-caps-md text-xs uppercase tracking-wider text-center transition-all ${
                  player.attendanceStatus === 'present'
                    ? 'bg-[#c3f400] text-[#161e00] font-black'
                    : 'text-[#bfc5e4] hover:text-[#dae2fd]'
                }`}
              >
                Present
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(player.id, 'absent')}
                className={`py-2 rounded font-label-caps-md text-xs uppercase tracking-wider text-center transition-all ${
                  player.attendanceStatus === 'absent'
                    ? 'bg-[#93000a] text-[#ffdad6] font-black'
                    : 'text-[#bfc5e4] hover:text-[#dae2fd]'
                }`}
              >
                Absent
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(player.id, 'late')}
                className={`py-2 rounded font-label-caps-md text-xs uppercase tracking-wider text-center transition-all ${
                  player.attendanceStatus === 'late'
                    ? 'bg-[#fbbf24] text-[#060e20] font-black'
                    : 'text-[#bfc5e4] hover:text-[#dae2fd]'
                }`}
              >
                Late / Mod
              </button>
            </div>
          </div>

          {/* Biometrics & Athletic Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#222a3d] border border-[#2d3449] p-2.5 rounded-lg flex flex-col items-center text-center">
              <span className="font-label-caps-sm text-[9px] uppercase text-[#bfc5e4]">
                Top Speed
              </span>
              <span className="font-stat-numeral-md text-lg text-[#c3f400]">
                {player.sprintSpeed || '32.1 km/h'}
              </span>
            </div>
            <div className="bg-[#222a3d] border border-[#2d3449] p-2.5 rounded-lg flex flex-col items-center text-center">
              <span className="font-label-caps-sm text-[9px] uppercase text-[#bfc5e4]">
                Boot Fit
              </span>
              <span className="font-stat-numeral-md text-lg text-[#dae2fd]">
                {player.kitSize || 'M'} Pro
              </span>
            </div>
            <div className="bg-[#222a3d] border border-[#2d3449] p-2.5 rounded-lg flex flex-col items-center text-center">
              <span className="font-label-caps-sm text-[9px] uppercase text-[#bfc5e4]">
                Dominant
              </span>
              <span className="font-stat-numeral-md text-lg text-[#6ffbbe]">
                {player.preferredFoot || 'Right'}
              </span>
            </div>
          </div>

          {/* Emergency & Guardian Contact */}
          {player.emergencyContact && (
            <div className="bg-[#131b2e] border border-[#222a3d] p-3 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#c3f400] uppercase">
                <span className="material-symbols-outlined text-[16px]">
                  contact_emergency
                </span>
                <span>Guardian &amp; Emergency Phone</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#dae2fd] pt-1">
                <span>
                  {player.emergencyContact.guardianName} (
                  {player.emergencyContact.relationship})
                </span>
                <a
                  href={`tel:${player.emergencyContact.phone}`}
                  className="text-[#6ffbbe] font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  {player.emergencyContact.phone}
                </a>
              </div>
            </div>
          )}

          {/* Medical Notes */}
          {player.medicalNotes && (
            <div className="bg-[#131b2e] border border-[#222a3d] p-3 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#fbbf24] uppercase">
                <span className="material-symbols-outlined text-[16px]">
                  medical_services
                </span>
                <span>Medical &amp; Physical Conditioning</span>
              </div>
              <p className="font-body-sm text-xs text-[#bfc5e4]">
                {player.medicalNotes}
              </p>
            </div>
          )}

          {/* Coach Tactical Notes Editor */}
          <div className="space-y-1.5">
            <label className="font-label-caps-sm text-[11px] uppercase text-[#bfc5e4]">
              Pitchside Tactical Coach Note
            </label>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-[#222a3d] border border-[#2d3449] p-2.5 rounded-lg text-xs text-[#dae2fd] focus:outline-none focus:border-[#c3f400]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg bg-[#c3f400] text-[#161e00] font-label-caps-sm text-xs uppercase font-extrabold cursor-pointer"
              >
                {isSaved ? 'Saved!' : 'Save Coach Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#131b2e] border-t border-[#222a3d] p-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#222a3d] text-[#dae2fd] font-label-caps-sm text-xs uppercase hover:bg-[#2d3449] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
