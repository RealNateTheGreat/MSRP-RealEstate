import { google } from 'googleapis'

const LISTINGS_TAB = process.env.GOOGLE_SHEETS_LISTINGS_TAB || 'Listings'
const SALES_LOGS_TAB = process.env.GOOGLE_SHEETS_SALES_TAB || 'SalesLogs'
const REQUESTS_TAB = process.env.GOOGLE_SHEETS_REQUESTS_TAB || 'PurchaseRequests'
const CACHE_TTL_MS = Number(process.env.GOOGLE_SHEETS_CACHE_TTL_MS || 15000)
const tableCache = new Map()
const ensuredTabs = new Set()

const LISTING_HEADERS = [
  'id',
  'title',
  'district',
  'description',
  'imageUrl',
  'price',
  'sellerUserId',
  'createdByUserId',
  'status',
  'ownerUserId',
  'ownerName',
  'tags',
  'createdAt',
  'soldAt',
]

const SALES_HEADERS = ['id', 'createdAt', 'listingId', 'listingTitle', 'price', 'buyerUserId', 'receiverUserId', 'status']

const REQUEST_HEADERS = [
  'id',
  'createdAt',
  'updatedAt',
  'listingId',
  'listingTitle',
  'listingPrice',
  'listingSellerUserId',
  'requesterUserId',
  'requesterName',
  'status',
  'requestReason',
  'decisionReason',
  'reviewedByUserId',
]

function nowIso() {
  return new Date().toISOString()
}

function envSheetsReady() {
  return Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
}

function allowMockStore() {
  return String(process.env.MSRP_ALLOW_MOCK_STORE || 'false').toLowerCase() === 'true'
}

function assertSheetsConfigured() {
  if (envSheetsReady()) return
  if (allowMockStore()) return
  throw new Error('Google Sheets storage is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, or set MSRP_ALLOW_MOCK_STORE=true for local mock mode.')
}

function createFallbackStore() {
  const mem = globalThis.__msrpSheetsFallback || (globalThis.__msrpSheetsFallback = { listings: [], logs: [], requests: [] })
  return {
    async getListings() {
      return Array.isArray(mem.listings) ? mem.listings : []
    },
    async setListings(listings) {
      mem.listings = Array.isArray(listings) ? listings : []
    },
    async appendSalesLog(entry) {
      mem.logs = mem.logs || []
      mem.logs.unshift({ id: `sale-${Date.now().toString(36)}`, createdAt: nowIso(), ...entry })
      mem.logs = mem.logs.slice(0, 1000)
    },
    async getSalesLogs() {
      return Array.isArray(mem.logs) ? mem.logs : []
    },
    async getPurchaseRequests() {
      return Array.isArray(mem.requests) ? mem.requests : []
    },
    async setPurchaseRequests(requests) {
      mem.requests = Array.isArray(requests) ? requests : []
    },
  }
}

function sheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const auth = new google.auth.JWT({ email, key: privateKey, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
  return google.sheets({ version: 'v4', auth })
}

async function ensureTab(sheets, spreadsheetId, tabName, headers) {
  const ensureKey = `${spreadsheetId}:${tabName}`
  if (ensuredTabs.has(ensureKey)) return

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const exists = meta.data.sheets?.some((sheet) => String(sheet.properties?.title || '') === tabName) || false
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] } })
  }

  const headerRange = `${tabName}!A1:${String.fromCharCode(64 + headers.length)}1`
  const headerRead = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange })
  if (!headerRead.data.values || headerRead.data.values.length === 0) {
    await sheets.spreadsheets.values.update({ spreadsheetId, range: headerRange, valueInputOption: 'RAW', requestBody: { values: [headers] } })
  }

  ensuredTabs.add(ensureKey)
}

function rowToObject(headers, row) {
  const obj = {}
  headers.forEach((header, idx) => {
    obj[header] = row[idx] ?? ''
  })
  return obj
}

function objectToRow(headers, obj) {
  return headers.map((header) => {
    const value = obj?.[header]
    if (Array.isArray(value)) return JSON.stringify(value)
    if (value === null || value === undefined) return ''
    return String(value)
  })
}

async function readTable(headers, tabName) {
  const cacheKey = `table:${tabName}`
  const cached = tableCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.rows

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const sheets = sheetsClient()
  await ensureTab(sheets, spreadsheetId, tabName, headers)

  const range = `${tabName}!A2:${String.fromCharCode(64 + headers.length)}`
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range })
  const rows = (response.data.values || []).map((row) => rowToObject(headers, row))
  tableCache.set(cacheKey, { rows, expiresAt: Date.now() + CACHE_TTL_MS })
  return rows
}

