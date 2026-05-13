/**
 * Tracky SMS Parser
 * Parses Indian bank SMS transaction messages using regex patterns.
 * Supports: HDFC, SBI, ICICI, Axis, Kotak, IDFC, Yes Bank, PNB, BOB
 */

// ─── BANK PATTERNS ────────────────────────────────────────────────────────────
const BANK_PATTERNS = [
  // HDFC Bank
  {
    bank: 'HDFC',
    patterns: [
      /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|deducted)/i,
      /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
      /AC\s*([Xx*\d]{4,})/i,
    ],
    typeKeywords: { debit: ['debited', 'deducted', 'spent', 'paid'], credit: ['credited', 'received', 'refund'] },
  },
  // SBI
  {
    bank: 'SBI',
    patterns: [
      /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|withdrawn|paid)/i,
      /(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
      /account\s*([Xx*\d]{4,})/i,
    ],
    typeKeywords: { debit: ['debited', 'withdrawn', 'paid', 'deducted'], credit: ['credited', 'deposited'] },
  },
  // ICICI
  {
    bank: 'ICICI',
    patterns: [
      /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent)/i,
      /(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited)/i,
      /(?:a\/c|account)\s*(?:XX|xx|\*\*)?(\d{4,})/i,
    ],
    typeKeywords: { debit: ['debited', 'spent', 'paid'], credit: ['credited', 'received'] },
  },
];

// ─── AMOUNT EXTRACTION ────────────────────────────────────────────────────────
const extractAmount = (text) => {
  const patterns = [
    /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /(?:debited|credited|paid|spent|received)\s*(?:by|for|of)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /([\d,]+(?:\.\d{2})?)\s*(?:Rs\.?|INR|₹)/gi,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 10000000) return amount;
    }
  }
  return null;
};

// ─── TRANSACTION TYPE DETECTION ───────────────────────────────────────────────
const extractType = (text) => {
  const lower = text.toLowerCase();
  const debitKeywords = ['debited', 'deducted', 'paid', 'spent', 'withdrawn', 'purchase', 'payment', 'transferred out'];
  const creditKeywords = ['credited', 'received', 'deposited', 'refund', 'salary', 'cashback', 'transferred in'];
  if (debitKeywords.some(k => lower.includes(k))) return 'debit';
  if (creditKeywords.some(k => lower.includes(k))) return 'credit';
  return 'debit'; // default
};

// ─── BANK EXTRACTION ──────────────────────────────────────────────────────────
const extractBank = (text, sender = '') => {
  const bankMap = {
    'HDFC': ['hdfc', 'hdfcbank'],
    'SBI': ['sbi', 'state bank'],
    'ICICI': ['icici', 'icicibk'],
    'Axis': ['axis', 'axisbank'],
    'Kotak': ['kotak', '811'],
    'IDFC First': ['idfc', 'idfcfirst'],
    'Yes Bank': ['yes bank', 'yesbank'],
    'PNB': ['pnb', 'punjab national'],
    'Bank of Baroda': ['bob', 'bank of baroda'],
    'Canara': ['canara', 'canarabank'],
    'IndusInd': ['indusind'],
    'Federal': ['federal bank'],
  };
  const combined = (text + ' ' + sender).toLowerCase();
  for (const [bank, keywords] of Object.entries(bankMap)) {
    if (keywords.some(k => combined.includes(k))) return bank;
  }
  return 'Unknown Bank';
};

// ─── ACCOUNT EXTRACTION ───────────────────────────────────────────────────────
const extractAccount = (text) => {
  const patterns = [
    /(?:A\/C|AC|account|acct)[\s#:]*(?:[Xx*]{2,4})?(\d{4})/i,
    /(?:ending|no\.?|number)[\s:]*(?:[Xx*]{0,4})(\d{4})/i,
    /(?:XX|xx|\*{2,4})(\d{4})/,
    /(\d{4})\s*(?:is|has been|was)/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) return `****${match[1]}`;
  }
  return null;
};

// ─── MERCHANT EXTRACTION ──────────────────────────────────────────────────────
const extractMerchant = (text) => {
  const patterns = [
    /(?:at|to|for|merchant|payee)\s+([A-Z][A-Za-z0-9\s&'-]{2,30}?)(?:\s+on|\s+via|\s+using|\.|,)/i,
    /VPA\s+([a-zA-Z0-9._@-]+)/i,
    /(?:UPI|NEFT|IMPS)[/\s]+([A-Z][A-Za-z0-9\s]{2,25})/i,
    /(?:purchase at|transaction at|payment to)\s+([A-Z][A-Za-z0-9\s&'-]{2,30})/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      let merchant = match[1].trim();
      // Extract first part of UPI VPA
      if (merchant.includes('@')) merchant = merchant.split('@')[0];
      // Clean up and capitalize
      merchant = merchant.replace(/[_-]/g, ' ').trim();
      if (merchant.length > 2) return merchant;
    }
  }
  return 'Unknown Merchant';
};

// ─── DATE EXTRACTION ──────────────────────────────────────────────────────────
const extractDate = (text) => {
  const patterns = [
    /(\d{2}[-/]\d{2}[-/]\d{2,4})/,
    /(\d{2}[-\s][A-Za-z]{3}[-\s]\d{2,4})/,
    /on\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const parsed = new Date(match[1].replace(/[-]/g, '/'));
      if (!isNaN(parsed)) return parsed;
    }
  }
  return new Date();
};

// ─── MAIN PARSER ──────────────────────────────────────────────────────────────
const parseSMS = (smsText, sender = '') => {
  if (!smsText || typeof smsText !== 'string') {
    return { success: false, error: 'Invalid SMS text' };
  }

  const amount = extractAmount(smsText);
  if (!amount) {
    return { success: false, error: 'No transaction amount found' };
  }

  return {
    success: true,
    data: {
      amount,
      type: extractType(smsText),
      bank: extractBank(smsText, sender),
      account: extractAccount(smsText),
      merchant: extractMerchant(smsText),
      date: extractDate(smsText),
      rawSms: smsText,
    },
  };
};

// ─── BATCH PARSER ─────────────────────────────────────────────────────────────
const parseSMSBatch = (messages) => {
  return messages
    .map(msg => parseSMS(typeof msg === 'string' ? msg : msg.text, msg.sender))
    .filter(result => result.success)
    .map(result => result.data);
};

module.exports = { parseSMS, parseSMSBatch, extractAmount, extractType, extractBank, extractAccount, extractMerchant };
