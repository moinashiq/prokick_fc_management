/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Player, AttendanceState, SquadCategory, TrainingSession } from './types';
import { INITIAL_PLAYERS } from './data/initialSquad';
import { Header } from './components/Header';
import { BottomNav, AppTab } from './components/BottomNav';
import { AccessScreen } from './components/AccessScreen';
import { AttendanceScreen } from './components/AttendanceScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { PlayerModal } from './components/PlayerModal';
import { SessionModal } from './components/SessionModal';
import { CoachModal } from './components/CoachModal';
import { FieldSupportModal } from './components/FieldSupportModal';
import { initAuth, googleSignIn, logoutGoogle } from './services/googleAuth';

const STORAGE_KEY = 'prokick_fc_squad_players_v2';
const AUTH_SESSION_KEY = 'prokick_portal_auth_session';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('access');
  const [activeAttendanceSquad, setActiveAttendanceSquad] = useState<SquadCategory>('U-17 Academy');

  // Gated Portal Access State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Google Workspace Authentication State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  // Initialize Auth & clear legacy mock player storage
  useEffect(() => {
    try {
      localStorage.removeItem('prokick_fc_squad_players_v1');
    } catch {
      // Ignore
    }

    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingInGoogle(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        return res;
      }
    } catch (err) {
      console.error('Google Sign In failed:', err);
      throw err;
    } finally {
      setIsLoggingInGoogle(false);
    }
    return null;
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
  };

  // Load players from local storage or start with empty roster as requested
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PLAYERS;
  });

  // Current Pitch Training Session
  const [currentSession, setCurrentSession] = useState<TrainingSession>({
    id: 's-01',
    pitch: 'Active Pitch 1 • Floodlit',
    title: '17:00 – 19:00 Evening Drills',
    subtitle: 'Main Pitch turf • Tactical Phase & High Press',
    timeRange: '17:00 – 19:00',
    kitNotice: 'Black / Electric Volt Matchday Kit',
    enrolledSquad: 'PROKICK Academy Active Squad',
  });

  // Modals state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isFieldSupportOpen, setIsFieldSupportOpen] = useState(false);

  // Sync players to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    } catch {
      // Ignore quota errors
    }
  }, [players]);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    } catch {
      // Ignore
    }
    setCurrentTab('attendance');
    showToast('Portal Access Granted! Welcome Coach Rajnish.');
  };

  // Handle terminal logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // Ignore
    }
    setCurrentTab('access');
    showToast('Touchline Portal Locked. Please log in to regain access.');
  };

  // Tab switching guard - strictly locked until authenticated
  const handleTabChange = (tab: AppTab) => {
    if (!isAuthenticated) {
      setCurrentTab('access');
      return;
    }
    if (tab === 'attendance' || tab === 'registration') {
      setCurrentTab(tab);
    }
  };

  // Update attendance state for a player
  const handleUpdatePlayerStatus = (playerId: string, newStatus: AttendanceState) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          let updatedTacticalStatus = p.tacticalStatus;
          if (newStatus === 'present' && p.tacticalStatus === 'Excused') {
            updatedTacticalStatus = 'Cleared Fit';
          } else if (newStatus === 'absent') {
            updatedTacticalStatus = 'Unavailable';
          } else if (newStatus === 'late') {
            updatedTacticalStatus = 'En Route';
          }
          return {
            ...p,
            attendanceStatus: newStatus,
            tacticalStatus: updatedTacticalStatus,
          };
        }
        return p;
      })
    );

    if (selectedPlayer && selectedPlayer.id === playerId) {
      setSelectedPlayer((prev) => (prev ? { ...prev, attendanceStatus: newStatus } : null));
    }
  };

  // Update tactical coach note for a player
  const handleUpdatePlayerNote = (playerId: string, newNote: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, coachNote: newNote } : p))
    );

    if (selectedPlayer && selectedPlayer.id === playerId) {
      setSelectedPlayer((prev) => (prev ? { ...prev, coachNote: newNote } : null));
    }
  };

  // Register a newly enrolled recruit
  const handleRegisterPlayer = (newPlayer: Player) => {
    setPlayers((prev) => [newPlayer, ...prev]);
    setActiveAttendanceSquad(newPlayer.squadCategory);
  };

  // Import players from Excel spreadsheet database
  const handleImportPlayers = (importedPlayers: Player[]) => {
    setPlayers((prev) => {
      const existingNames = new Set(prev.map((p) => p.name.trim().toLowerCase()));
      const uniqueNew = importedPlayers.filter((p) => !existingNames.has(p.name.trim().toLowerCase()));
      const merged = [...uniqueNew, ...prev];
      return merged;
    });
    if (importedPlayers.length > 0) {
      setActiveAttendanceSquad(importedPlayers[0].squadCategory);
    }
    showToast(`Loaded ${importedPlayers.length} players from Excel into Squad Database!`);
  };

  // Clear all player data
  const handleClearAllPlayers = () => {
    setPlayers([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Compute header title based on current screen
  const getHeaderTitle = () => {
    if (!isAuthenticated) {
      return 'Staff Login';
    }
    switch (currentTab) {
      case 'attendance':
        return 'Attendance';
      case 'registration':
        return 'Registration';
      default:
        return 'Attendance';
    }
  };

  const squadCount = players.length;

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col selection:bg-[#c3f400] selection:text-[#161e00]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171f33] border border-[#c3f400] text-[#c3f400] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 animate-bounce max-w-[90vw]">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        title={getHeaderTitle()}
        onOpenCoachModal={() => setIsCoachModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 bg-[#0b1326]">
        {currentTab === 'access' && (
          <AccessScreen
            onLoginSuccess={handleLoginSuccess}
            onOpenFieldSupport={() => setIsFieldSupportOpen(true)}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceScreen
            players={players}
            onUpdatePlayerStatus={handleUpdatePlayerStatus}
            onUpdatePlayerNote={handleUpdatePlayerNote}
            onOpenPlayerModal={(player) => setSelectedPlayer(player)}
            onOpenSessionModal={() => setIsSessionModalOpen(true)}
            onGoToRegistration={() => handleTabChange('registration')}
            onClearAllPlayers={handleClearAllPlayers}
            currentSession={currentSession}
            googleToken={googleToken}
            onGoogleSignIn={handleGoogleSignIn}
            defaultSquadTab={activeAttendanceSquad}
            onImportPlayers={handleImportPlayers}
          />
        )}

        {currentTab === 'registration' && (
          <RegistrationScreen
            onRegisterPlayer={handleRegisterPlayer}
            onGoToAttendance={(category) => {
              if (category) setActiveAttendanceSquad(category);
              handleTabChange('attendance');
            }}
            googleToken={googleToken}
            googleUser={googleUser}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            isLoggingInGoogle={isLoggingInGoogle}
            allPlayers={players}
            onImportPlayers={handleImportPlayers}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation with Gated Access */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        squadCount={squadCount}
        isAuthenticated={isAuthenticated}
      />

      {/* Modals */}
      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onUpdateStatus={handleUpdatePlayerStatus}
        onUpdateNote={handleUpdatePlayerNote}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        currentSession={currentSession}
        onSelectSession={setCurrentSession}
      />

      <CoachModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        onOpenFieldSupport={() => {
          setIsCoachModalOpen(false);
          setIsFieldSupportOpen(true);
        }}
      />

      <FieldSupportModal
        isOpen={isFieldSupportOpen}
        onClose={() => setIsFieldSupportOpen(false)}
      />
    </div>
  );
}
