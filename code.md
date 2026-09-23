# Google Apps Script Backend for Expense Balancer

This document contains the complete, production-ready Google Apps Script (`Code.gs`) code to connect [index.html](file:///C:/Users/victus/Documents/Rawgadz_05/my/index.html) with Google Sheets, along with step-by-step setup and deployment instructions.

---

## 1. Google Apps Script Code (`Code.gs`)

Paste the following code into the Google Apps Script editor (`Extensions` > `Apps Script` in your Google Sheet):

```javascript
/**
 * Expense Balancer - Google Apps Script Backend
 * Connects index.html frontend to Google Sheets.
 */

// ============================================================================
// CONFIGURATION & SHEET NAMES
// ============================================================================
const SHEETS = {
  MEMBERS: "Members",
  CATEGORIES: "Categories",
  EVENTS: "Events",
  EXPENSES: "Expenses",
  SETTLEMENTS: "Settlements"
};

const HEADERS = {
  [SHEETS.MEMBERS]: ["id", "name", "active", "createdAt"],
  [SHEETS.CATEGORIES]: ["id", "name", "active", "createdAt"],
  [SHEETS.EVENTS]: ["id", "name", "date", "createdAt"],
  [SHEETS.EXPENSES]: ["id", "eventId", "date", "description", "categoryId", "amount", "paidBy", "note", "createdAt"],
  [SHEETS.SETTLEMENTS]: ["id", "eventId", "fromId", "toId", "amount", "status", "createdAt"]
};

// ============================================================================
// HTTP ROUTING (doGet & doPost)
// ============================================================================

/**
 * Handles all GET requests from index.html
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action;

    switch (action) {
      case "getMembers":
        return sendResponse(handleGetMembers());
      case "getCategories":
        return sendResponse(handleGetCategories());
      case "getEvents":
        return sendResponse(handleGetEvents());
      case "getExpenses":
        return sendResponse(handleGetExpenses(params));
      case "getDashboard":
        return sendResponse(handleGetDashboard(params.eventId));
      case "getSettlements":
        return sendResponse(handleGetSettlements(params.eventId));
      default:
        return sendError("Unknown GET action: " + action);
    }
  } catch (err) {
    return sendError(err.message || err.toString());
  }
}

/**
 * Handles all POST requests from index.html
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds for concurrent requests
    lock.waitLock(10000);

    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    const action = data.action || (e && e.parameter && e.parameter.action);

    switch (action) {
      case "addMember":
        return sendResponse(handleAddMember(data));
      case "toggleMember":
        return sendResponse(handleToggleMember(data.id, data.active));
      case "addCategory":
        return sendResponse(handleAddCategory(data));
      case "toggleCategory":
        return sendResponse(handleToggleCategory(data.id, data.active));
      case "addEvent":
        return sendResponse(handleAddEvent(data));
      case "addExpense":
        return sendResponse(handleAddExpense(data));
      case "deleteExpense":
        return sendResponse(handleDeleteExpense(data.id));
      case "generateSettlement":
        return sendResponse(handleGenerateSettlement(data.eventId));
      case "completeSettlement":
        return sendResponse(handleCompleteSettlement(data.id));
      default:
        return sendError("Unknown POST action: " + action);
    }
  } catch (err) {
    return sendError(err.message || err.toString());
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

function sendResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

function sendError(message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: message ? message.toString() : "An unexpected error occurred."
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// HANDLERS: REFERENCE DATA (Members, Categories, Events)
// ============================================================================

function handleGetMembers() {
  const sheet = getOrCreateSheet(SHEETS.MEMBERS);
  const rows = getSheetData(sheet);
  return rows.map(r => ({
    id: String(r.id),
    name: String(r.name || ""),
    active: parseBoolean(r.active)
  }));
}

function handleAddMember(data) {
  if (!data.name || !data.name.trim()) throw new Error("Member name is required.");
  const sheet = getOrCreateSheet(SHEETS.MEMBERS);
  const newMember = {
    id: "mem_" + Utilities.getUuid().slice(0, 8),
    name: data.name.trim(),
    active: true,
    createdAt: new Date().toISOString()
  };
  appendRowObject(sheet, HEADERS[SHEETS.MEMBERS], newMember);
  return newMember;
}

function handleToggleMember(id, active) {
  if (!id) throw new Error("Member ID is required.");
  const sheet = getOrCreateSheet(SHEETS.MEMBERS);
  updateRowField(sheet, id, "active", parseBoolean(active));
  return { id, active: parseBoolean(active) };
}

function handleGetCategories() {
  const sheet = getOrCreateSheet(SHEETS.CATEGORIES);
  const rows = getSheetData(sheet);
  return rows.map(r => ({
    id: String(r.id),
    name: String(r.name || ""),
    active: parseBoolean(r.active)
  }));
}

function handleAddCategory(data) {
  if (!data.name || !data.name.trim()) throw new Error("Category name is required.");
  const sheet = getOrCreateSheet(SHEETS.CATEGORIES);
  const newCat = {
    id: "cat_" + Utilities.getUuid().slice(0, 8),
    name: data.name.trim(),
    active: true,
    createdAt: new Date().toISOString()
  };
  appendRowObject(sheet, HEADERS[SHEETS.CATEGORIES], newCat);
  return newCat;
}

function handleToggleCategory(id, active) {
  if (!id) throw new Error("Category ID is required.");
  const sheet = getOrCreateSheet(SHEETS.CATEGORIES);
  updateRowField(sheet, id, "active", parseBoolean(active));
  return { id, active: parseBoolean(active) };
}

function handleGetEvents() {
  const sheet = getOrCreateSheet(SHEETS.EVENTS);
  const rows = getSheetData(sheet);
  return rows.map(r => ({
    id: String(r.id),
    name: String(r.name || ""),
    date: formatDate(r.date)
  }));
}

function handleAddEvent(data) {
  if (!data.name || !data.name.trim()) throw new Error("Event name is required.");
  const sheet = getOrCreateSheet(SHEETS.EVENTS);
  const newEvent = {
    id: "evt_" + Utilities.getUuid().slice(0, 8),
    name: data.name.trim(),
    date: data.date ? formatDate(data.date) : formatDate(new Date()),
    createdAt: new Date().toISOString()
  };
  appendRowObject(sheet, HEADERS[SHEETS.EVENTS], newEvent);
  return newEvent;
}

// ============================================================================
// HANDLERS: EXPENSES
// ============================================================================

function handleGetExpenses(params) {
  const sheet = getOrCreateSheet(SHEETS.EXPENSES);
  const rows = getSheetData(sheet);

  // Lookups for member and category names
  const memberMap = getLookupMap(SHEETS.MEMBERS, "id", "name");
  const categoryMap = getLookupMap(SHEETS.CATEGORIES, "id", "name");

  let filtered = rows;

  if (params.eventId) {
    filtered = filtered.filter(r => String(r.eventId) === String(params.eventId));
  }
  if (params.date) {
    filtered = filtered.filter(r => formatDate(r.date) === formatDate(params.date));
  }
  if (params.memberId) {
    filtered = filtered.filter(r => String(r.paidBy) === String(params.memberId));
  }
  if (params.categoryId) {
    filtered = filtered.filter(r => String(r.categoryId) === String(params.categoryId));
  }

  // Sort descending by date / created
  filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return filtered.map(r => ({
    id: String(r.id),
    eventId: String(r.eventId || ""),
    date: formatDate(r.date),
    description: String(r.description || ""),
    categoryId: String(r.categoryId || ""),
    categoryName: categoryMap[r.categoryId] || "Unknown",
    paidBy: String(r.paidBy || ""),
    paidByName: memberMap[r.paidBy] || "Unknown",
    amount: roundToTwo(r.amount),
    note: String(r.note || "")
  }));
}

function handleAddExpense(data) {
  if (!data.eventId) throw new Error("Event is required.");
  if (!data.amount || Number(data.amount) <= 0) throw new Error("A valid amount is required.");
  if (!data.paidBy) throw new Error("Payer (paidBy) is required.");

  const sheet = getOrCreateSheet(SHEETS.EXPENSES);
  const newExpense = {
    id: "exp_" + Utilities.getUuid().slice(0, 8),
    eventId: String(data.eventId),
    date: data.date ? formatDate(data.date) : formatDate(new Date()),
    description: String(data.description || "").trim(),
    categoryId: String(data.categoryId || ""),
    amount: roundToTwo(data.amount),
    paidBy: String(data.paidBy),
    note: String(data.note || "").trim(),
    createdAt: new Date().toISOString()
  };

  appendRowObject(sheet, HEADERS[SHEETS.EXPENSES], newExpense);
  return newExpense;
}

function handleDeleteExpense(id) {
  if (!id) throw new Error("Expense ID is required.");
  const sheet = getOrCreateSheet(SHEETS.EXPENSES);
  deleteRowById(sheet, id);
  return { id, deleted: true };
}

// ============================================================================
// HANDLERS: DASHBOARD & BALANCES
// ============================================================================

function handleGetDashboard(eventId) {
  if (!eventId) {
    return {
      date: "",
      total: 0,
      share: 0,
      expenseCount: 0,
      memberCount: 0,
      settlementStatus: "",
      balances: []
    };
  }

  const events = getSheetData(getOrCreateSheet(SHEETS.EVENTS));
  const currentEvent = events.find(e => String(e.id) === String(eventId));
  const eventDate = currentEvent ? formatDate(currentEvent.date) : "";

  // Get all expenses for this event
  const expenses = getSheetData(getOrCreateSheet(SHEETS.EXPENSES))
    .filter(r => String(r.eventId) === String(eventId));

  const totalSpent = roundToTwo(expenses.reduce((sum, r) => sum + (Number(r.amount) || 0), 0));

  // Determine participating members:
  // All active members, plus any inactive member who has expenses in this event
  const allMembers = getSheetData(getOrCreateSheet(SHEETS.MEMBERS));
  const participatingMembersMap = new Map();

  allMembers.forEach(m => {
    if (parseBoolean(m.active)) {
      participatingMembersMap.set(String(m.id), String(m.name || ""));
    }
  });

  expenses.forEach(exp => {
    if (exp.paidBy && !participatingMembersMap.has(String(exp.paidBy))) {
      const found = allMembers.find(m => String(m.id) === String(exp.paidBy));
      participatingMembersMap.set(String(exp.paidBy), found ? String(found.name) : "Member " + exp.paidBy);
    }
  });

  const memberCount = participatingMembersMap.size;
  const share = memberCount > 0 ? roundToTwo(totalSpent / memberCount) : 0;

  // Calculate total paid by each member
  const paidMap = {};
  participatingMembersMap.forEach((_, memberId) => {
    paidMap[memberId] = 0;
  });

  expenses.forEach(exp => {
    const payerId = String(exp.paidBy);
    paidMap[payerId] = roundToTwo((paidMap[payerId] || 0) + (Number(exp.amount) || 0));
  });

  const balances = [];
  participatingMembersMap.forEach((name, memberId) => {
    const paid = roundToTwo(paidMap[memberId] || 0);
    const balance = roundToTwo(paid - share);
    balances.push({
      memberId: memberId,
      name: name,
      paid: paid,
      balance: balance
    });
  });

  // Calculate settlement status
  const settlements = getSheetData(getOrCreateSheet(SHEETS.SETTLEMENTS))
    .filter(s => String(s.eventId) === String(eventId));

  let settlementStatus = "";
  if (settlements.length === 0) {
    settlementStatus = totalSpent === 0 ? "Settled" : "—";
  } else {
    const completed = settlements.filter(s => String(s.status) === "Completed").length;
    if (completed === settlements.length) {
      settlementStatus = "Settled";
    } else if (completed > 0) {
      settlementStatus = "In Progress";
    } else {
      settlementStatus = "Pending";
    }
  }

  return {
    date: eventDate,
    total: totalSpent,
    share: share,
    expenseCount: expenses.length,
    memberCount: memberCount,
    settlementStatus: settlementStatus,
    balances: balances
  };
}

// ============================================================================
// HANDLERS: SETTLEMENTS & DEBT SIMPLIFICATION
// ============================================================================

function handleGetSettlements(eventId) {
  if (!eventId) return [];

  const sheet = getOrCreateSheet(SHEETS.SETTLEMENTS);
  const rows = getSheetData(sheet).filter(r => String(r.eventId) === String(eventId));
  const memberMap = getLookupMap(SHEETS.MEMBERS, "id", "name");

  return rows.map(r => ({
    id: String(r.id),
    eventId: String(r.eventId),
    fromId: String(r.fromId),
    fromName: memberMap[r.fromId] || "Member " + r.fromId,
    toId: String(r.toId),
    toName: memberMap[r.toId] || "Member " + r.toId,
    amount: roundToTwo(r.amount),
    status: String(r.status || "Pending")
  }));
}

/**
 * Generates minimal payment transactions (Min-Cash-Flow algorithm)
 * and replaces previous settlement records for the event.
 */
function handleGenerateSettlement(eventId) {
  if (!eventId) throw new Error("Event ID is required to generate settlement.");

  const dashboard = handleGetDashboard(eventId);
  const balances = dashboard.balances;

  const debtors = [];   // Balance < 0 (owes money)
  const creditors = []; // Balance > 0 (to receive money)

  balances.forEach(b => {
    const bal = roundToTwo(b.balance);
    if (bal < -0.005) {
      debtors.push({ id: b.memberId, name: b.name, amount: Math.abs(bal) });
    } else if (bal > 0.005) {
      creditors.push({ id: b.memberId, name: b.name, amount: bal });
    }
  });

  const generated = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settleAmount = roundToTwo(Math.min(debtor.amount, creditor.amount));

    if (settleAmount > 0.005) {
      generated.push({
        id: "set_" + Utilities.getUuid().slice(0, 8),
        eventId: String(eventId),
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: settleAmount,
        status: "Pending",
        createdAt: new Date().toISOString()
      });
    }

    debtor.amount = roundToTwo(debtor.amount - settleAmount);
    creditor.amount = roundToTwo(creditor.amount - settleAmount);

    if (debtor.amount < 0.005) i++;
    if (creditor.amount < 0.005) j++;
  }

  // Clear existing settlements for this event and save new ones
  const sheet = getOrCreateSheet(SHEETS.SETTLEMENTS);
  deleteRowsWhere(sheet, row => String(row.eventId) === String(eventId));

  generated.forEach(item => {
    appendRowObject(sheet, HEADERS[SHEETS.SETTLEMENTS], item);
  });

  return generated;
}

function handleCompleteSettlement(id) {
  if (!id) throw new Error("Settlement ID is required.");
  const sheet = getOrCreateSheet(SHEETS.SETTLEMENTS);
  updateRowField(sheet, id, "status", "Completed");
  return { id, status: "Completed" };
}

// ============================================================================
// SHEET UTILITIES & DATABASE HELPERS
// ============================================================================

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = HEADERS[sheetName];
    if (headers) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function getSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h).trim());
  const rows = [];

  for (let r = 1; r < values.length; r++) {
    const rowObj = {};
    for (let c = 0; c < headers.length; c++) {
      rowObj[headers[c]] = values[r][c];
    }
    rows.push(rowObj);
  }
  return rows;
}

function appendRowObject(sheet, headerOrder, obj) {
  const row = headerOrder.map(key => (obj[key] !== undefined ? obj[key] : ""));
  sheet.appendRow(row);
}

function updateRowField(sheet, id, fieldName, value) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return;

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h).trim());
  const idColIndex = headers.indexOf("id");
  const targetColIndex = headers.indexOf(fieldName);

  if (idColIndex === -1 || targetColIndex === -1) return;

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idColIndex]) === String(id)) {
      sheet.getRange(r + 1, targetColIndex + 1).setValue(value);
      return;
    }
  }
}

function deleteRowById(sheet, id) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return;

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h).trim());
  const idColIndex = headers.indexOf("id");
  if (idColIndex === -1) return;

  for (let r = values.length - 1; r >= 1; r--) {
    if (String(values[r][idColIndex]) === String(id)) {
      sheet.deleteRow(r + 1);
      return;
    }
  }
}

function deleteRowsWhere(sheet, predicate) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return;

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h).trim());

  for (let r = values.length - 1; r >= 1; r--) {
    const rowObj = {};
    for (let c = 0; c < headers.length; c++) {
      rowObj[headers[c]] = values[r][c];
    }
    if (predicate(rowObj)) {
      sheet.deleteRow(r + 1);
    }
  }
}

function getLookupMap(sheetName, keyField, valField) {
  const sheet = getOrCreateSheet(sheetName);
  const rows = getSheetData(sheet);
  const map = {};
  rows.forEach(r => {
    if (r[keyField] !== undefined) {
      map[String(r[keyField])] = String(r[valField] || "");
    }
  });
  return map;
}

function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "UTC", "yyyy-MM-dd");
  }
  return String(val).slice(0, 10);
}

function parseBoolean(val) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.trim().toLowerCase() === "true";
  return Boolean(val);
}

function roundToTwo(val) {
  const num = Number(val);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// ============================================================================
// ONE-CLICK SETUP FUNCTION
// ============================================================================

/**
 * Run this function once from the Apps Script editor to initialize
 * sheets, header rows, and sample data.
 */
function setup() {
  Object.keys(SHEETS).forEach(key => {
    getOrCreateSheet(SHEETS[key]);
  });

  // Seed default categories if none exist
  const catSheet = getOrCreateSheet(SHEETS.CATEGORIES);
  if (catSheet.getLastRow() <= 1) {
    const defaultCategories = ["Food & Dining", "Transport", "Accommodation", "Groceries", "Entertainment", "General"];
    defaultCategories.forEach(name => {
      appendRowObject(catSheet, HEADERS[SHEETS.CATEGORIES], {
        id: "cat_" + Utilities.getUuid().slice(0, 8),
        name: name,
        active: true,
        createdAt: new Date().toISOString()
      });
    });
  }

  Logger.log("Expense Balancer sheets and headers successfully initialized!");
}
```

---

## 2. Step-by-Step Setup and Deployment Guide

### Step 1: Create a Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it **"Expense Balancer DB"** (or any name you prefer).

### Step 2: Open Google Apps Script
1. In the top menu of your Google Sheet, click **Extensions** > **Apps Script**.
2. Delete any existing template code in `Code.gs`.
3. Copy the entire script from **Section 1** above and paste it into `Code.gs`.
4. Click the **Save** icon (diskette).

### Step 3: Run the One-Click Setup
1. In the Apps Script toolbar, make sure `setup` is selected in the function dropdown.
2. Click **Run**.
3. When prompted, click **Review permissions**, choose your Google account, click **Advanced**, and then click **Go to Untitled project (unsafe)** to grant permissions.
4. Check your Google Sheet: 5 tabs (`Members`, `Categories`, `Events`, `Expenses`, `Settlements`) will have been created with bold headers and default categories.

### Step 4: Deploy as a Web App
1. At the top right of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Fill in the fields:
   - **Description**: `Expense Balancer API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: **`Anyone`** *(Crucial: allows index.html to communicate with the API without requiring login)*
4. Click **Deploy**.
5. Copy the generated **Web app URL** (ends with `/exec`).

### Step 5: Connect with `index.html`
1. Open [index.html](file:///C:/Users/victus/Documents/Rawgadz_05/my/index.html).
2. Locate line 887:
   ```javascript
   const API_URL = "";
   ```
3. Replace `""` with your copied Web App URL:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```
4. Save [index.html](file:///C:/Users/victus/Documents/Rawgadz_05/my/index.html) and open it in your browser.

> [!TIP]
> Whenever you make changes to your Apps Script code in the future, remember to click **Deploy** > **Manage deployments** > **Edit** > change version to **New version** > **Deploy** so the public URL serves the latest code.

---

## 3. Database Schema Overview

The Apps Script creates and manages 5 sheets:

| Sheet | Columns | Purpose |
|---|---|---|
| **Members** | `id`, `name`, `active`, `createdAt` | Member directory and active status |
| **Categories** | `id`, `name`, `active`, `createdAt` | Expense categories |
| **Events** | `id`, `name`, `date`, `createdAt` | Group events or trips |
| **Expenses** | `id`, `eventId`, `date`, `description`, `categoryId`, `amount`, `paidBy`, `note`, `createdAt` | Expense entries with payer and category links |
| **Settlements** | `id`, `eventId`, `fromId`, `toId`, `amount`, `status`, `createdAt` | Minimal settlement transactions (`Pending` / `Completed`) |

---

## 4. API Specification & Actions Handled

All responses adhere strictly to the JSON contract expected by `index.html`:
`{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }`.

| Action | Method | Parameters / Body | Description |
|---|---|---|---|
| `getMembers` | `GET` | — | Retrieves all members (`id`, `name`, `active`) |
| `getCategories` | `GET` | — | Retrieves all categories (`id`, `name`, `active`) |
| `getEvents` | `GET` | — | Retrieves all events (`id`, `name`, `date`) |
| `getExpenses` | `GET` | `eventId`, `date`, `memberId`, `categoryId` | Retrieves filtered expenses with resolved `categoryName` and `paidByName` |
| `getDashboard` | `GET` | `eventId` | Computes event totals, per-member equal share, member balances, and settlement status |
| `getSettlements` | `GET` | `eventId` | Retrieves calculated settlement payments with resolved member names |
| `addExpense` | `POST` | `eventId`, `date`, `description`, `categoryId`, `amount`, `paidBy`, `note` | Appends a new expense record |
| `deleteExpense` | `POST` | `id` | Deletes an expense by ID |
| `generateSettlement` | `POST` | `eventId` | Executes debt simplification algorithm and records minimal cash-flow transactions |
| `completeSettlement` | `POST` | `id` | Marks a settlement record as `Completed` |
| `addMember` | `POST` | `name` | Adds a new member |
| `toggleMember` | `POST` | `id`, `active` | Enables or disables a member |
| `addCategory` | `POST` | `name` | Adds a new expense category |
| `toggleCategory` | `POST` | `id`, `active` | Enables or disables a category |
| `addEvent` | `POST` | `name`, `date` | Adds a new event |
