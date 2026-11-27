export type FastStoreId = 'all' | 'croma' | 'reliance' | 'vijaysales';

export type DailyLifeId =
  | 'college'
  | 'office'
  | 'creator'
  | 'movies_home'
  | 'study_gaming';

export type PriorityId = 'ai_tools' | 'no_charger' | 'four_years';

export type BudgetTierId = 'under_75k' | '75k_95k' | '95k_120k' | '120k_plus';

export type ShowdownRoundId =
  | 'baseline'
  | 'monday_rush'
  | 'train_offline'
  | 'eighteen_months';

export interface DailyLifeOption {
  id: DailyLifeId;
  title: string;
  examples: string;
  plainBenefit: string;
}

export interface PriorityOption {
  id: PriorityId;
  label: string;
  shortTag: string;
}

export interface BudgetOption {
  id: BudgetTierId;
  label: string;
  hint: string;
  minInr: number;
  maxInr: number;
}

export interface FastModeLaptop {
  id: string;
  brand: string;
  name: string;
  seriesLabel: 'Core Ultra Series 1' | 'Core Ultra Series 2';
  processor: string;
  graphics: string;
  ram: string;
  storage: string;
  batteryHours: number;
  weightKg: number;
  display: string;
  retailerId: Exclude<FastStoreId, 'all'>;
  retailerName: 'Croma' | 'Reliance Digital' | 'Vijay Sales';
  storeSku: string;
  priceInr: number;
  budgetTier: BudgetTierId;
  bestFor: DailyLifeId[];
  whyItFitsPlain: string;
  storeSearchUrl: string;
}

export interface GenericCounterfactual {
  budgetTier: BudgetTierId;
  label: string;
  approxPriceInr: number;
  looksPitch: string;
  hiddenCatch: string;
  replacementMonths: string;
}

export interface ShowdownMeterTelemetry {
  batteryLeftPct: number;
  batteryNote: string;
  heatNoisePct: number;
  heatNoiseLabel: string;
  privacyPct: number;
  privacyLabel: string;
  privacyAlert?: string;
  reliabilityPct: number;
  reliabilityLabel: string;
}

export interface ShowdownRoundMeta {
  id: ShowdownRoundId;
  stepNumber: number;
  shortLabel: string;
  buttonLabel: string;
  headline: string;
  sceneSummary: string;
  intelTakeaway: string;
  genericTakeaway: string;
}

export const FAST_STORE_FILTERS: { id: FastStoreId; label: string }[] = [
  { id: 'all', label: 'All Stores' },
  { id: 'croma', label: 'Croma' },
  { id: 'reliance', label: 'Reliance Digital' },
  { id: 'vijaysales', label: 'Vijay Sales' },
];

export const DAILY_LIFE_OPTIONS: DailyLifeOption[] = [
  {
    id: 'college',
    title: 'College & Assignments',
    examples: 'Docs, PDFs, 20+ browser tabs, late-night study',
    plainBenefit: 'Stays snappy across 20+ Chrome tabs without burning through battery in class.',
  },
  {
    id: 'office',
    title: 'Office & Endless Multitasking',
    examples: 'Excel, Teams/Zoom calls, presentations',
    plainBenefit: 'Runs blurred video calls quietly all day with zero fan whine in meetings.',
  },
  {
    id: 'creator',
    title: 'Reels, Photos & Content Creation',
    examples: 'Canva, CapCut/Premiere, photo touch-ups',
    plainBenefit: 'Built-in Arc graphics export reels and batch-edit photos cleanly without lag.',
  },
  {
    id: 'movies_home',
    title: 'Movies, Browsing & Home Use',
    examples: 'YouTube, Netflix, family banking, everyday tasks',
    plainBenefit: 'Crisp display, instant wake, and dependable speed everyone at home can trust.',
  },
  {
    id: 'study_gaming',
    title: 'Study + Casual Gaming',
    examples: 'Assignments by day, Valorant/FIFA/indie games at night',
    plainBenefit: 'Quiet in the lecture hall and smooth frame rates when you unwind at night.',
  },
];

export const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'ai_tools',
    label: 'I use AI tools (ChatGPT, Canva AI, Zoom blur, note summarizers)',
    shortTag: 'AI tools',
  },
  {
    id: 'no_charger',
    label: 'I hate carrying a charger everywhere',
    shortTag: 'All-day battery',
  },
  {
    id: 'four_years',
    label: 'I want this laptop to stay fast for 4+ years',
    shortTag: '4+ year lifespan',
  },
];