async function writeTable(headers, tabName, rows) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const sheets = sheetsClient()
  await ensureTab(sheets, spreadsheetId, tabName, headers)

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${tabName}!A2:${String.fromCharCode(64 + headers.length)}` })
  if (!rows.length) {
    tableCache.set(`table:${tabName}`, { rows: [], expiresAt: Date.now() + CACHE_TTL_MS })
    return
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A2`,
    valueInputOption: 'RAW',
    requestBody: { values: rows.map((row) => objectToRow(headers, row)) },
  })

  tableCache.set(`table:${tabName}`, { rows, expiresAt: Date.now() + CACHE_TTL_MS })
}

async function appendRow(headers, tabName, row) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const sheets = sheetsClient()
  await ensureTab(sheets, spreadsheetId, tabName, headers)
  await sheets.spreadsheets.values.append({ spreadsheetId, range: `${tabName}!A2`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [objectToRow(headers, row)] } })
  tableCache.delete(`table:${tabName}`)
}

function parseTags(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return String(raw)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 8)
  }
}

function normalizeListing(row) {
  return { ...row, price: Number(row.price || 0), ownerName: String(row.ownerName || ''), tags: parseTags(row.tags) }
}

const fallback = createFallbackStore()

export async function getListings() {
  assertSheetsConfigured()
  if (!envSheetsReady()) return fallback.getListings()
  const rows = await readTable(LISTING_HEADERS, LISTINGS_TAB)
  return rows.map(normalizeListing)
}

export async function setListings(listings) {
  assertSheetsConfigured()
  if (!envSheetsReady()) return fallback.setListings(listings)
  await writeTable(LISTING_HEADERS, LISTINGS_TAB, listings)
}

export async function appendSalesLog(entry) {
  assertSheetsConfigured()
  const payload = { id: `sale-${Date.now().toString(36)}`, createdAt: nowIso(), ...entry }
  if (!envSheetsReady()) return fallback.appendSalesLog(payload)
  await appendRow(SALES_HEADERS, SALES_LOGS_TAB, payload)
}

export async function getSalesLogs() {
  assertSheetsConfigured()
  if (!envSheetsReady()) return fallback.getSalesLogs()
  const rows = await readTable(SALES_HEADERS, SALES_LOGS_TAB)
  return rows.map((row) => ({ ...row, price: Number(row.price || 0) }))
}

export async function getPurchaseRequests() {
  assertSheetsConfigured()
  if (!envSheetsReady()) return fallback.getPurchaseRequests()
  const rows = await readTable(REQUEST_HEADERS, REQUESTS_TAB)
  return rows.map((row) => ({ ...row, listingPrice: Number(row.listingPrice || 0) }))
}

export async function setPurchaseRequests(requests) {
  assertSheetsConfigured()
  if (!envSheetsReady()) return fallback.setPurchaseRequests(requests)
  await writeTable(REQUEST_HEADERS, REQUESTS_TAB, requests)
}

export function buildPurchaseRequest(input) {
  const now = nowIso()
  return {
    id: `req-${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    listingId: String(input.listingId || ''),
    listingTitle: String(input.listingTitle || '').trim(),
    listingPrice: Number(input.listingPrice || 0),
    listingSellerUserId: String(input.listingSellerUserId || ''),
    requesterUserId: String(input.requesterUserId || ''),
    requesterName: String(input.requesterName || '').trim(),
    status: 'pending',
    requestReason: String(input.requestReason || '').trim(),
    decisionReason: '',
    reviewedByUserId: '',
  }
}

export function buildListing(input) {
  return {
    id: `listing-${Date.now().toString(36)}`,
    title: String(input.title || '').trim(),
    district: String(input.district || '').trim(),
    description: String(input.description || '').trim(),
    imageUrl: String(input.imageUrl || '').trim(),
    price: Number(input.price || 0),
    sellerUserId: String(input.sellerUserId || ''),
    createdByUserId: String(input.createdByUserId || ''),
    status: 'listed',
    ownerUserId: '',
    ownerName: '',
    tags: Array.isArray(input.tags) ? input.tags.slice(0, 8) : [],
    createdAt: nowIso(),
    soldAt: '',
  }
}
