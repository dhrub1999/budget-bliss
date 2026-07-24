// Central source for the data / privacy disclaimer so the account form hover
// card and the /privacy page never drift out of sync.

export const DATA_DISCLAIMER_TITLE = 'Your data & privacy';

export const DATA_DISCLAIMER =
  'BudgetBliss is a personal side-project, not a bank or a licensed financial service. ' +
  'Details you enter (bank name, card last-4, balances) are stored only to help you track ' +
  'your money. Never enter full card numbers, CVV, PINs, or netbanking passwords — we never ' +
  'ask for them. We take reasonable care but cannot guarantee against breaches and accept no ' +
  'liability for any loss of data. Add only what you are comfortable storing.';

/** What we store vs. what we never ask for — used on the /privacy page. */
export const DATA_WE_STORE = [
  'The account nicknames, bank/wallet/card provider names you type in',
  'The last 4 digits of a card (never the full number)',
  'Opening balances, limits, and the transactions you add',
  'Your account email, used only to sign you in'
];

export const DATA_WE_NEVER_ASK = [
  'Full card / debit / credit card numbers',
  'CVV, card PIN, or OTPs',
  'Netbanking or UPI passwords',
  'Any bank login credentials'
];