export const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: 'under_75k',
    label: 'Under ₹75,000',
    hint: 'Smart everyday value',
    minInr: 60000,
    maxInr: 75000,
  },
  {
    id: '75k_95k',
    label: '₹75,000 – ₹95,000',
    hint: 'Sweet spot for college & work',
    minInr: 75001,
    maxInr: 95000,
  },
  {
    id: '95k_120k',
    label: '₹95,000 – ₹1,20,000',
    hint: 'OLED & all-day ultrabooks',
    minInr: 95001,
    maxInr: 120000,
  },
  {
    id: '120k_plus',
    label: '₹1,20,000+',
    hint: 'Flagship creator & pro gaming',
    minInr: 120001,
    maxInr: 220000,
  },
];

// Verified Indian LFR Store Inventory — Strictly Croma, Reliance Digital & Vijay Sales (Core Ultra Series 1 & Series 2 ONLY)
export const LFR_FAST_CATALOG: FastModeLaptop[] = [
  // Under ₹75,000
  {
    id: 'lfr-hp-15-fd1099tu',
    brand: 'HP',
    name: 'HP 15 AI Laptop (15-fd1099TU)',
    seriesLabel: 'Core Ultra Series 1',
    processor: 'Intel Core Ultra 5 125H',
    graphics: 'Intel Arc Graphics',
    ram: '16GB DDR5',
    storage: '512GB NVMe SSD',
    batteryHours: 14,
    weightKg: 1.59,
    display: '15.6" Full HD Anti-Glare',
    retailerId: 'reliance',
    retailerName: 'Reliance Digital',
    storeSku: '15-fd1099TU',
    priceInr: 72995,
    budgetTier: 'under_75k',
    bestFor: ['college', 'movies_home', 'office'],
    whyItFitsPlain: 'Big 15.6-inch screen for spreadsheets & movies, with 16GB RAM so 20+ browser tabs stay smooth.',
    storeSearchUrl: 'https://www.reliancedigital.in/search?q=HP+15-fd1099TU',
  },
  {
    id: 'lfr-lenovo-slim5-14imh9',
    brand: 'Lenovo',
    name: 'Lenovo IdeaPad Slim 5 AI (14IMH9)',
    seriesLabel: 'Core Ultra Series 1',
    processor: 'Intel Core Ultra 5 125H',
    graphics: 'Intel Arc Graphics',
    ram: '16GB LPDDR5x',
    storage: '512GB NVMe SSD',
    batteryHours: 15,
    weightKg: 1.46,
    display: '14" WUXGA Anti-Glare',
    retailerId: 'croma',
    retailerName: 'Croma',
    storeSku: '83DA003GIN / 14IMH9',
    priceInr: 73990,
    budgetTier: 'under_75k',
    bestFor: ['college', 'office', 'movies_home'],
    whyItFitsPlain: 'Light 1.46 kg metal body that fits easily in a college backpack and runs quietly through back-to-back classes.',
    storeSearchUrl: 'https://www.croma.com/searchB?q=Lenovo%20IdeaPad%20Slim%205%20Core%20Ultra%205%3Arelevance',
  },
  {
    id: 'lfr-asus-vivobook-s14-5406ma',
    brand: 'ASUS',
    name: 'ASUS Vivobook S 14 OLED (S5406MA)',
    seriesLabel: 'Core Ultra Series 1',
    processor: 'Intel Core Ultra 5 125H',
    graphics: 'Intel Arc Graphics',
    ram: '16GB LPDDR5x',
    storage: '512GB NVMe SSD',
    batteryHours: 16,
    weightKg: 1.3,
    display: '14" Full HD+ OLED',
    retailerId: 'vijaysales',
    retailerName: 'Vijay Sales',
    storeSku: 'S5406MA-QD551WS',
    priceInr: 74490,
    budgetTier: 'under_75k',
    bestFor: ['college', 'creator', 'movies_home', 'study_gaming'],
    whyItFitsPlain: 'Punchy OLED screen for Canva/movies plus ultra-light 1.3 kg build with a built-in AI helper chip.',
    storeSearchUrl: 'https://www.vijaysales.com/search?q=ASUS+Vivobook+S+14+Core+Ultra+5',
  },

  // ₹75,000 – ₹95,000
  {
    id: 'lfr-hp-pavilion-plus-14',
    brand: 'HP',
    name: 'HP Pavilion Plus 14 AI (14-ew1074TU)',
    seriesLabel: 'Core Ultra Series 1',
    processor: 'Intel Core Ultra 5 125H',
    graphics: 'Intel Arc Graphics',
    ram: '16GB LPDDR5x',
    storage: '512GB NVMe SSD',
    batteryHours: 15,
    weightKg: 1.38,
    display: '14" 2.8K Sharp OLED',
    retailerId: 'croma',
    retailerName: 'Croma',
    storeSku: '14-ew1074TU',
    priceInr: 82990,
    budgetTier: '75k_95k',
    bestFor: ['creator', 'college', 'movies_home'],
    whyItFitsPlain: 'Super crisp 2.8K screen makes photos, reels, and Netflix look sharp while staying light at 1.38 kg.',
    storeSearchUrl: 'https://www.croma.com/searchB?q=HP%20Pavilion%20Plus%2014%20Core%20Ultra%3Arelevance',
  },
  {
    id: 'lfr-lenovo-slim5-14iah10',
    brand: 'Lenovo',
    name: 'Lenovo IdeaPad Slim 5 AI (14IAH10)',
    seriesLabel: 'Core Ultra Series 2',
    processor: 'Intel Core Ultra 5 225H',
    graphics: 'Intel Arc Graphics',
    ram: '16GB LPDDR5x',
    storage: '512GB NVMe SSD',
    batteryHours: 17,
    weightKg: 1.39,
    display: '14" WUXGA OLED',
    retailerId: 'vijaysales',
    retailerName: 'Vijay Sales',
    storeSku: '14IAH10',
    priceInr: 84990,
    budgetTier: '75k_95k',
    bestFor: ['college', 'office', 'movies_home'],
    whyItFitsPlain: 'Series 2 efficiency stretches battery up to 17 hours so you can leave your charger in your room.',
    storeSearchUrl: 'https://www.vijaysales.com/search?q=Lenovo+IdeaPad+Slim+5+Core+Ultra+5',
  },
  {
    id: 'lfr-asus-vivobook-16-x1607ca',
    brand: 'ASUS',
    name: 'ASUS Vivobook 16 AI (X1607CA)',
    seriesLabel: 'Core Ultra Series 2',
    processor: 'Intel Core Ultra 5 225H',
    graphics: 'Intel Arc Graphics',
    ram: '16GB DDR5',
    storage: '512GB NVMe SSD',
    batteryHours: 15,
    weightKg: 1.75,
    display: '16" Large WUXGA Display',
    retailerId: 'reliance',
    retailerName: 'Reliance Digital',
    storeSku: 'X1607CA-MB142WS',
    priceInr: 92990,
    budgetTier: '75k_95k',
    bestFor: ['office', 'study_gaming', 'creator'],
    whyItFitsPlain: 'Spacious 16-inch workspace for side-by-side Excel, Zoom calls, and casual evening Valorant sessions.',
    storeSearchUrl: 'https://www.reliancedigital.in/search?q=ASUS+X1607CA-MB142WS',
  },

  // ₹95,000 – ₹1,20,000
  {
    id: 'lfr-asus-zenbook-14-ux3405ma',
    brand: 'ASUS',
    name: 'ASUS Zenbook 14 OLED (UX3405MA)',
    seriesLabel: 'Core Ultra Series 1',
    processor: 'Intel Core Ultra 5 125H',
    graphics: 'Intel Arc Graphics',
    ram: '16GB LPDDR5x',
    storage: '1TB NVMe SSD',
    batteryHours: 16,
    weightKg: 1.2,
    display: '14" 3K 120Hz OLED',
    retailerId: 'croma',
    retailerName: 'Croma',
    storeSku: 'UX3405MA-PZ551WS',
    priceInr: 99990,
    budgetTier: '95k_120k',
    bestFor: ['college', 'office', 'movies_home'],
    whyItFitsPlain: 'Featherlight 1.2 kg magnesium-aluminum build with 1TB storage for 4+ years of files and projects.',
    storeSearchUrl: 'https://www.croma.com/searchB?q=UX3405MA-PZ551WS%3Arelevance',
  },
  {
    id: 'lfr-dell-inspiron-14-plus-ai',
    brand: 'Dell',
    name: 'Dell Inspiron 14 Plus AI (Series 2)',
    seriesLabel: 'Core Ultra Series 2',
    processor: 'Intel Core Ultra 7 256V',
    graphics: 'Intel Arc 140V Graphics',
    ram: '16GB LPDDR5x',
    storage: '1TB NVMe SSD',
    batteryHours: 18,
    weightKg: 1.44,
    display: '14" 2.2K ComfortView Plus',
    retailerId: 'vijaysales',
    retailerName: 'Vijay Sales',
    storeSku: 'INSP14-U7-256V',
    priceInr: 108990,
    budgetTier: '95k_120k',
    bestFor: ['office', 'college', 'study_gaming'],
    whyItFitsPlain: 'Arc 140V graphics handles smooth indie/esports games and fast video exports while running cool and quiet.',
    storeSearchUrl: 'https://www.vijaysales.com/search?q=Dell+Inspiron+14+Core+Ultra+7',
  },
  {
    id: 'lfr-lenovo-yoga-slim7-14imh9',
    brand: 'Lenovo',
    name: 'Lenovo Yoga Slim 7 OLED (14IMH9)',
    seriesLabel: 'Core Ultra Series 1',
    processor: 'Intel Core Ultra 7 155H',
    graphics: 'Intel Arc Graphics',
    ram: '32GB LPDDR5x',
    storage: '1TB NVMe SSD',
    batteryHours: 16,
    weightKg: 1.39,
    display: '14" WUXGA OLED',
    retailerId: 'croma',
    retailerName: 'Croma',
    storeSku: '83QM0048IN',
    priceInr: 114990,
    budgetTier: '95k_120k',
    bestFor: ['creator', 'office', 'study_gaming'],
    whyItFitsPlain: 'Generous 32GB memory + 1TB SSD means heavy Premiere timelines and 40+ browser tabs never slow down.',
    storeSearchUrl: 'https://www.croma.com/searchB?q=Lenovo%20Yoga%20Slim%207%20Core%20Ultra%207%3Arelevance',
  },
  {
    id: 'lfr-hp-omnibook-flip-14',
    brand: 'HP',
    name: 'HP OmniBook Ultra Flip 14 AI',
    seriesLabel: 'Core Ultra Series 2',
    processor: 'Intel Core Ultra 7 256V',
    graphics: 'Intel Arc 140V Graphics',
    ram: '16GB LPDDR5x',
    storage: '1TB NVMe SSD',
    batteryHours: 19,
    weightKg: 1.34,
    display: '14" 2.8K OLED Touch 2-in-1',
    retailerId: 'reliance',
    retailerName: 'Reliance Digital',
    storeSku: '14-fh0026TU',
    priceInr: 116990,
    budgetTier: '95k_120k',
    bestFor: ['college', 'creator', 'movies_home'],
    whyItFitsPlain: '19-hour battery champ with a flip touchscreen for note-taking, Canva sketches, and cozy Netflix nights.',
    storeSearchUrl: 'https://www.reliancedigital.in/search?q=HP+OmniBook+Ultra+Flip+14',
  },

  // ₹1,20,000+
  {
    id: 'lfr-lenovo-yoga-aura-15ill9',
    brand: 'Lenovo',
    name: 'Lenovo Yoga Slim 7i Aura Edition',
    seriesLabel: 'Core Ultra Series 2',
    processor: 'Intel Core Ultra 7 258V',
    graphics: 'Intel Arc 140V Graphics',
    ram: '32GB LPDDR5x',
    storage: '1TB NVMe SSD',
    batteryHours: 20,
    weightKg: 1.46,
    display: '15.3" 2.8K 120Hz PureSight',
    retailerId: 'croma',
    retailerName: 'Croma',
    storeSku: '15ILL9-AURA',
    priceInr: 139990,
    budgetTier: '120k_plus',
    bestFor: ['office', 'creator', 'college', 'movies_home'],
    whyItFitsPlain: '20-hour real-world battery + 32GB memory gives you desktop power without ever hunting for a wall plug.',
    storeSearchUrl: 'https://www.croma.com/searchB?q=Lenovo%20Yoga%20Slim%207i%20Aura%20Edition%3Arelevance',
  },
  {
    id: 'lfr-asus-zenbook-14-ux3405ca',
    brand: 'ASUS',
    name: 'ASUS Zenbook 14 OLED (UX3405CA)',
    seriesLabel: 'Core Ultra Series 2',
    processor: 'Intel Core Ultra 9 285H',
    graphics: 'Intel Arc 140T Graphics',
    ram: '32GB LPDDR5x',
    storage: '1TB NVMe SSD',
    batteryHours: 17,
    weightKg: 1.28,
    display: '14" 3K 120Hz OLED',
    retailerId: 'reliance',
    retailerName: 'Reliance Digital',
    storeSku: 'UX3405CA-QL1691WS',
    priceInr: 143990,
    budgetTier: '120k_plus',
    bestFor: ['creator', 'office', 'study_gaming'],
    whyItFitsPlain: 'Flagship Core Ultra 9 speed in a 1.28 kg travel frame—built for rapid 4K reels and 5+ years of heavy use.',
    storeSearchUrl: 'https://www.reliancedigital.in/search?q=UX3405CA-QL1691WS',
  },
  {
    id: 'lfr-acer-predator-helios-neo-16',
    brand: 'Acer',
    name: 'Acer Predator Helios Neo 16 AI',
    seriesLabel: 'Core Ultra Series 2',
    processor: 'Intel Core Ultra 9 275HX',
    graphics: 'Intel Arc + Dedicated GeForce RTX',
    ram: '32GB DDR5',
    storage: '1TB NVMe SSD',
    batteryHours: 9,
    weightKg: 2.4,
    display: '16" WQXGA 165Hz',
    retailerId: 'vijaysales',
    retailerName: 'Vijay Sales',
    storeSku: 'PHN16-AI-U9',
    priceInr: 154990,
    budgetTier: '120k_plus',
    bestFor: ['study_gaming', 'creator'],
    whyItFitsPlain: 'High-refresh 165Hz screen + Core Ultra 9 + dedicated graphics crushes Valorant, AAA titles, and heavy renders.',
    storeSearchUrl: 'https://www.vijaysales.com/search?q=Acer+Predator+Helios+Neo+16+Core+Ultra',
  },
];

