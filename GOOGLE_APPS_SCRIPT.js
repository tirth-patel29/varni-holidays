/**
 * VARNI HOLIDAYS - GOOGLE APPS SCRIPT WEBHOOK RECEIVER
 * Automatically receives live leads, quotations, bookings, and summary metrics from Varni Holidays CRM.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A/edit
 * 2. Click "Extensions" > "Apps Script" in the top menu.
 * 3. Replace all code in the editor with this entire file.
 * 4. Click "Deploy" (top right) > "New deployment"
 * 5. Click the gear icon next to "Select type" and choose "Web app".
 * 6. Set Description: "Varni Holidays CRM Live Sync"
 * 7. Set "Execute as": "Me (your google account)"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy" and authorize permissions.
 * 10. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 11. Paste it into Varni CRM: https://varni-holidays.vercel.app/admin/google-sheets
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === 'UPSERT_ROW') {
      var tabName = data.tabName || 'ALL_LEADS';
      var sheet = ss.getSheetByName(tabName);
      if (!sheet) {
        sheet = ss.insertSheet(tabName);
      }
      var primaryKey = data.primaryKey;
      var rowValues = data.rowValues;
      var rows = sheet.getDataRange().getValues();
      var foundRow = -1;

      for (var i = 0; i < rows.length; i++) {
        if (rows[i][0] == primaryKey) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'FULL_RECONCILE') {
      var tabs = data.tabs || {};
      for (var t in tabs) {
        var sheet = ss.getSheetByName(t);
        if (!sheet) {
          sheet = ss.insertSheet(t);
        }
        sheet.clear();
        var tabRows = tabs[t];
        if (tabRows && tabRows.length > 0) {
          sheet.getRange(1, 1, tabRows.length, tabRows[0].length).setValues(tabRows);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ACTIVE", app: "VARNI HOLIDAYS CRM", spreadsheetId: "1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A" })).setMimeType(ContentService.MimeType.JSON);
}

