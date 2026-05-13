const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── RULE-BASED CATEGORY MAP ──────────────────────────────────────────────────
const CATEGORY_RULES = {
  Food: [
    'swiggy', 'zomato', 'dominos', 'domino', 'pizza', 'mcdonald', 'kfc', 'burger king',
    'subway', 'starbucks', 'cafe', 'restaurant', 'hotel', 'dhaba', 'biryani', 'food',
    'eat', 'dine', 'kitchen', 'bakery', 'grocery', 'supermarket', 'bigbasket', 'blinkit',
    'zepto', 'dunzo', 'instamart', 'licious', 'fresho', 'nature', 'organic',
    'amul', 'milkbasket', 'country delight', 'milkman', 'milk', 'vegetables',
  ],
  Transport: [
    'ola', 'uber', 'rapido', 'auto', 'cab', 'taxi', 'metro', 'bus', 'train',
    'irctc', 'railway', 'flight', 'airline', 'indigo', 'air india', 'spicejet',
    'go first', 'akasa', 'airport', 'petrol', 'fuel', 'shell', 'hp petrol',
    'indian oil', 'bharat petroleum', 'parking', 'fastag', 'toll', 'nhai',
    'ola money', 'paytm mobility', 'redbus', 'makemytrip transport',
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal',
    'reliance', 'tata cliq', 'jiomart', 'decathlon', 'h&m', 'zara', 'westside',
    'max fashion', 'shoppers stop', 'lifestyle', 'central', 'pantaloons',
    'ikea', 'pepperfry', 'urban ladder', 'croma', 'vijay sales', 'reliance digital',
    'oneplus', 'apple store', 'samsung', 'mi store',
  ],
  Bills: [
    'electricity', 'bescom', 'msedcl', 'tneb', 'bill', 'recharge', 'jio',
    'airtel', 'vodafone', 'vi ', 'bsnl', 'broadband', 'wifi', 'internet',
    'water', 'gas', 'piped gas', 'png', 'hp gas', 'bharatgas', 'indane',
    'credit card', 'emi', 'loan', 'mortgage', 'insurance', 'lic', 'premium',
    'rent', 'maintenance', 'society', 'housing', 'tax', 'income tax', 'gst',
    'telephone', 'landline', 'mobile postpaid',
  ],
  Entertainment: [
    'netflix', 'amazon prime', 'hotstar', 'disney', 'zee5', 'sony liv',
    'spotify', 'apple music', 'youtube premium', 'gaana', 'wynk',
    'bookmyshow', 'pvr', 'inox', 'cinepolis', 'movie', 'cinema',
    'gaming', 'steam', 'playstation', 'xbox', 'nintendo',
    'concert', 'event', 'amusement', 'theme park', 'wonder la',
    'clubhouse', 'escape room',
  ],
  Healthcare: [
    'apollo', 'fortis', 'manipal', 'max hospital', 'clinic', 'hospital',
    'doctor', 'physician', 'medical', 'pharmacy', 'medicine', 'drug',
    'practo', 'tata 1mg', '1mg', 'netmeds', 'pharmeasy', 'medlife',
    'diagnostic', 'lab', 'pathology', 'thyrocare', 'lal path', 'dr lal',
    'health', 'dental', 'eye', 'optician', 'glasses', 'lens',
    'gym', 'cult.fit', 'cult fit', 'fitness', 'yoga',
  ],
  Education: [
    'school', 'college', 'university', 'tuition', 'coaching', 'course',
    'udemy', 'coursera', 'skillshare', 'linkedin learning', 'byju',
    'unacademy', 'vedantu', 'toppr', 'extramarks', 'khan academy',
    'books', 'stationery', 'library', 'exam', 'fees', 'admission',
    'workshop', 'seminar', 'training',
  ],
};

// ─── RULE-BASED CATEGORIZER ───────────────────────────────────────────────────
const categorizeByRules = (merchant, description = '') => {
  const text = `${merchant} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return { category, confidence: 0.85, method: 'rules' };
    }
  }
  return { category: 'Other', confidence: 0.5, method: 'rules' };
};

// ─── AI-BASED CATEGORIZER ─────────────────────────────────────────────────────
const categorizeWithAI = async (merchant, amount, description = '', userPatterns = []) => {
  const patternsContext = userPatterns.length > 0
    ? `\nUser's known spending patterns: ${JSON.stringify(userPatterns.slice(0, 10))}`
    : '';

  const prompt = `Categorize this Indian financial transaction into exactly one category.

Transaction:
- Merchant: ${merchant}
- Amount: ₹${amount}
- Description: ${description}
${patternsContext}

Categories: Food, Transport, Shopping, Bills, Entertainment, Healthcare, Education, Other

Return ONLY a JSON object, no extra text:
{"category": "CategoryName", "confidence": 0.95, "reasoning": "brief reason"}`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(text);
    return { ...result, method: 'ai' };
  } catch (err) {
    console.error('AI categorization failed, using rules:', err.message);
    return categorizeByRules(merchant, description);
  }
};

// ─── SMART CATEGORIZER (rule-first, AI fallback) ──────────────────────────────
const categorizeTransaction = async (merchant, amount, description = '', userPatterns = [], useAI = true) => {
  // Check user's learned patterns first
  const learnedPattern = userPatterns.find(
    p => p.merchant.toLowerCase() === merchant.toLowerCase()
  );
  if (learnedPattern && learnedPattern.confidence > 0.8) {
    return { category: learnedPattern.category, confidence: learnedPattern.confidence, method: 'learned' };
  }

  // Rule-based with high confidence
  const ruleResult = categorizeByRules(merchant, description);
  if (ruleResult.confidence >= 0.85 || !useAI) return ruleResult;

  // AI fallback for uncertain cases
  return categorizeWithAI(merchant, amount, description, userPatterns);
};

// ─── BATCH CATEGORIZER ────────────────────────────────────────────────────────
const categorizeTransactionsBatch = async (transactions, userPatterns = []) => {
  const results = await Promise.all(
    transactions.map(tx =>
      categorizeTransaction(tx.merchant, tx.amount, tx.description, userPatterns)
    )
  );
  return transactions.map((tx, i) => ({ ...tx, ...results[i] }));
};

// ─── PATTERN LEARNER ──────────────────────────────────────────────────────────
const learnFromFeedback = (existingPatterns, merchant, category, amount) => {
  const existing = existingPatterns.find(p => p.merchant.toLowerCase() === merchant.toLowerCase());
  if (existing) {
    const totalTransactions = existing.frequency + 1;
    existing.avgAmount = ((existing.avgAmount * existing.frequency) + amount) / totalTransactions;
    existing.frequency = totalTransactions;
    existing.category = category;
    existing.confidence = Math.min(0.99, existing.confidence + 0.05);
    return existingPatterns;
  }
  return [...existingPatterns, { merchant, category, avgAmount: amount, frequency: 1, confidence: 0.7 }];
};

module.exports = {
  categorizeTransaction,
  categorizeTransactionsBatch,
  categorizeByRules,
  learnFromFeedback,
};