export const GENERIC_COUNTERFACTUALS: Record<BudgetTierId, GenericCounterfactual> = {
  under_75k: {
    budgetTier: 'under_75k',
    label: 'Flashy Budget Generic Laptop (~₹65,000)',
    approxPriceInr: 65000,
    looksPitch: 'Thin glossy shell, bright storefront sticker, 8GB soldered RAM',
    hiddenCatch: 'No dedicated NPU—video call blur & AI tasks overheat the single fan and chew through battery in ~4 hours.',
    replacementMonths: '18–24 months',
  },
  '75k_95k': {
    budgetTier: '75k_95k',
    label: 'Flashy Mid-Price Generic Laptop (~₹84,000)',
    approxPriceInr: 84000,
    looksPitch: 'Sleek showroom chassis with big sticker claims',
    hiddenCatch: 'Sends offline notes to cloud servers or hits Windows app compatibility/emulation hiccups after updates.',
    replacementMonths: '20–24 months',
  },
  '95k_120k': {
    budgetTier: '95k_120k',
    label: 'Flashy Lifestyle Generic Laptop (~₹1,05,000)',
    approxPriceInr: 105000,
    looksPitch: 'Premium outer metal finish marketed on battery alone',
    hiddenCatch: 'Struggles with Indian banking utilities, Tally, or Adobe plugins under emulation—or throttles on sustained calls.',
    replacementMonths: '24 months',
  },
  '120k_plus': {
    budgetTier: '120k_plus',
    label: 'Flashy Spec-Sheet Generic Laptop (~₹1,35,000)',
    approxPriceInr: 135000,
    looksPitch: 'Loud marketing numbers without balanced AI efficiency',
    hiddenCatch: 'Runs hot and noisy on your lap during edits and drains fast when unplugged from the wall.',
    replacementMonths: '24 months',
  },
};

