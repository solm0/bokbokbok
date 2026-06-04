# Google Apps Script Setup

This version uses Google Apps Script instead of Firebase Functions.

What it does:

- stores purchase requests in a Google Sheet
- sends a confirmation email to the customer email entered in the form
- stays fully free under normal personal Gmail / Apps Script quotas

## 1. Create the script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new standalone project
3. Create a Google Spreadsheet where requests should be stored
4. Paste the contents of:
   [apps-script/purchase-request.gs](/Users/solmi/Downloads/bokbokbok/apps-script/purchase-request.gs)
5. Save the project

## 1.5. Set the spreadsheet ID

1. Open the Google Spreadsheet you want to use
2. Copy the spreadsheet ID from the URL

Example:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

3. In Apps Script, go to:
   `Project Settings` -> `Script properties`
4. Add this property:

```text
PURCHASE_REQUEST_SHEET_ID
```

5. Set its value to your spreadsheet ID

## 2. Deploy as a web app

1. Click `Deploy`
2. Click `New deployment`
3. Choose `Web app`
4. Execute as:
   `Me`
5. Who has access:
   `Anyone`
6. Deploy
7. Copy the Web app URL

## 3. Connect it to this project

1. Open your local `.env`
2. Add:

```bash
VITE_PURCHASE_REQUEST_ENDPOINT=YOUR_APPS_SCRIPT_WEB_APP_URL
```

3. Restart the Vite dev server:

```bash
npm run dev
```

## 4. What happens

When someone submits `Request for Purchase`:

- the form data is posted to your Apps Script web app
- the request is saved into the `purchase_requests` sheet
- a confirmation email is sent to the customer email they entered

## 5. Notes

- The sending account is the Google account that owns the Apps Script project.
- If you want the sender to be `bok3books@gmail.com`, create and deploy the Apps Script while logged into `bok3books@gmail.com`.
- The confirmation email goes to the requester's email, not to BOK.
- After editing [apps-script/purchase-request.gs](/Users/solmi/Downloads/bokbokbok/apps-script/purchase-request.gs), save it in Google Apps Script and redeploy it from `Deploy -> Manage deployments`.
