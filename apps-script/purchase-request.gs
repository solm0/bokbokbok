function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || "{}");
    var customer = payload.customer || {};
    var items = Array.isArray(payload.items) ? payload.items : [];

    var sheet = getOrCreateSheet_();
    var mailStatus = "skipped";
    var mailError = "";

    if (customer.email) {
      try {
        MailApp.sendEmail({
          to: customer.email,
          subject: "[BOK3] Purchase request received",
          body: buildPlainText_(payload),
          htmlBody: buildHtml_(payload)
        });
        mailStatus = "sent";
      } catch (error) {
        mailStatus = "failed";
        mailError = error && error.message ? error.message : "Unknown mail error";
      }
    }

    var row = [
      new Date(),
      customer.name || "",
      customer.note || "",
      customer.email || "",
      customer.phone || "",
      customer.address || "",
      customer.extraContact || "",
      items.map(function(item) {
        return item.id + " | " + item.title + " | " + item.price;
      }).join("\n"),
      mailStatus,
      mailError
    ];
    sheet.appendRow(row);

    return jsonOutput_({
      ok: true,
      mailStatus: mailStatus,
      mailError: mailError
    });
  } catch (error) {
    return jsonOutput_({
      ok: false,
      message: error && error.message ? error.message : "Unknown error"
    });
  }
}

function getOrCreateSheet_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName("purchase_requests");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("purchase_requests");
    sheet.appendRow([
      "created_at",
      "name",
      "note",
      "email",
        "phone",
        "address",
        "extra_contact",
        "items",
        "mail_status",
        "mail_error"
      ]);
  }
  return sheet;
}

function getSpreadsheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (spreadsheet) {
    return spreadsheet;
  }

  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("PURCHASE_REQUEST_SHEET_ID");
  if (!spreadsheetId) {
    throw new Error("PURCHASE_REQUEST_SHEET_ID is not set.");
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

function buildPlainText_(payload) {
  var customer = payload.customer || {};
  var items = Array.isArray(payload.items) ? payload.items : [];
  var itemLines = items.map(function(item, index) {
    return [
      (index + 1) + ". " + (item.title || ""),
      "ID: " + (item.id || ""),
      "Price: " + formatPrice_(item.price),
      "Description: " + (item.description || "-")
    ].join("\n");
  }).join("\n\n");

  return [
    "Your BOK3 purchase request has been received.",
    "",
    "Name: " + (customer.name || "-"),
    "Note: " + (customer.note || "-"),
    "Email: " + (customer.email || "-"),
    "Phone: " + (customer.phone || "-"),
    "Address: " + (customer.address || "-"),
    "Extra contact: " + (customer.extraContact || "-"),
    "",
    "Requested zines:",
    itemLines || "-"
  ].join("\n");
}

function buildHtml_(payload) {
  var customer = payload.customer || {};
  var items = Array.isArray(payload.items) ? payload.items : [];
  var itemHtml = items.map(function(item, index) {
    return (
      "<li style='margin-bottom:16px;'>" +
      "<strong>" + escapeHtml_(String(index + 1) + ". " + (item.title || "")) + "</strong><br>" +
      "ID: " + escapeHtml_(item.id || "") + "<br>" +
      "Price: " + escapeHtml_(formatPrice_(item.price)) + "<br>" +
      "Description: " + escapeHtml_(item.description || "-") +
      "</li>"
    );
  }).join("");

  return (
    "<div style='font-family:Arial,sans-serif; color:#111; line-height:1.5;'>" +
    "<h2>Your BOK3 purchase request has been received.</h2>" +
    "<p>We received the following request information.</p>" +
    "<p>" +
    "Name: " + escapeHtml_(customer.name || "-") + "<br>" +
    "Note: " + escapeHtml_(customer.note || "-") + "<br>" +
    "Email: " + escapeHtml_(customer.email || "-") + "<br>" +
    "Phone: " + escapeHtml_(customer.phone || "-") + "<br>" +
    "Address: " + escapeHtml_(customer.address || "-") + "<br>" +
    "Extra contact: " + escapeHtml_(customer.extraContact || "-") +
    "</p>" +
    "<h3>Requested zines</h3>" +
    "<ol>" + (itemHtml || "<li>-</li>") + "</ol>" +
    "</div>"
  );
}

function formatPrice_(value) {
  var amount = Number(value || 0);
  return amount.toLocaleString("ko-KR") + " KRW";
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonOutput_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendTestMail_() {
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "[BOK3] Test email",
    body: "Test email from Apps Script."
  });
}