export const SHOWDOWN_ROUNDS: ShowdownRoundMeta[] = [
  {
    id: 'baseline',
    stepNumber: 0,
    shortLabel: 'Out of Box',
    buttonLabel: 'Fresh Out of Box',
    headline: 'Both look sleek on the store table—until real life starts.',
    sceneSummary: 'Tap a stress test above to put both laptops through a busy Indian weekday.',
    intelTakeaway: 'Ready with CPU + Intel Arc Graphics + built-in Intel AI Boost NPU.',
    genericTakeaway: 'Looks tidy idle on a showroom table before any real apps open.',
  },
  {
    id: 'monday_rush',
    stepNumber: 1,
    shortLabel: '1. Monday',
    buttonLabel: 'Round 1: Monday Rush',
    headline: 'Monday Rush: 20 Chrome Tabs + Video Call + Background Blur',
    sceneSummary: '45-minute lecture or office call with background blur ON across 20 browser tabs.',
    intelTakeaway: 'Built-in NPU handles camera blur quietly so the main chip stays cool and battery barely dips.',
    genericTakeaway: 'Forces the main CPU to brute-force blur: bottom heats up, fan whines loudly, and battery drops fast.',
  },
  {
    id: 'train_offline',
    stepNumber: 2,
    shortLabel: '2. Zero Wi-Fi',
    buttonLabel: 'Round 2: No Wi-Fi on Train',
    headline: 'No Wi-Fi on the Train: Summarize Private Notes + Edit Photo',
    sceneSummary: 'Spotty hostel or train Wi-Fi drops—you still need notes summarized and photos edited privately.',
    intelTakeaway: 'Works 100% offline right on your laptop—your personal docs and photos never leave your device.',
    genericTakeaway: 'Either stalls without internet or flashes a cloud-upload prompt sending your private files off-device.',
  },
  {
    id: 'eighteen_months',
    stepNumber: 3,
    shortLabel: '3. 18 Months',
    buttonLabel: 'Round 3: 18 Months Later',
    headline: '18 Months Later: Heavy OS Updates + Everyday Windows Apps',
    sceneSummary: 'Four semesters of Windows updates, Tally, Adobe plugins, and everyday apps.',
    intelTakeaway: '100% native Windows compatibility—Tally, Adobe, engineering tools, and games run smoothly in Year 4.',
    genericTakeaway: 'Sluggish memory, throttled thermals, or non-x86 app/plugin headaches push you into an early replacement.',
  },
];

