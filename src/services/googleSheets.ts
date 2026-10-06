import { Player, RegistrationFormData } from '../types';

const SHEET_STORAGE_KEY = 'prokick_fc_google_sheet_id_v1';
const DEFAULT_SHEET_TITLE = 'PROKICK FC Academy - Registrations 2025/26';

export interface SheetAppendResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  updatedRange?: string;
}

const HEADERS = [
  'Timestamp',
  'Pass ID',
  'Legal Full Name',
  'Jersey Print / Nickname',
  'Date of Birth',
  'Division Bracket',
  'Primary Position',
  'Squad Number',
  'Kit Size',
  'Training Batch Slot',
  'Primary Guardian Name',
  'Emergency Phone',
  'Guardian Relationship',
  'Sideline Medical Notes',
  'Attendance Status',
  'Official Registration Status',
];

/**
 * Creates or retrieves the active Google Spreadsheet for PROKICK FC Academy
 */
export async function getOrCreateSpreadsheet(
  accessToken: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const cachedId = localStorage.getItem(SHEET_STORAGE_KEY);

  if (cachedId) {
    try {
      // Validate that the spreadsheet is still accessible
      const verifyRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cachedId}?fields=spreadsheetId,properties.title`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (verifyRes.ok) {
        return {
          spreadsheetId: cachedId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${cachedId}/edit`,
        };
      }
    } catch {
      // Fallback to creating a new sheet if cached one is inaccessible
    }
  }

  // Create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: DEFAULT_SHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: 'Registrations',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Save ID locally
  localStorage.setItem(SHEET_STORAGE_KEY, spreadsheetId);

  // Initialize Header row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Registrations!A1:P1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [HEADERS],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Appends a new player registration record to the Google Sheet
 */
export async function appendRegistrationToSheet(
  accessToken: string,
  player: Player,
  formData?: Partial<RegistrationFormData>
): Promise<SheetAppendResult> {
  const { spreadsheetId, spreadsheetUrl } = await getOrCreateSpreadsheet(accessToken);

  const timestamp = new Date().toISOString();
  const passId = player.id.startsWith('pk-') ? `#PK-${player.id.slice(3, 8)}` : `#PK-88492`;
  const dob = formData
    ? `${formData.dobDay} ${formData.dobMonth} ${formData.dobYear}`
    : '2009';

  const rowValues = [
    timestamp,
    passId,
    player.name,
    player.nickname || '-',
    dob,
    player.division || player.squadCategory,
    player.positionFull,
    player.kitNumber,
    player.kitSize || 'M',
    formData?.trainingSlot === 'A'
      ? 'Morning Session (05:30 - 07:00)'
      : 'Evening Session (17:00 - 19:00)',
    player.emergencyContact?.guardianName || '-',
    player.emergencyContact?.phone || '-',
    player.emergencyContact?.relationship || '-',
    player.medicalNotes || 'None',
    player.attendanceStatus.toUpperCase(),
    'ENROLLED & VERIFIED',
  ];

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Registrations!A:P:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to append row to Google Sheet: ${errText}`);
  }

  const appendData = await appendRes.json();

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    updatedRange: appendData.updates?.updatedRange,
  };
}

export function getCachedSpreadsheetUrl(): string | null {
  const id = localStorage.getItem(SHEET_STORAGE_KEY);
  return id ? `https://docs.google.com/spreadsheets/d/${id}/edit` : null;
}
