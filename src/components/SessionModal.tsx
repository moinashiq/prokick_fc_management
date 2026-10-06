import React from 'react';
import { TrainingSession } from '../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: TrainingSession;
  onSelectSession: (session: TrainingSession) => void;
}

const AVAILABLE_SESSIONS: TrainingSession[] = [
  {
    id: 's-01',
    pitch: 'Active Pitch 1 • Floodlit',
    title: '17:00 – 19:00 Evening Drills',
    subtitle: 'Main Pitch turf • Tactical Phase & High Press',
    timeRange: '17:00 – 19:00',
    kitNotice: 'Black / Electric Volt Matchday Kit',
    enrolledSquad: 'U-17 Academy (22 players)',
  },
  {
    id: 's-02',
    pitch: 'Main Pitch A • Morning Grass',
    title: '05:30 – 07:00 High Intensity',
    subtitle: 'Endurance sprints, box passing, physical conditioning',
    timeRange: '05:30 – 07:00',
    kitNotice: 'Grey Training Vest',
    enrolledSquad: 'U-17 Academy & Reserves',
  },
  {
    id: 's-03',
    pitch: 'Field B & Analytics Lab',
    title: '14:30 – 16:30 Video & Set Pieces',
    subtitle: 'Corners, free kicks, video tactical debrief',
    timeRange: '14:30 – 16:30',
    kitNotice: 'Club Tracksuit',
    enrolledSquad: 'All Squad Captains & Midfielders',
  },
  {
    id: 's-04',
    pitch: 'Stadium Pitch 2 • Match Simulation',
    title: '19:30 – 21:00 Intra-Squad 11v11',
    subtitle: 'Full match conditions with FIFA match officials',
    timeRange: '19:30 – 21:00',
    kitNotice: 'Official Pro Home vs Away Kit',
    enrolledSquad: 'U-17 Academy vs Reserves',
  },
];

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onSelectSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#171f33] border border-[#2d3449] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#222a3d] border-b border-[#2d3449] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3f400]">
              stadium
            </span>
            <span className="font-headline-md text-lg uppercase text-[#dae2fd]">
              Switch Touchline Session
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

        {/* Sessions list */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {AVAILABLE_SESSIONS.map((session) => {
            const isSelected = session.id === currentSession.id;
            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#222a3d] border-[#c3f400] shadow-[0_0_12px_rgba(195,244,0,0.2)]'
                    : 'bg-[#131b2e] border-[#222a3d] hover:bg-[#1e293b]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-caps-sm text-[11px] uppercase text-[#c3f400] font-bold">
                    {session.pitch}
                  </span>
                  {isSelected && (
                    <span className="px-1.5 py-0.5 rounded bg-[#c3f400] text-[#161e00] font-label-caps-sm text-[9px] font-extrabold uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h4 className="font-headline-md text-base uppercase text-[#dae2fd]">
                  {session.title}
                </h4>
                <p className="font-body-sm text-xs text-[#bfc5e4] mt-0.5">
                  {session.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#222a3d] text-[10px] text-[#8e9379]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">
                      checkroom
                    </span>
                    {session.kitNotice}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#131b2e] border-t border-[#222a3d] p-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#222a3d] text-[#dae2fd] font-label-caps-sm text-xs uppercase hover:bg-[#2d3449] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