export const SHOWDOWN_TELEMETRY: Record<
  ShowdownRoundId,
  { intel: ShowdownMeterTelemetry; generic: ShowdownMeterTelemetry }
> = {
  baseline: {
    intel: {
      batteryLeftPct: 100,
      batteryNote: '15–20h unplugged',
      heatNoisePct: 14,
      heatNoiseLabel: 'Cool & Silent · 31°C',
      privacyPct: 100,
      privacyLabel: 'Private On-Device',
      reliabilityPct: 100,
      reliabilityLabel: 'Native Windows',
    },
    generic: {
      batteryLeftPct: 100,
      batteryNote: 'Showroom idle',
      heatNoisePct: 24,
      heatNoiseLabel: 'Idle · 35°C',
      privacyPct: 72,
      privacyLabel: 'Cloud-Dependent AI',
      reliabilityPct: 78,
      reliabilityLabel: 'Mixed App Support',
    },
  },
  monday_rush: {
    intel: {
      batteryLeftPct: 84,
      batteryNote: 'Charger still in bag',
      heatNoisePct: 24,
      heatNoiseLabel: 'Whisper Quiet · 34°C',
      privacyPct: 100,
      privacyLabel: 'Blur Runs on NPU',
      reliabilityPct: 100,
      reliabilityLabel: 'Smooth Video + 20 Tabs',
    },
    generic: {
      batteryLeftPct: 46,
      batteryNote: 'Hunting for wall plug',
      heatNoisePct: 86,
      heatNoiseLabel: 'Loud Fan + Hot · 49°C',
      privacyPct: 58,
      privacyLabel: 'CPU Overloaded',
      reliabilityPct: 62,
      reliabilityLabel: 'Call Stutters & Reloads',
    },
  },
  train_offline: {
    intel: {
      batteryLeftPct: 71,
      batteryNote: 'Zero Wi-Fi needed',
      heatNoisePct: 26,
      heatNoiseLabel: 'Cool on Lap · 35°C',
      privacyPct: 100,
      privacyLabel: 'Private & Offline',
      reliabilityPct: 100,
      reliabilityLabel: 'Instant Local AI',
    },
    generic: {
      batteryLeftPct: 28,
      batteryNote: 'Low Battery Warning',
      heatNoisePct: 82,
      heatNoiseLabel: 'Warm & Draining · 47°C',
      privacyPct: 22,
      privacyLabel: 'Cloud Upload Required',
      privacyAlert: 'Sending your private files to the cloud',
      reliabilityPct: 44,
      reliabilityLabel: 'Blocked Offline',
    },
  },
  eighteen_months: {
    intel: {
      batteryLeftPct: 78,
      batteryNote: 'Full campus/office day',
      heatNoisePct: 28,
      heatNoiseLabel: 'Clean & Quiet · 36°C',
      privacyPct: 100,
      privacyLabel: 'Private & Offline',
      reliabilityPct: 100,
      reliabilityLabel: 'Tally, Adobe & Games',
    },
    generic: {
      batteryLeftPct: 31,
      batteryNote: 'Degraded · Plugged daily',
      heatNoisePct: 92,
      heatNoiseLabel: 'Constant Fan Roar · 52°C',
      privacyPct: 30,
      privacyLabel: 'Cloud Lock-In',
      reliabilityPct: 38,
      reliabilityLabel: 'Lag + Plugin Limits',
    },
  },
};

