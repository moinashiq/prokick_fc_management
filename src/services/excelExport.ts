import * as XLSX from 'xlsx';
import { Player, PositionCode, SquadCategory, AttendanceState } from '../types';
import { CLUB_ASSETS } from '../data/initialSquad';

/**
 * Generates and downloads a native Microsoft Excel (.xlsx) workbook
 * containing all player registrations and attendance details on demand.
 */
export function exportRegistrationsToExcel(players: Player[], filenamePrefix = 'PROKICK_FC_Academy') {
  if (!players || players.length === 0) {
    // Generate template with headers even if empty
    const emptyRows = [
      {
        'Timestamp': new Date().toLocaleString(),
        'Pass ID': '#PK-DEMO',
        'Legal Full Name': 'Sample Player',
        'Jersey Print / Nickname': 'Sample',
        'Division / Age Bracket': 'U-10 kids (10 yrs)',
        'Squad Category': 'U-10 kids',
        'Primary Position': 'MID • Central Playmaker',
        'Position Code': 'MID',
        'Squad Number': 10,
        'Kit Size': 'M',
        'Attendance Status': 'PRESENT',
        'Season Fit Rate': '98%',
        'Tactical Status': 'Newly Enrolled',
        'Guardian Full Name': 'Guardian Name',
        'Emergency Phone': '+1 555-0100',
        'Relationship': 'Parent',
        'Medical & Allergy Notes': 'None',
        'Coach Tactical Note': 'Roster entry',
        'Registration Date': new Date().toLocaleDateString(),
      },
    ];

    const ws = XLSX.utils.json_to_sheet(emptyRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Player Registrations');
    XLSX.writeFile(wb, `${filenamePrefix}_Registrations_Template.xlsx`);
    return;
  }

  // 1. Prepare Registrations Sheet data
  const registrationRows = players.map((p, idx) => ({
    'Record #': idx + 1,
    'Pass ID': p.id.startsWith('pk-') ? `#PK-${p.id.slice(3, 8)}` : `#PK-${p.kitNumber}`,
    'Legal Full Name': p.name,
    'Jersey Print / Nickname': p.nickname || '-',
    'Division / Age Bracket': p.division || p.squadCategory,
    'Squad Category': p.squadCategory,
    'Primary Position': p.positionFull,
    'Position Code': p.position,
    'Squad Number': p.kitNumber,
    'Kit Size': p.kitSize || 'M',
    'Attendance Status': p.attendanceStatus.toUpperCase(),
    'Season Fit Rate': `${p.seasonFitRate}%`,
    'Tactical Status': p.tacticalStatus,
    'Guardian Full Name': p.emergencyContact?.guardianName || '-',
    'Emergency Phone': p.emergencyContact?.phone || '-',
    'Relationship': p.emergencyContact?.relationship || '-',
    'Medical & Allergy Notes': p.medicalNotes || 'None',
    'Coach Tactical Note': p.coachNote || '-',
    'Registration Date': new Date().toLocaleDateString(),
  }));

  // 2. Prepare Attendance Roll Call Sheet data
  const attendanceRows = players.map((p) => ({
    'Squad Category': p.squadCategory,
    'Squad No': p.kitNumber,
    'Player Name': p.name,
    'Position': p.positionFull,
    'Roll Call Status': p.attendanceStatus.toUpperCase(),
    'Tactical Readiness': p.tacticalStatus,
    'Coach Note': p.coachNote,
  }));

  const wb = XLSX.utils.book_new();

  // Create worksheets
  const wsRegistrations = XLSX.utils.json_to_sheet(registrationRows);
  const wsAttendance = XLSX.utils.json_to_sheet(attendanceRows);

  // Set column widths for clean viewing in Microsoft Excel
  wsRegistrations['!cols'] = [
    { wch: 10 }, // Record #
    { wch: 12 }, // Pass ID
    { wch: 22 }, // Name
    { wch: 18 }, // Nickname
    { wch: 20 }, // Division
    { wch: 16 }, // Squad Category
    { wch: 24 }, // Position
    { wch: 14 }, // Code
    { wch: 12 }, // Squad Number
    { wch: 10 }, // Kit Size
    { wch: 18 }, // Attendance
    { wch: 14 }, // Season Fit
    { wch: 18 }, // Tactical
    { wch: 22 }, // Guardian
    { wch: 18 }, // Phone
    { wch: 14 }, // Relationship
    { wch: 30 }, // Medical Notes
    { wch: 32 }, // Coach Note
    { wch: 16 }, // Date
  ];

  wsAttendance['!cols'] = [
    { wch: 16 }, // Squad Category
    { wch: 10 }, // Squad No
    { wch: 22 }, // Player Name
    { wch: 24 }, // Position
    { wch: 18 }, // Roll Call Status
    { wch: 20 }, // Tactical
    { wch: 35 }, // Note
  ];

  XLSX.utils.book_append_sheet(wb, wsRegistrations, 'Player Registrations');
  XLSX.utils.book_append_sheet(wb, wsAttendance, 'Attendance Roll Call');

  // Trigger file download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filenamePrefix}_Database_${dateStr}.xlsx`);
}

/**
 * Imports player records from an uploaded Microsoft Excel (.xlsx / .xls) file.
 * Returns parsed Player objects ready to be saved in the squad database and Attendance screen.
 */
export async function importPlayersFromExcel(file: File): Promise<Player[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Look for 'Player Registrations', 'Registrations', or fallback to the first sheet
  const sheetName =
    workbook.SheetNames.find(
      (n) =>
        n.toLowerCase().includes('registration') ||
        n.toLowerCase().includes('player') ||
        n.toLowerCase().includes('roster')
    ) || workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('No valid sheets found in the Excel workbook');
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The selected Excel spreadsheet contains no player records.');
  }

  const importedPlayers: Player[] = [];

  rawRows.forEach((row, idx) => {
    // Extract Name
    const name =
      row['Legal Full Name'] ||
      row['Player Name'] ||
      row['Full Name'] ||
      row['Name'] ||
      row['Player'] ||
      '';

    if (!name || typeof name !== 'string' || !name.trim()) {
      return; // Skip empty row
    }

    const trimmedName = name.trim();

    // Extract Squad Category
    const rawCategory =
      row['Squad Category'] ||
      row['Category'] ||
      row['Squad'] ||
      row['Division / Age Bracket'] ||
      row['Division'] ||
      '';

    let squadCategory: SquadCategory = 'U-17 Academy';
    const catLower = String(rawCategory).toLowerCase();
    if (catLower.includes('10')) squadCategory = 'U-10 kids';
    else if (catLower.includes('15')) squadCategory = 'U-15 Boys';
    else if (catLower.includes('girl')) squadCategory = 'Girls Elite';
    else if (catLower.includes('19') || catLower.includes('reserve')) squadCategory = 'U-19 Reserves';
    else if (catLower.includes('17')) squadCategory = 'U-17 Academy';

    // Extract Position
    const rawPos =
      row['Primary Position'] ||
      row['Position'] ||
      row['Position Code'] ||
      'MID';

    let posCode: PositionCode = 'MID';
    let posFull = 'MID • Central Playmaker';
    const posStr = String(rawPos).toUpperCase();

    if (posStr.includes('GK') || posStr.includes('GOAL')) {
      posCode = 'GK';
      posFull = 'GK • Goalkeeper';
    } else if (posStr.includes('DEF') || posStr.includes('BACK')) {
      posCode = 'DEF';
      posFull = 'DEF • Center Back';
    } else if (posStr.includes('FWD') || posStr.includes('STRIKER') || posStr.includes('WING')) {
      posCode = 'FWD';
      posFull = 'FWD • Striker / Wing';
    } else {
      posCode = 'MID';
      posFull = 'MID • Central Playmaker';
    }

    // Extract Kit Number
    const rawKit =
      row['Squad Number'] ||
      row['Kit Number'] ||
      row['Squad No'] ||
      row['Kit #'] ||
      row['Kit'] ||
      idx + 1;
    const kitNumber = parseInt(String(rawKit), 10) || (idx + 1);

    // Extract Attendance Status
    const rawStatus =
      row['Attendance Status'] ||
      row['Roll Call Status'] ||
      row['Status'] ||
      'present';

    let attendanceStatus: AttendanceState = 'present';
    const statusLower = String(rawStatus).toLowerCase();
    if (statusLower.includes('absent')) attendanceStatus = 'absent';
    else if (statusLower.includes('late')) attendanceStatus = 'late';
    else attendanceStatus = 'present';

    // Extract Nickname
    const nickname =
      row['Jersey Print / Nickname'] ||
      row['Nickname'] ||
      undefined;

    // Extract Division text
    const division =
      row['Division / Age Bracket'] ||
      row['Division'] ||
      `${squadCategory}`;

    // Extract Fit Rate
    const rawFit = row['Season Fit Rate'] || row['Fit Rate'] || '95';
    const seasonFitRate = parseInt(String(rawFit).replace('%', ''), 10) || 95;

    // Tactical Status
    const tacticalStatus =
      row['Tactical Status'] ||
      row['Tactical Readiness'] ||
      'Active Squad';

    // Coach Note
    const coachNote =
      row['Coach Tactical Note'] ||
      row['Coach Note'] ||
      'Imported from Excel database';

    const player: Player = {
      id: `pk-xl-${Date.now()}-${idx}`,
      name: trimmedName,
      nickname: nickname && nickname !== '-' ? String(nickname) : undefined,
      photoUrl: CLUB_ASSETS.defaultPassPlayerUrl,
      kitNumber,
      position: posCode,
      positionFull: posFull,
      squadCategory,
      division: String(division),
      seasonFitRate,
      tacticalStatus: String(tacticalStatus),
      attendanceStatus,
      coachNote: String(coachNote),
      noteIcon: 'badge',
      kitSize: String(row['Kit Size'] || 'M'),
      emergencyContact: {
        guardianName: String(row['Guardian Full Name'] || row['Guardian Name'] || ''),
        phone: String(row['Emergency Phone'] || row['Phone'] || ''),
        relationship: String(row['Relationship'] || 'Parent'),
      },
      medicalNotes: String(row['Medical & Allergy Notes'] || row['Medical Notes'] || ''),
      preferredFoot: 'Right',
      sprintSpeed: '32.0 km/h',
      matchFitnessRating: 90,
    };

    importedPlayers.push(player);
  });

  return importedPlayers;
}
