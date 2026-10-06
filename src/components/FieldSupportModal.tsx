import React from 'react';

interface FieldSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FieldSupportModal: React.FC<FieldSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#171f33] border border-[#2d3449] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#222a3d] border-b border-[#2d3449] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3f400]">
              support_agent
            </span>
            <span className="font-headline-md text-lg uppercase text-[#dae2fd]">
              Field Support Desk
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

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs text-[#bfc5e4]">
          <div className="p-3 bg-[#131b2e] border border-[#222a3d] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ef4444]/20 border border-[#ef4444]/40 flex items-center justify-center text-[#ef4444] shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                emergency
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-sm uppercase text-[#dae2fd]">
                Pitch Paramedic Station
              </span>
              <span className="text-[11px] text-[#bfc5e4]">
                Stationed at Pitch 2 Medical Tent • Speed Dial #991
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] border border-[#222a3d] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c3f400]/20 border border-[#c3f400]/40 flex items-center justify-center text-[#c3f400] shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                call
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-sm uppercase text-[#dae2fd]">
                Touchline Tech Hotline
              </span>
              <span className="text-[11px] text-[#bfc5e4]">
                +1 (800) 555-PROKICK (Ext. 4) • Direct Support
              </span>
            </div>
          </div>

          <div className="bg-[#222a3d] p-3 rounded-xl border border-[#2d3449] space-y-1.5">
            <h5 className="font-label-caps-md text-[11px] uppercase text-[#dae2fd]">
              Offline Field Protocol
            </h5>
            <p className="text-[11px] leading-relaxed">
              If cellular/Wi-Fi coverage drops on the touchline, the app stores all attendance records and new digital passes in local browser storage. Once connection restores, click <strong>Push Now</strong> on the attendance screen to synchronize.
            </p>
          </div>
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