export interface FastModeSelection {
  primaryLife: DailyLifeId;
  secondaryLife: DailyLifeId | null;
  priorities: PriorityId[];
  budgetTier: BudgetTierId;
}

export interface FastModeMatchResult {
  primaryLaptop: FastModeLaptop;
  storePicks: FastModeLaptop[];
  stretchLaptop: FastModeLaptop | null;
  genericRival: GenericCounterfactual;
  intelFourYearPerYear: number;
  genericFourYearTotal: number;
  genericFourYearPerYear: number;
  fourYearSavingsInr: number;
  dontNeedToPayFor: string;
}

export function formatFastInr(inr: number): string {
  return `₹${Math.round(inr).toLocaleString('en-IN')}`;
}

export function solveFastModeMatch(
  selection: FastModeSelection,
  storeFilter: FastStoreId
): FastModeMatchResult {
  const pool =
    storeFilter === 'all'
      ? LFR_FAST_CATALOG
      : LFR_FAST_CATALOG.filter((item) => item.retailerId === storeFilter);

  const budgetMeta =
    BUDGET_OPTIONS.find((b) => b.id === selection.budgetTier) ?? BUDGET_OPTIONS[1];

  const scoreLaptop = (laptop: FastModeLaptop): number => {
    let score = 40;
    if (laptop.budgetTier === selection.budgetTier) score += 38;
    else if (laptop.priceInr <= budgetMeta.maxInr + 15000) score += 14;
    else score -= 18;

    if (laptop.bestFor[0] === selection.primaryLife) score += 24;
    else if (laptop.bestFor.includes(selection.primaryLife)) score += 16;

    if (selection.secondaryLife && laptop.bestFor.includes(selection.secondaryLife)) {
      score += 10;
    }

    if (selection.priorities.includes('no_charger')) {
      score += laptop.batteryHours >= 16 ? 10 : laptop.batteryHours >= 14 ? 5 : -8;
    }
    if (selection.priorities.includes('ai_tools')) {
      score += laptop.seriesLabel === 'Core Ultra Series 2' ? 9 : 4;
    }
    if (selection.priorities.includes('four_years')) {
      if (laptop.ram.includes('32GB')) score += 9;
      if (laptop.storage.includes('1TB')) score += 6;
    }
    return score;
  };

  const ranked = [...pool].sort((a, b) => scoreLaptop(b) - scoreLaptop(a));

  // Prefer keeping primary pick within or closest to chosen budget tier
  const inBudget = ranked.filter((item) => item.budgetTier === selection.budgetTier);
  const primaryLaptop = inBudget[0] ?? ranked[0] ?? LFR_FAST_CATALOG[0];

  // Top matched laptop at each partner retail store (Croma, Reliance Digital, Vijay Sales)
  const storeIds: Exclude<FastStoreId, 'all'>[] = ['croma', 'reliance', 'vijaysales'];
  const storePicks = storeIds
    .map((sid) => {
      const storeRanked = LFR_FAST_CATALOG.filter((item) => item.retailerId === sid).sort(
        (a, b) => scoreLaptop(b) - scoreLaptop(a)
      );
      return (
        storeRanked.find((item) => item.budgetTier === selection.budgetTier) ?? storeRanked[0]
      );
    })
    .filter((item): item is FastModeLaptop => Boolean(item))
    .sort((a, b) => scoreLaptop(b) - scoreLaptop(a));

  // Find 1 helpful Stretch Pick (+₹8k to +₹26k above primary, preferring next tier or higher battery/RAM)
  const stretchCandidate =
    ranked.find(
      (item) =>
        item.id !== primaryLaptop.id &&
        item.priceInr >= primaryLaptop.priceInr + 7000 &&
        item.priceInr <= primaryLaptop.priceInr + 28000
    ) ??
    ranked.find(
      (item) => item.id !== primaryLaptop.id && item.priceInr > primaryLaptop.priceInr
    ) ??
    null;

  const genericRival = GENERIC_COUNTERFACTUALS[selection.budgetTier];
  const intelFourYearPerYear = Math.round(primaryLaptop.priceInr / 4);
  const genericFourYearTotal = genericRival.approxPriceInr * 2;
  const genericFourYearPerYear = Math.round(genericFourYearTotal / 4);
  const fourYearSavingsInr = Math.max(0, genericFourYearTotal - primaryLaptop.priceInr);

  let dontNeedToPayFor =
    'You do not need an expensive ₹1.5L+ heavy gaming brick or bulky external accessories—this Intel Core Ultra laptop already includes built-in Arc graphics and quiet AI acceleration.';
  if (selection.primaryLife === 'college' || selection.primaryLife === 'movies_home') {
    dontNeedToPayFor =
      'You do not need to pay ₹1.4L+ for a heavy gaming graphics card or loud twin-turbine chassis. Skip those extras and keep your money—16GB RAM + Intel Arc graphics easily handles college tabs, movies, and Canva.';
  } else if (selection.primaryLife === 'office') {
    dontNeedToPayFor =
      'You do not need noisy gaming laptops or pricey external webcams/cloud AI subscriptions—your built-in Intel AI Boost NPU runs Zoom blur and everyday office tools quietly right on the laptop.';
  } else if (selection.primaryLife === 'creator') {
    dontNeedToPayFor =
      'You do not need to carry a 2.5 kg desktop replacement just to edit reels or batch photos—Intel Arc graphics inside a thin shell exports smoothly without locking you to a wall socket.';
  }

  return {
    primaryLaptop,
    storePicks,
    stretchLaptop: stretchCandidate,
    genericRival,
    intelFourYearPerYear,
    genericFourYearTotal,
    genericFourYearPerYear,
    fourYearSavingsInr,
    dontNeedToPayFor,
  };
}

