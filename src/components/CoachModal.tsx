import React from 'react';
import { CLUB_ASSETS } from '../data/initialSquad';

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFieldSupport: () => void;
}

export const CoachModal: React.FC<CoachModalProps> = ({
  isOpen,
  onClose,
  onOpenFieldSupport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#171f33] border border-[#2d3449] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#222a3d] border-b border-[#2d3449] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3f400]">
              sports
            </span>
            <span className="font-headline-md text-lg uppercase text-[#dae2fd]">
              Head Coach Profile &amp; Sideline Settings
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

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Coach Bio Card */}
          <div className="flex items-center gap-4 bg-[#131b2e] border border-[#222a3d] p-3.5 rounded-xl">
            <img
              src={CLUB_ASSETS.coachAvatarUrl}
              alt="Coach Rajnish Shankar"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#c3f400]"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-caps-sm text-[10px] uppercase text-[#c3f400] font-bold">
                PROKICK FC Head Coach
              </span>
              <h3 className="font-headline-md text-xl uppercase text-[#dae2fd]">
                Rajnish Shankar
              </h3>
              <p className="font-body-sm text-xs text-[#bfc5e4]">
                AIFFA D License Coach • Director of Prokick Football Club
              </p>
              <span className="font-label-caps-sm text-[10px] text-[#6ffbbe] mt-0.5 font-bold">
                Staff ID #PK-COACH-042
              </span>
            </div>
          </div>

          {/* Coach stats & credentials */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#222a3d] p-2.5 rounded-lg text-center border border-[#2d3449]">
              <span className="font-label-caps-sm text-[9px] uppercase text-[#bfc5e4]">
                Academy Squad
              </span>
              <span className="font-stat-numeral-md text-xl text-[#c3f400]">
                U-17 Elite
              </span>
            </div>
            <div className="bg-[#222a3d] p-2.5 rounded-lg text-center border border-[#2d3449]">
              <span className="font-label-caps-sm text-[9px] uppercase text-[#bfc5e4]">
                Active Enrolled
              </span>
              <span className="font-stat-numeral-md text-xl text-[#dae2fd]">
                22 Players
              </span>
            </div>
            <div className="bg-[#222a3d] p-2.5 rounded-lg text-center border border-[#2d3449]">
              <span className="font-label-caps-sm text-[9px] uppercase text-[#bfc5e4]">
                Season Win Rate
              </span>
              <span className="font-stat-numeral-md text-xl text-[#6ffbbe]">
                84.2%
              </span>
            </div>
          </div>

          {/* Touchline Quick Actions */}
          <div className="bg-[#131b2e] border border-[#222a3d] p-3.5 rounded-xl space-y-2">
            <h4 className="font-label-caps-md text-xs uppercase text-[#dae2fd]">
              Touchline Station Privileges
            </h4>
            <div className="space-y-1.5 text-xs text-[#bfc5e4]">
              <div className="flex items-center justify-between p-2 rounded bg-[#222a3d]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#c3f400]">
                    fingerprint
                  </span>
                  Biometric QR Matchday Gate Scanner
                </span>
                <span className="text-[#6ffbbe] font-bold">ENABLED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#222a3d]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#c3f400]">
                    wifi
                  </span>
                  Offline Sync Local Storage
                </span>
                <span className="text-[#6ffbbe] font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Support button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFieldSupport();
            }}
            className="w-full py-2.5 px-3 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] border border-[#2d3449] text-[#c3f400] font-label-caps-md text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              contact_support
            </span>
            <span>Contact Field Support Desk</span>
          </button>
        </div>

        {/* Footer */}
        <div className="bg-[#131b2e] border-t border-[#222a3d] p-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#222a3d] text-[#dae2fd] font-label-caps-sm text-xs uppercase hover:bg-[#2d3449] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
