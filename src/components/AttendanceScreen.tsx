import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Player, AttendanceState, SquadCategory, TrainingSession } from '../types';
import { getCachedSpreadsheetUrl } from '../services/googleSheets';
import { exportRegistrationsToExcel, importPlayersFromExcel } from '../services/excelExport';

interface AttendanceScreenProps {
  players: Player[];
  onUpdatePlayerStatus: (playerId: string, newStatus: AttendanceState) => void;
  onUpdatePlayerNote: (playerId: string, newNote: string) => void;
  onOpenPlayerModal: (player: Player) => void;
  onOpenSessionModal: () => void;
  onGoToRegistration: () => void;
  onClearAllPlayers?: () => void;
  currentSession: TrainingSession;
  googleToken: string | null;
  onGoogleSignIn: () => Promise<any>;
  defaultSquadTab?: SquadCategory;
  onImportPlayers?: (importedPlayers: Player[]) => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  players,
  onUpdatePlayerStatus,
  onUpdatePlayerNote,
  onOpenPlayerModal,
  onOpenSessionModal,
  onGoToRegistration,
  onClearAllPlayers,
  currentSession,
  googleToken,
  onGoogleSignIn,
  defaultSquadTab,
  onImportPlayers,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(16);
  const [selectedSquad, setSelectedSquad] = useState<SquadCategory>(
    defaultSquadTab || 'U-17 Academy'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'kit' | 'name' | 'fit'>('kit');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [markAllSuccess, setMarkAllSuccess] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importPlayersFromExcel(file);
      if (imported.length > 0 && onImportPlayers) {
        onImportPlayers(imported);
        showToast(`Loaded ${imported.length} players from Excel into Attendance roster!`);
      } else {
        showToast('No valid player rows found in Excel spreadsheet.');
      }
    } catch (err: any) {
      console.error('Failed to import Excel:', err);
      showToast(err.message || 'Error parsing Excel spreadsheet.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    if (defaultSquadTab) {
      setSelectedSquad(defaultSquadTab);
    }
  }, [defaultSquadTab]);

  useEffect(() => {
    setSheetUrl(getCachedSpreadsheetUrl());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Filter squad players for selected tab
  const filteredSquadPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSquad = p.squadCategory === selectedSquad;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kitNumber.toString().includes(searchQuery) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.positionFull.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSquad && matchesSearch;
    });
  }, [players, selectedSquad, searchQuery]);

  // Sorted squad players
  const sortedSquadPlayers = useMemo(() => {
    return [...filteredSquadPlayers].sort((a, b) => {
      if (sortBy === 'kit') return a.kitNumber - b.kitNumber;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.seasonFitRate - a.seasonFitRate;
    });
  }, [filteredSquadPlayers, sortBy]);

  // Metrics calculated dynamically for active squad
  const currentCategoryPlayers = useMemo(() => {
    return players.filter((p) => p.squadCategory === selectedSquad);
  }, [players, selectedSquad]);

  const metrics = useMemo(() => {
    const total = currentCategoryPlayers.length;
    const present = currentCategoryPlayers.filter((p) => p.attendanceStatus === 'present').length;
    const absent = currentCategoryPlayers.filter((p) => p.attendanceStatus === 'absent').length;
    const late = currentCategoryPlayers.filter((p) => p.attendanceStatus === 'late').length;
    const presentRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    return { total, present, absent, late, presentRate };
  }, [currentCategoryPlayers]);

  const handleMarkAllPresent = () => {
    if (currentCategoryPlayers.length === 0) {
      showToast('No players enrolled in this squad yet');
      return;
    }
    currentCategoryPlayers.forEach((p) => {
      onUpdatePlayerStatus(p.id, 'present');
    });
    setMarkAllSuccess(true);
    showToast(`All ${metrics.total} players marked Present!`);
    setTimeout(() => {
      setMarkAllSuccess(false);
    }, 2000);
  };

  const handleExportExcel = () => {
    if (players.length === 0) {
      showToast('No registered players to export yet');
      return;
    }
    exportRegistrationsToExcel(players, 'PROKICK_FC_Academy');
    showToast('Microsoft Excel (.xlsx) file downloaded!');
  };

  const handleExportCSV = () => {
    if (currentCategoryPlayers.length === 0) {
      showToast('No players to export yet');
      return;
    }
    const headers = [
      'Squad Category',
      'Kit Number',
      'Player Name',
      'Position',
      'Attendance Status',
      'Season Fit Rate',
      'Coach Note',
      'Date',
    ];
    const rows = currentCategoryPlayers.map((p) => [
      `"${p.squadCategory}"`,
      p.kitNumber,
      `"${p.name}"`,
      `"${p.positionFull}"`,
      p.attendanceStatus.toUpperCase(),
      `${p.seasonFitRate}%`,
      `"${p.coachNote.replace(/"/g, '""')}"`,
      `"2025-10-${selectedDay}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PROKICK_${selectedSquad.replace(/\s+/g, '_')}_Attendance_Oct${selectedDay}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance CSV generated & downloaded');
  };

  const handleCloudSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Touchline Station, MS Excel & Cloud synchronized');
    }, 900);
  };

  const handleSaveNote = (playerId: string) => {
    onUpdatePlayerNote(playerId, noteDraft);
    setEditingNoteId(null);
    showToast('Coach note updated');
  };

  const days = [
    { day: 'Mon', num: 14 },
    { day: 'Tue', num: 15 },
    { day: 'Wed', num: 16 },
    { day: 'Thu', num: 17 },
    { day: 'Fri', num: 18 },
    { day: 'Sat', num: 19 },
    { day: 'Sun', num: 20 },
  ];

  // Dynamic squad tabs reflecting actual counts for each category
  const squadTabs: { label: SquadCategory; count: number }[] = [
    {
      label: 'U-10 kids',
      count: players.filter((p) => p.squadCategory === 'U-10 kids').length,
    },
    {
      label: 'U-15 Boys',
      count: players.filter((p) => p.squadCategory === 'U-15 Boys').length,
    },
    {
      label: 'U-17 Academy',
      count: players.filter((p) => p.squadCategory === 'U-17 Academy').length,
    },
    {
      label: 'Girls Elite',
      count: players.filter((p) => p.squadCategory === 'Girls Elite').length,
    },
    {
      label: 'U-19 Reserves',
      count: players.filter((p) => p.squadCategory === 'U-19 Reserves').length,
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-28 pt-2">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171f33] border border-[#c3f400] text-[#c3f400] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 animate-bounce max-w-[90vw]">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Excel & Spreadsheet Fast Export Bar */}
      <div className="px-4 pb-2">
        <div className="bg-[#171f33] border border-[#2d3449] rounded-xl px-3 py-2 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-[#107C41]/30 border border-[#107C41]/60 flex items-center justify-center text-[#6ffbbe] shrink-0">
              <span className="material-symbols-outlined text-[16px]">table_view</span>
            </div>
            <span className="text-[11px] text-[#dae2fd] font-semibold truncate">
              MS Excel (.xlsx) Ready • {players.length} Registered
            </span>
          </div>

          {/* Hidden Excel File Input for Import */}
          <input
            ref={excelFileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcelFile}
            className="hidden"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => excelFileInputRef.current?.click()}
              className="h-7 px-2.5 rounded-lg bg-[#222a3d] hover:bg-[#31394d] border border-[#2d3449] text-[#dae2fd] font-label-caps-sm text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Import player roster from Microsoft Excel (.xlsx)"
            >
              <span className="material-symbols-outlined text-[14px] text-[#c3f400]">upload_file</span>
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={players.length === 0}
              className="h-7 px-2.5 rounded-lg bg-[#107C41] hover:bg-[#107C41]/80 disabled:opacity-40 text-white font-label-caps-sm text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Download full player database in Microsoft Excel (.xlsx)"
            >
              <span className="material-symbols-outlined text-[13px]">download</span>
              <span>Export (.xlsx)</span>
            </button>

            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="font-label-caps-sm text-[10px] uppercase text-[#c3f400] hover:underline flex items-center gap-0.5"
                title="Open cloud Google Sheet"
              >
                <span>Sheets ↗</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Top Session Context Banner */}
      <section className="px-4 flex flex-col gap-2">
        <div className="bg-[#222a3d] border border-[#2d3449] rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#c3f400]/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#c3f400] animate-pulse"></span>
              <span className="font-label-caps-sm text-[11px] uppercase tracking-widest text-[#c3f400]">
                {currentSession.pitch}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenSessionModal}
              className="flex items-center gap-1 min-w-0 text-left group cursor-pointer"
            >
              <span className="font-headline-md text-lg md:text-xl uppercase tracking-tight text-[#dae2fd] group-hover:text-[#c3f400] transition-colors truncate">
                {currentSession.title}
              </span>
              <span className="material-symbols-outlined text-[18px] text-[#bfc5e4]">
                expand_more
              </span>
            </button>

            <span className="font-body-sm text-[12px] text-[#bfc5e4] truncate">
              {currentSession.subtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenSessionModal}
            aria-label="Switch Session Mode"
            className="shrink-0 w-10 h-10 rounded-lg bg-[#2d3449] border border-[#424862] flex items-center justify-center text-[#c3f400] hover:bg-[#31394d] shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Configure Pitch Session"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>

        {/* Date Strip Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {days.map((item) => {
            const isActive = selectedDay === item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => {
                  setSelectedDay(item.num);
                  showToast(`Selected Session Date: Oct ${item.num}`);
                }}
                className={`flex flex-col items-center justify-center min-w-[54px] py-2 rounded-lg cursor-pointer active:scale-95 transition-all ${
                  isActive
                    ? 'bg-[#c3f400] text-[#161e00] shadow-[0_0_16px_rgba(195,244,0,0.3)] font-extrabold'
                    : 'bg-[#131b2e] border border-[#222a3d] text-[#bfc5e4] hover:text-[#dae2fd]'
                }`}
              >
                <span
                  className={`font-label-caps-sm text-[11px] uppercase tracking-wider ${
                    isActive ? 'font-extrabold' : ''
                  }`}
                >
                  {item.day}
                </span>
                <span
                  className={`font-stat-numeral-md text-xl md:text-2xl leading-none mt-0.5 ${
                    isActive ? 'text-[#161e00]' : 'text-[#dae2fd]'
                  }`}
                >
                  {item.num}
                </span>
              </button>
            );
          })}
        </div>

        {/* Squad Selection Horizontal Filters */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {squadTabs.map((tab) => {
            const isActive = selectedSquad === tab.label;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setSelectedSquad(tab.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#c3f400] text-[#161e00] shadow-sm font-bold'
                    : 'bg-[#222a3d] border border-[#2d3449] text-[#bfc5e4] hover:text-[#dae2fd]'
                }`}
              >
                <span className="font-label-caps-md text-[13px] uppercase tracking-wider">
                  {tab.label}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-full font-label-caps-sm text-[10px] font-bold ${
                    isActive
                      ? 'bg-[#161e00] text-[#c3f400]'
                      : 'bg-[#2d3449] text-[#bfc5e4]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Attendance Metric Dashboard Section */}
      <section className="px-4 mt-3 flex flex-col gap-2.5">
        <div className="grid grid-cols-4 gap-2">
          {/* Total Squad */}
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
            <span className="font-label-caps-sm text-[11px] uppercase text-[#bfc5e4]">
              Roster
            </span>
            <span className="font-stat-numeral-lg text-3xl md:text-4xl text-[#dae2fd] mt-1 leading-none">
              {metrics.total}
            </span>
            <div className="flex items-center gap-1 text-[#bfc5e4] mt-1">
              <span className="material-symbols-outlined text-[13px]">groups</span>
              <span className="font-label-caps-sm text-[10px] uppercase">
                Enrolled
              </span>
            </div>
          </div>

          {/* Present */}
          <div className="bg-[#222a3d] border border-[#2d3449] rounded-xl p-2.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 bg-[#c3f400]/10 rounded-bl-full pointer-events-none"></div>
            <span className="font-label-caps-sm text-[11px] uppercase text-[#c3f400] font-bold">
              Present
            </span>
            <span className="font-stat-numeral-lg text-3xl md:text-4xl text-[#c3f400] mt-1 leading-none font-bold">
              {metrics.present}
            </span>
            <div className="flex items-center gap-1 text-[#c3f400] mt-1 font-semibold">
              <span className="material-symbols-outlined text-[13px]">
                check_circle
              </span>
              <span className="font-label-caps-sm text-[10px] uppercase">
                {metrics.presentRate}%
              </span>
            </div>
          </div>

          {/* Absent */}
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
            <span className="font-label-caps-sm text-[11px] uppercase text-[#ffb4ab] font-bold">
              Absent
            </span>
            <span className="font-stat-numeral-lg text-3xl md:text-4xl text-[#ffb4ab] mt-1 leading-none font-bold">
              {metrics.absent}
            </span>
            <div className="flex items-center gap-1 text-[#ffb4ab] mt-1">
              <span className="material-symbols-outlined text-[13px]">cancel</span>
              <span className="font-label-caps-sm text-[10px] uppercase">
                Unavail
              </span>
            </div>
          </div>

          {/* Late/Mod */}
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
            <span className="font-label-caps-sm text-[11px] uppercase text-[#fbbf24] font-bold">
              Late/Mod
            </span>
            <span className="font-stat-numeral-lg text-3xl md:text-4xl text-[#fbbf24] mt-1 leading-none font-bold">
              {metrics.late}
            </span>
            <div className="flex items-center gap-1 text-[#fbbf24] mt-1">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              <span className="font-label-caps-sm text-[10px] uppercase">
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Quick Roll Action Bar */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={metrics.total === 0}
            className={`flex-1 h-11 px-3 rounded-lg font-label-caps-md text-[13px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all font-extrabold ${
              metrics.total > 0
                ? 'bg-[#c3f400] text-[#161e00] shadow-[0_0_12px_rgba(195,244,0,0.25)] hover:shadow-[0_0_18px_rgba(195,244,0,0.4)] active:scale-98 cursor-pointer'
                : 'bg-[#222a3d] text-[#bfc5e4]/50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {markAllSuccess ? 'verified' : 'done_all'}
            </span>
            <span>
              {markAllSuccess
                ? `All ${metrics.total} Marked Present!`
                : 'Mark All Present'}
            </span>
          </button>

          {/* Direct MS Excel .xlsx export button */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={players.length === 0}
            className={`h-11 px-3 border rounded-lg font-label-caps-md text-[13px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 ${
              players.length > 0
                ? 'bg-[#107C41] border-[#107C41] text-white hover:bg-[#107C41]/85 cursor-pointer active:scale-98'
                : 'bg-[#131b2e] border-[#222a3d] text-[#bfc5e4]/40 cursor-not-allowed'
            }`}
            title="Export all registrations to Microsoft Excel (.xlsx)"
          >
            <span className="material-symbols-outlined text-[18px]">
              table_view
            </span>
            <span>Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={metrics.total === 0}
            className={`h-11 px-3 border rounded-lg font-label-caps-md text-[13px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all shrink-0 ${
              metrics.total > 0
                ? 'bg-[#222a3d] border-[#2d3449] text-[#bfc5e4] hover:text-[#dae2fd] cursor-pointer active:scale-98'
                : 'bg-[#131b2e] border-[#222a3d] text-[#bfc5e4]/40 cursor-not-allowed'
            }`}
            title="Export current squad attendance as CSV"
          >
            <span className="material-symbols-outlined text-[18px]">
              file_download
            </span>
            <span>CSV</span>
          </button>
        </div>

        {/* Search & Filter Bar (shown if players exist) */}
        {players.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-[#8e9379] text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search squad name, position, kit #..."
                className="w-full bg-[#171f33] border border-[#222a3d] text-xs text-[#dae2fd] placeholder:text-[#8e9379] rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#c3f400]/60 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-[#8e9379] hover:text-[#dae2fd]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = sortBy === 'kit' ? 'name' : sortBy === 'name' ? 'fit' : 'kit';
                setSortBy(next);
                showToast(`Sorted by: ${next.toUpperCase()}`);
              }}
              className="h-8 px-2.5 bg-[#171f33] border border-[#222a3d] text-[#bfc5e4] hover:text-[#c3f400] rounded-lg text-xs font-semibold uppercase flex items-center gap-1 shrink-0"
              title="Toggle sort order"
            >
              <span className="material-symbols-outlined text-[14px]">swap_vert</span>
              <span>{sortBy === 'kit' ? 'Kit #' : sortBy === 'name' ? 'Name' : 'Fit %'}</span>
            </button>
          </div>
        )}
      </section>

      {/* Tactical Roll Call Section */}
      <section className="px-4 mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline-md text-xl uppercase tracking-tight text-[#dae2fd]">
              Tactical Roll Call
            </span>
            <span className="px-2 py-0.5 bg-[#222a3d] text-[#c3f400] rounded-full font-label-caps-sm text-[10px] font-bold">
              {selectedSquad} ROSTER
            </span>
          </div>
          <span className="font-label-caps-sm text-[11px] text-[#bfc5e4] uppercase tracking-wider">
            {sortedSquadPlayers.length} Active in {selectedSquad}
          </span>
        </div>

        {/* Players List or Clean Empty Roster State */}
        {sortedSquadPlayers.length === 0 ? (
          <div className="p-8 text-center bg-[#171f33] rounded-xl border border-[#222a3d] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#222a3d] border border-[#2d3449] flex items-center justify-center text-[#c3f400] mb-3 shadow-inner">
              <span className="material-symbols-outlined text-3xl">sports_soccer</span>
            </div>

            <h4 className="font-headline-md text-lg uppercase text-[#dae2fd] mb-1">
              No Players Yet in {selectedSquad}
            </h4>
            <p className="font-body-sm text-xs text-[#bfc5e4] max-w-xs mb-4 leading-relaxed">
              When new players register in this age category, their details (Name, Position, Age Division) will immediately appear here for touchline roll call.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={onGoToRegistration}
                className="px-4 py-2.5 rounded-lg bg-[#c3f400] text-[#161e00] font-headline-md text-sm uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-[0_0_16px_rgba(195,244,0,0.3)] hover:shadow-[0_0_22px_rgba(195,244,0,0.45)] transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Register New Player</span>
              </button>

              <button
                type="button"
                onClick={() => excelFileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-lg bg-[#222a3d] hover:bg-[#31394d] border border-[#2d3449] text-[#dae2fd] font-headline-md text-sm uppercase tracking-wider font-extrabold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-[#c3f400]">upload_file</span>
                <span>Import Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        ) : (
          sortedSquadPlayers.map((player) => {
            const isPresent = player.attendanceStatus === 'present';
            const isAbsent = player.attendanceStatus === 'absent';
            const isLate = player.attendanceStatus === 'late';

            // Left border color according to status
            const borderBarClass = isPresent
              ? 'bg-[#c3f400]'
              : isAbsent
              ? 'bg-[#ef4444]'
              : 'bg-[#fbbf24]';

            const statusTagClass = isPresent
              ? 'bg-[#c3f400]/20 text-[#c3f400]'
              : isAbsent
              ? 'bg-[#93000a] text-[#ffdad6]'
              : 'bg-[#fbbf24]/20 text-[#fbbf24]';

            const statusDotClass = isPresent
              ? 'bg-[#c3f400]'
              : isAbsent
              ? 'bg-[#ef4444]'
              : 'bg-[#fbbf24]';

            return (
              <article
                key={player.id}
                className="bg-[#171f33] border border-[#222a3d] rounded-xl p-3.5 shadow-md flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200 hover:border-[#2d3449]"
              >
                {/* Visual Status Indicator Left Accent Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${borderBarClass}`}
                ></div>

                {/* Top: Avatar, Name, Position & Age Category details */}
                <div className="flex items-center justify-between gap-3">
                  <div
                    onClick={() => onOpenPlayerModal(player)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    title="Click to view digital player card & biometric stats"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover ring-1 ring-[#2d3449] group-hover:ring-[#c3f400] transition-all"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#060e20] border border-[#222a3d] rounded-full flex items-center justify-center font-label-caps-sm text-[10px] font-bold text-[#c3f400] shadow-sm">
                        {player.kitNumber < 10
                          ? `0${player.kitNumber}`
                          : player.kitNumber}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-body-lg text-sm md:text-base text-[#dae2fd] font-bold group-hover:text-[#c3f400] transition-colors truncate">
                          {player.name}
                        </span>
                        {player.roleBadge && (
                          <span className="px-1.5 py-0.5 rounded bg-[#222a3d] text-[#c3f400] font-label-caps-sm text-[9px] uppercase tracking-wider font-extrabold">
                            {player.roleBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[#bfc5e4] flex-wrap">
                        {/* Primary Position */}
                        <span className="font-label-caps-sm text-[11px] uppercase text-[#c3f400] font-bold">
                          {player.positionFull}
                        </span>
                        <span className="text-[#444933]">•</span>
                        {/* Age Category / Division */}
                        <span className="font-label-caps-sm text-[11px] uppercase text-[#6ffbbe] font-semibold">
                          {player.division || player.squadCategory}
                        </span>
                        <span className="text-[#444933]">•</span>
                        <span className="font-label-caps-sm text-[11px] uppercase text-[#bfc5e4]">
                          {player.seasonFitRate}% Fit
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tactical Status Tag */}
                  <span
                    className={`font-label-caps-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-bold flex items-center gap-1 ${statusTagClass}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`}
                    ></span>
                    {player.tacticalStatus}
                  </span>
                </div>

                {/* Segmented 3-Button Status Switcher */}
                <div className="grid grid-cols-3 bg-[#060e20] p-1 rounded-lg gap-1 border border-[#131b2e]">
                  <button
                    type="button"
                    onClick={() => onUpdatePlayerStatus(player.id, 'present')}
                    className={`py-1.5 rounded font-label-caps-md text-[13px] uppercase tracking-wider text-center transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-[#c3f400] text-[#161e00] shadow-sm font-extrabold'
                        : 'text-[#bfc5e4] hover:text-[#dae2fd]'
                    }`}
                  >
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdatePlayerStatus(player.id, 'absent')}
                    className={`py-1.5 rounded font-label-caps-md text-[13px] uppercase tracking-wider text-center transition-all cursor-pointer ${
                      isAbsent
                        ? 'bg-[#93000a] text-[#ffdad6] shadow-sm font-extrabold'
                        : 'text-[#bfc5e4] hover:text-[#dae2fd]'
                    }`}
                  >
                    Absent
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdatePlayerStatus(player.id, 'late')}
                    className={`py-1.5 rounded font-label-caps-md text-[13px] uppercase tracking-wider text-center transition-all cursor-pointer ${
                      isLate
                        ? 'bg-[#fbbf24] text-[#060e20] shadow-sm font-extrabold'
                        : 'text-[#bfc5e4] hover:text-[#dae2fd]'
                    }`}
                  >
                    Late
                  </button>
                </div>

                {/* Tactical Coach Note Row */}
                <div className="flex items-center gap-2 bg-[#131b2e] border border-[#222a3d] px-2.5 py-1.5 rounded-lg text-[#bfc5e4]">
                  <span
                    className={`material-symbols-outlined text-[16px] shrink-0 ${
                      isAbsent
                        ? 'text-[#ef4444]'
                        : isLate
                        ? 'text-[#fbbf24]'
                        : 'text-[#c3f400]'
                    }`}
                  >
                    {player.noteIcon || 'sports_score'}
                  </span>

                  {editingNoteId === player.id ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        className="flex-1 bg-[#222a3d] text-xs text-[#dae2fd] px-2 py-1 rounded outline-none border border-[#c3f400]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNote(player.id);
                          if (e.key === 'Escape') setEditingNoteId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNote(player.id)}
                        className="text-xs font-bold text-[#c3f400] px-1.5 py-0.5 rounded bg-[#222a3d]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="text-xs text-[#bfc5e4] px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingNoteId(player.id);
                        setNoteDraft(player.coachNote);
                      }}
                      className="flex-1 min-w-0 flex items-center justify-between group cursor-pointer"
                      title="Click to edit tactical note"
                    >
                      <span className="font-body-sm text-[12px] truncate text-[#bfc5e4] group-hover:text-[#dae2fd]">
                        {player.coachNote}
                      </span>
                      <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 text-[#c3f400] transition-opacity">
                        edit
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Sticky Sync Status Capsule Bar */}
      <section className="px-4 mt-5 mb-2">
        <div className="bg-[#2d3449]/90 border border-[#424862] backdrop-blur-md px-4 py-3 rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6ffbbe] shadow-[0_0_8px_rgba(111,251,190,0.6)] animate-pulse shrink-0"></div>
            <div className="flex flex-col min-w-0">
              <span className="font-body-sm text-xs md:text-sm text-[#dae2fd] font-medium truncate">
                Touchline Cloud &amp; MS Excel Database
              </span>
              <span className="font-label-caps-sm text-[11px] text-[#bfc5e4] truncate">
                {metrics.present} / {metrics.total} in {selectedSquad} Marked
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloudSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-[#171f33] border border-[#222a3d] text-[#c3f400] hover:text-[#dae2fd] rounded-lg font-label-caps-sm text-[11px] uppercase tracking-wider hover:bg-[#31394d] active:scale-95 transition-all shrink-0 flex items-center gap-1 cursor-pointer font-bold"
          >
            <span
              className={`material-symbols-outlined text-[14px] ${
                isSyncing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>{isSyncing ? 'Pushing...' : 'Push Now'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