export function buildWhatsappParentSummary(
  match: FastModeMatchResult,
  primaryLifeTitle: string
): string {
  const { primaryLaptop, intelFourYearPerYear, genericFourYearTotal, genericFourYearPerYear } = match;
  return [
    `Shortlisted Laptop (${primaryLifeTitle}): ${primaryLaptop.name}`,
    `Store & Price: ${formatFastInr(primaryLaptop.priceInr)} at ${primaryLaptop.retailerName} (SKU: ${primaryLaptop.storeSku})`,
    `Why it makes financial sense: ${formatFastInr(intelFourYearPerYear)}/yr over 4 years — instead of spending ${formatFastInr(genericFourYearTotal)} (${formatFastInr(genericFourYearPerYear)}/yr) replacing a slower budget laptop after 18–24 months.`,
    `Key everyday perks: ${primaryLaptop.processor}, ${primaryLaptop.ram}, ${primaryLaptop.batteryHours}h battery, and works 100% offline & natively with Indian college/office Windows apps.`,
  ].join('\n');
}

export interface StoreCheckStep {
  id: string;
  stepNo: number;
  title: string;
  plainInstruction: string;
  whatToLookFor: string;
}

export const THREE_TAP_STORE_CHECK: StoreCheckStep[] = [
  {
    id: 'check-badge',
    stepNo: 1,
    title: 'Spot the Intel Core Ultra Badge',
    plainInstruction: 'Look at the bottom-right corner below the keyboard on the display laptop.',
    whatToLookFor: 'Confirm the silver/blue "Intel Core Ultra" sticker (Series 1 or Series 2).',
  },
  {
    id: 'check-npu',
    stepNo: 2,
    title: 'Verify Built-In NPU in Task Manager',
    plainInstruction: 'Press Ctrl + Shift + Esc together, click the "Performance" tab on the left.',
    whatToLookFor: 'Check that "NPU 0 · Intel(R) AI Boost" shows up alongside CPU, Memory, and GPU.',
  },
  {
    id: 'check-ram',
    stepNo: 3,
    title: 'Confirm 16GB+ RAM in Windows Settings',
    plainInstruction: 'Open Windows Settings -> System -> About on the demo unit.',
    whatToLookFor: 'Make sure Installed RAM reads at least 16.0 GB (or 32.0 GB) so it stays fast for 4+ years.',
  },
];
