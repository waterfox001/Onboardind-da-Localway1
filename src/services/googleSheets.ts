import { getAccessToken } from './googleAuth';

export interface GoogleSheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Lists spreadsheets accessible by the user via Google Drive API
 */
export async function listUserSpreadsheets(token?: string): Promise<GoogleSheetFile[]> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) {
    throw new Error('Usuário não autenticado com o Google.');
  }

  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&pageSize=20&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erro ao listar planilhas (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Creates a new dedicated onboarding spreadsheet in the user's Google Drive
 */
export async function createOnboardingSpreadsheet(
  title: string = 'Localway - Respostas do Onboarding',
  token?: string
): Promise<GoogleSheetFile> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) {
    throw new Error('Usuário não autenticado com o Google.');
  }

  const headers = [
    'Código do cliente',
    'Data e hora',
    'Status do Onboarding',
    'Nome fantasia',
    'Razão social',
    'CNPJ',
    'Segmento',
    'WhatsApp',
    'E-mail',
    'Cidade',
    'Estado',
    'Serviços contratados',
    'Responsável',
    'WhatsApp responsável',
    'Horário de funcionamento',
    'Agendamento',
    'Estacionamento',
    'Link materiais',
    'Observações',
  ];

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: { title: 'Resumo Geral' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: headers.map((h) => ({
                    userEnteredValue: { stringValue: h },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.95, green: 0.96, blue: 0.98 },
                    },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao criar planilha no Google Sheets');
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    name: title,
    webViewLink: data.spreadsheetUrl,
  };
}

/**
 * Appends or creates a tab in the spreadsheet for a completed onboarding
 */
export async function syncSubmissionToGoogleSheet(
  spreadsheetId: string,
  rowData: Record<string, string>,
  token?: string
): Promise<{ success: boolean; spreadsheetUrl: string; tabName: string }> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) {
    throw new Error('Autenticação Google necessária para sincronizar diretamente com a planilha.');
  }

  // 1. Get spreadsheet metadata to check existing tabs
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Não foi possível acessar a planilha.');
  }

  const meta = await metaRes.json();
  const existingSheets: string[] = (meta.sheets || []).map((s: any) => s.properties.title);

  const clientCode = rowData['Código do cliente'] || 'LW-01';
  const companyName = rowData['Nome fantasia'] || 'Cliente';
  const tabName = `${clientCode} - ${companyName}`.slice(0, 50);

  // 2. Create tab if does not exist yet
  if (!existingSheets.includes(tabName)) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: { title: tabName },
            },
          },
        ],
      }),
    });
  }

  // 3. Format row data as key-value pairs in the client's tab
  const rows = [
    ['CAMPO / PERGUNTA', 'RESPOSTA DO CLIENTE'],
    ...Object.entries(rowData).map(([k, v]) => [k, String(v || '')]),
  ];

  const valueRange = {
    values: rows,
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(tabName)}'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(valueRange),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao gravar dados na aba da planilha.');
  }

  // Also append summary to the first sheet if available
  const firstSheetName = existingSheets[0] || 'Resumo Geral';
  try {
    const summaryRow = [
      clientCode,
      rowData['Data e hora'] || new Date().toLocaleString('pt-BR'),
      'Finalizado',
      rowData['Nome fantasia'] || '',
      rowData['Razão social'] || '',
      rowData['CNPJ'] || '',
      rowData['Segmento'] || '',
      rowData['WhatsApp'] || '',
      rowData['E-mail'] || '',
      rowData['Cidade'] || '',
      rowData['Estado'] || '',
      rowData['Serviços contratados'] || '',
      rowData['Responsável'] || '',
      rowData['WhatsApp responsável'] || '',
      rowData['Horário segunda a sexta'] || '',
      rowData['Trabalha com agendamento'] || '',
      rowData['Estacionamento'] || '',
      rowData['Link TransferNow'] || '',
      rowData['Observações finais'] || '',
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(firstSheetName)}'!A:A:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [summaryRow] }),
      }
    );
  } catch (summaryErr) {
    console.warn('Could not append summary row to first tab:', summaryErr);
  }

  return {
    success: true,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    tabName,
  };
}
