// Google Apps Script — feedback endpoint for the CA Equity Legislative Tracker.
//
// One-time setup:
//   1. Create a new Google Sheet (or open an existing one you want feedback in).
//   2. Extensions -> Apps Script.
//   3. Delete the placeholder code and paste this file's contents in.
//   4. Deploy -> New deployment -> type "Web app".
//        Execute as: Me
//        Who has access: Anyone
//   5. Click Deploy, authorize when prompted, then copy the Web app URL.
//   6. Set that URL as FEEDBACK_SHEET_URL in Vercel (Project Settings -> Environment
//      Variables) and in your local .env, then redeploy.
//
// Every submission appends a row to a "Feedback" sheet tab (created automatically
// on first submission) with columns: Timestamp, Type, Bill Number, Message, Page.

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Feedback');
  if (!sheet) {
    sheet = ss.insertSheet('Feedback');
    sheet.appendRow(['Timestamp', 'Type', 'Bill Number', 'Message', 'Page']);
  }

  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.type || '',
    data.billNumber || '',
    data.message || '',
    data.page || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'Feedback endpoint is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}
