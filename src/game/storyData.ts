import type {
  CatalogPcCharacter,
  DialogueStep,
  PlayerProfile,
  RecommendationResult,
  StoreStation,
} from './types';

export const EXPO_PC_CATALOG: CatalogPcCharacter[] = [
  {
    id: 'pc_campus_dash',
    name: 'Campus Dash · Ultra 5',
    tierName: 'Intel Core Ultra 5 AI PC',
    persona: 'The All-Day Study Buddy',
    tagline: '20+ hour campus battery + instant offline lecture & PDF AI on the NPU.',
    wx: 9,
    wy: 10,
    accentColor: '#00C7FD',
    factionColor: 'Blue',
    avatarIdx: 3,
    accessory: 'grad_cap',
    demoType: 'offline_ai',
    stationId: 'A',
    highlights: [
      'Dedicated NPU runs study summaries & notes offline with zero Wi-Fi.',
      'Low-Power Island E-Cores stretch unplugged classes past 20 hours.',
      'Whisper-quiet cooling in libraries and hostel rooms.',
    ],
    chatText:
      'Hail, Byte! I am Campus Dash, champion of the Blue Keep and powered by Intel Core Ultra 5. Unplug your charger all day—my dedicated NPU summarizes 60-page PDFs locally with zero Wi-Fi and zero battery panic!',
    demoBurstLabel: 'OFFLINE AI STUDY DEMO · 0% CLOUD · 22H BATTERY',
  },
  {
    id: 'pc_flowcraft_pro',
    name: 'FlowCraft Pro · Ultra 7',
    tierName: 'Intel Core Ultra 7 Evo Edition',
    persona: 'The Multitasking Creator',
    tagline: '300+ AI-accelerated apps running simultaneously across P-Cores, E-Cores & NPU.',
    wx: 18,
    wy: 9,
    accentColor: '#F59E0B',
    factionColor: 'Yellow',
    avatarIdx: 11,
    accessory: 'headphones',
    demoType: 'multitask',
    stationId: 'C',
    highlights: [
      'Hybrid architecture keeps 25 browser tabs, music & AI filters lag-free.',
      'Hardware-accelerated Intel AI Boost across 300+ creative & dev apps.',
      'Sleek metallic chassis built to stay fast for 4+ years of updates.',
    ],
    chatText:
      'Well met, Byte! FlowCraft Pro of the Golden Guild here with Intel Core Ultra 7. Coding, Figma, 30 Chrome tabs, and local AI copilot all at once? My P-Cores and E-Cores split the load with zero stutter!',
    demoBurstLabel: '300+ AI APPS · HYBRID MULTITASKING · ZERO LAG',
  },
  {
    id: 'pc_apex_frame',
    name: 'Apex Frame · Ultra 9',
    tierName: 'Intel Core Ultra 9 Performance',
    persona: 'The High-FPS XeSS Gamer',
    tagline: 'Intel Arc Graphics + XMX XeSS AI Upscaling for crisp 120+ FPS without overheating.',
    wx: 27,
    wy: 10,
    accentColor: '#EF4444',
    factionColor: 'Red',
    avatarIdx: 6,
    accessory: 'visor',
    demoType: 'xess_fps',
    stationId: 'B',
    highlights: [
      'XeSS AI Upscaling delivers smooth 120 FPS gameplay at cool thermals.',
      'Run Discord, OBS stream overlays & local AI voice cleanup on the NPU.',
      'Crushes flashy bargain laptops that throttle after 15 minutes.',
    ],
    chatText:
      'Strike true! Apex Frame of the Crimson Arena checking in with Intel Core Ultra 9 + Arc XeSS! Why let cheap laptops overheat? My XMX AI engines upscale crisp gaming frames so you stay cool and fast!',
    demoBurstLabel: 'INTEL ARC + XeSS BOOST · 120 FPS LOCKED',
  },
  {
    id: 'pc_feather_air',
    name: 'FeatherAir · Ultra 5',
    tierName: 'Intel Core Ultra 5 Ultralight',
    persona: 'The Backpack Commuter',
    tagline: 'Featherweight metal build with instant wake and NPU webcam studio effects.',
    wx: 12,
    wy: 19,
    accentColor: '#A855F7',
    factionColor: 'Purple',
    avatarIdx: 16,
    accessory: 'wings',
    demoType: 'battery_air',
    stationId: 'A',
    highlights: [
      'Under 1.2 kg design with all-day battery—leave the heavy brick at home.',
      'Instant lid-open wake + NPU eye-contact & background blur on calls.',
      'Cool, silent fanless-feel operation during cafes and metro rides.',
    ],
    chatText:
      'Greetings, hero! I am FeatherAir of the Violet Abbey! Built for metro commutes and coffee-shop sprints—light as a parchment scroll, instant wake, and NPU Studio Effects that never drain your battery.',
    demoBurstLabel: 'ULTRALIGHT 1.1KG · INSTANT WAKE · NPU CALL AI',
  },
  {
    id: 'pc_canvas_studio',
    name: 'Canvas Studio · Ultra 7',
    tierName: 'Intel Core Ultra 7 Creator',
    persona: 'The Local Gen-AI Artist',
    tagline: 'On-device AI image generation, auto-reframe video edits & private local models.',
    wx: 24,
    wy: 19,
    accentColor: '#64748B',
    factionColor: 'Black',
    avatarIdx: 21,
    accessory: 'stylus',
    demoType: 'creator_gen',
    stationId: 'C',
    highlights: [
      'Generate images & smart video masks locally without cloud subscriptions.',
      'Private on-device AI processing keeps client & college work on your SSD.',
      'High-bandwidth memory + Arc GPU media engines accelerate 4K exports.',
    ],
    chatText:
      'Welcome, Byte! Canvas Studio of the Obsidian Forge on Core Ultra 7 lets you run local image generation and video auto-cuts right on your laptop—no paid cloud tokens, total privacy!',
    demoBurstLabel: 'LOCAL GEN-AI · PRIVATE ON-DEVICE · 4K MEDIA',
  },
];

export const STORY_DIALOGUES: Record<string, DialogueStep> = {
  // ACT I: BARGAIN TRAP ISLAND (BLUE PAWN)
  trap_intro: {
    id: 'trap_intro',
    speaker: 'GlitterBook Bargain PC',
    role: '₹39,999 Crimson Trap Island',
    portrait: 'trap_laptop',
    avatarIdx: 7,
    factionColor: 'Red',
    text: 'Look at these flashy bargain stickers and crimson banners! Grab your Pawn hammer and march north across Bargain Trap Island to test Offline Study AI AND a match at the Task Gate [WASD / Arrows]!',
    onCompleteEffect: {
      questLabel: 'Walk north to the Overloaded Task Gate on Bargain Trap Island',
    },
  },

  trap_meltdown: {
    id: 'trap_meltdown',
    speaker: 'Byte (Blue Pawn)',
    role: 'System Diagnostic',
    portrait: 'pawn_worker',
    avatarIdx: 2,
    factionColor: 'Blue',
    text: 'Whoa! No dedicated NPU! Every task piled onto one weak CPU lane—FPS dropped to 11, Red raiders are swarming the island, and battery plummeted from 90% to 12%!',
    nextId: 'trap_warp',
  },

  trap_warp: {
    id: 'trap_warp',
    speaker: 'Intel Core Ultra Beacon',
    role: 'Bridge Upgrade · Pawn → Warrior',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'Flashy paint cannot fix weak silicon! Cross the bridge east into Silicon City—claim your Blue Warrior sword & shield in E-Core Park, and unite the Monk Library & Arc Archery!',
    onCompleteEffect: {
      restoreBattery: 100,
      restoreHp: 100,
      questLabel: 'Talk to E-Core Steward [E] on the Emerald Island',
    },
  },

  // ACT II: E-CORE PARK (BLUE WARRIOR UPGRADE)
  ecore_greeting: {
    id: 'ecore_greeting',
    speaker: 'E-Core Steward',
    role: 'Hybrid Power Park Keeper',
    portrait: 'ecore_steward',
    avatarIdx: 4,
    factionColor: 'Blue',
    text: 'Welcome to E-Core Efficiency Park, Warrior Byte! Inside Intel Core Ultra, we split work across Performance Cores, Efficiency Cores, and a Low-Power Island so background apps stay silent and battery lasts all day.',
    nextId: 'ecore_need_choice',
  },

  ecore_need_choice: {
    id: 'ecore_need_choice',
    speaker: 'E-Core Steward',
    role: 'Choose Your Daily Priority',
    portrait: 'ecore_steward',
    avatarIdx: 4,
    factionColor: 'Blue',
    text: 'Tell me what you use a laptop for most so I can chart your Silicon City quest:',
    choices: [
      {
        label: 'College classes & offline AI without Wi-Fi or battery anxiety',
        nextNodeId: 'ecore_after_choice',
        effect: {
          setNeed: 'learning',
          restoreBattery: 15,
          questLabel: 'Head NW to Monk NPU Library [E] & NE to Yellow Arc Archery',
        },
      },
      {
        label: 'Smooth high-FPS gaming with cool thermals & XeSS upscaling',
        nextNodeId: 'ecore_after_choice',
        effect: {
          setNeed: 'gaming',
          restoreBattery: 15,
          questLabel: 'Head NW to NPU Library & NE to Arc XeSS Archery Arena [E]',
        },
      },
      {
        label: 'Coding, editing & zero-lag multitasking across heavy apps',
        nextNodeId: 'ecore_after_choice',
        effect: {
          setNeed: 'multitask',
          restoreBattery: 15,
          questLabel: 'Explore NPU Library (West) & Arc XeSS Arena (East)',
        },
      },
    ],
  },

  ecore_after_choice: {
    id: 'ecore_after_choice',
    speaker: 'E-Core Steward',
    role: 'Silicon City Unlocked',
    portrait: 'ecore_steward',
    avatarIdx: 4,
    factionColor: 'Blue',
    text: 'Onward! Cross Copper Bus Plaza north: visit the Offline Study Monastery on the WEST for NPU Heal Pulse, and the Yellow Arc Archery Arena on the EAST for Frame Surge. Swing your blade with [O] and raise Guard Dash with [Space]!',
  },

  // WEST DISTRICT: NPU MONASTERY & OFFLINE STUDY LIBRARY
  npu_intro: {
    id: 'npu_intro',
    speaker: 'NPU Monk Sentinel',
    role: 'Offline Study Monastery · Intel AI Boost',
    portrait: 'npu_sentinel',
    avatarIdx: 5,
    factionColor: 'Purple',
    text: 'Peace, Byte! Welcome to the NPU Monastery & Offline Study Library. Shoppers wonder what NPU & TOPS mean: CPU is a sprinter, GPU is an artist, and I am the dedicated AI marathon runner!',
    nextId: 'npu_explain',
  },

  npu_explain: {
    id: 'npu_explain',
    speaker: 'NPU Monk Sentinel',
    role: '300+ Optimized AI Apps · Private & Offline',
    portrait: 'npu_sentinel',
    avatarIdx: 5,
    factionColor: 'Purple',
    text: 'I sustain continuous AI across 300+ supported apps right on your device—no cloud fees, total privacy, and tiny wattage so your battery endures past 20+ hours!',
    choices: [
      {
        label: 'Bestow the NPU Heal & Shockwave Pulse! [Unlock P]',
        nextNodeId: 'npu_unlocked',
        effect: {
          unlockNpuPulse: true,
          restoreBattery: 25,
          restoreHp: 30,
        },
      },
      {
        label: 'Explain TOPS in simple real-world terms first',
        nextNodeId: 'npu_tops_answer',
      },
    ],
  },

  npu_tops_answer: {
    id: 'npu_tops_answer',
    speaker: 'NPU Monk Sentinel',
    role: 'TOPS = Trillions of Operations Per Second',
    portrait: 'npu_sentinel',
    avatarIdx: 5,
    factionColor: 'Purple',
    text: 'Higher TOPS means local AI—like summarizing huge college PDFs on a train with zero Wi-Fi—finishes in seconds without freezing your screen. Receive my NPU Pulse!',
    onCompleteEffect: {
      unlockNpuPulse: true,
      restoreBattery: 25,
      restoreHp: 30,
    },
  },

  npu_unlocked: {
    id: 'npu_unlocked',
    speaker: 'Byte (Blue Warrior)',
    role: 'Power Unlocked: [P] NPU Pulse',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'NPU Pulse ready! Pressing [P] channels Monk healing light that shatters enemy lag shields, restores vitality, and frees trapped Gold & Wood tasks!',
  },

  // EAST DISTRICT: ARC XeSS ARCHERY ARENA
  arc_intro: {
    id: 'arc_intro',
    speaker: 'Arc Archer Warden',
    role: 'Arc XeSS Archery Arena',
    portrait: 'arc_warden',
    avatarIdx: 13,
    factionColor: 'Yellow',
    text: 'Eyes sharp, Byte! Cheap laptops choke in battles because they brute-force every pixel until the chip overheats. Inside Intel Core Ultra, XMX AI engines power Intel XeSS!',
    nextId: 'arc_explain',
  },

  arc_explain: {
    id: 'arc_explain',
    speaker: 'Arc Archer Warden',
    role: 'AI-Upscaled 120 FPS Gaming',
    portrait: 'arc_warden',
    avatarIdx: 13,
    factionColor: 'Yellow',
    text: 'XeSS renders smart and uses AI upscaling for razor-sharp, high-FPS gameplay while keeping thermals cool and battery steady!',
    choices: [
      {
        label: 'Fuse XeSS Frame Surge with my Warrior Blade!',
        nextNodeId: 'arc_unlocked',
        effect: {
          unlockXessSurge: true,
          restoreHp: 35,
        },
      },
    ],
  },

  arc_unlocked: {
    id: 'arc_unlocked',
    speaker: 'Arc Archer Warden',
    role: 'XeSS Surge Online',
    portrait: 'arc_warden',
    avatarIdx: 13,
    factionColor: 'Yellow',
    text: 'XeSS Frame Surge equipped! Your sword strikes faster and [P] ignites a 120 FPS aura. With both NPU and Arc powers forged, storm NORTH into the Black Colosseum!',
  },

  // NORTH DISTRICT: BOSS COLOSSEUM
  boss_intro: {
    id: 'boss_intro',
    speaker: 'The Lag Titan (Black Warlord)',
    role: 'Overclocked Colosseum Overlord',
    portrait: 'lag_titan',
    avatarIdx: 21,
    factionColor: 'Black',
    text: 'HAHAHA! Who needs an NPU when buyers get hypnotized by my 70% OFF banners and Black Fortress Towers?! Let us see one Blue Warrior survive my Thermal Throttling!',
    nextId: 'boss_agent_reply',
  },

  boss_agent_reply: {
    id: 'boss_agent_reply',
    speaker: 'Byte (Blue Warrior)',
    role: 'Core Ultra Synced',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'Time to breach that Black Citadel! Guard-dash red floor slams and Archer volleys with [Space], shatter its RGB shield with [P], and strike with [O]!',
    onCompleteEffect: {
      startBossFight: true,
      questLabel: 'Defeat the Black Lag Titan! [O] Slash · [P] NPU/XeSS · [Space] Guard Dash',
    },
  },

  // EXPO PARK ARRIVAL
  expo_welcome: {
    id: 'expo_welcome',
    speaker: 'Byte (Blue Warrior)',
    role: 'Silicon City → Intel AI PC Expo Park',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'VICTORY! Silicon City transformed into the Intel AI PC Expo Park! Watch the 5 faction Champions sparring at their castles and press [E] beside any booth—the Champion wearing the Golden Crown is your Best Match!',
    onCompleteEffect: {
      questLabel: 'Meet sparring AI PC Champions [E] · Open Store Checklist [C]',
    },
  },
};

export const STORE_STATIONS: Record<'A' | 'B' | 'C', StoreStation> = {
  A: {
    id: 'A',
    name: 'Station A · Student & Battery Zone',
    subtitle: 'Thin & light Intel Core Ultra 5 laptops',
    positionLabel: 'Front-Left Demo Table',
  },
  B: {
    id: 'B',
    name: 'Station B · Gaming & XeSS Arena',
    subtitle: 'High-FPS Intel Core Ultra 9 & Arc XeSS rigs',
    positionLabel: 'Center Performance Wall',
  },
  C: {
    id: 'C',
    name: 'Station C · Creator & NPU Studio',
    subtitle: 'Intel Core Ultra 7 multitasking & AI creation stations',
    positionLabel: 'Right Innovation Bay',
  },
};

export function getMatchedExpoPcId(profile: PlayerProfile): string {
  if (profile.primaryNeed === 'gaming' || profile.xessUses > profile.npuUses + 1) {
    return 'pc_apex_frame';
  }
  if (profile.primaryNeed === 'multitask') {
    return 'pc_flowcraft_pro';
  }
  return 'pc_campus_dash';
}

export function computeRecommendation(
  profile: PlayerProfile,
  overridePcId?: string
): RecommendationResult {
  const matchedPcId = overridePcId ?? getMatchedExpoPcId(profile);
  const pc = EXPO_PC_CATALOG.find((p) => p.id === matchedPcId) ?? EXPO_PC_CATALOG[0];

  if (pc.stationId === 'B') {
    return {
      matchedPcId: pc.id,
      tierName: pc.tierName,
      archetypeTitle: pc.persona,
      tagline: pc.tagline,
      matchReason: `Matched from your ${profile.primaryNeed} focus and ${Math.round(profile.batteryRemaining)}% battery endurance after rescuing ${profile.tasksRescued} tasks.`,
      highlights: [
        { label: 'XeSS AI Upscaling', detail: pc.highlights[0] },
        { label: 'Dedicated NPU + Arc GPU', detail: pc.highlights[1] },
        { label: 'Zero Thermal Throttling', detail: pc.highlights[2] },
      ],
      station: STORE_STATIONS.B,
      checklist: [
        {
          id: 'c1',
          title: 'Toggle Intel XeSS On',
          howToTest: 'Launch the demo game at Station B and toggle Intel XeSS on to see instant FPS smoothness.',
        },
        {
          id: 'c2',
          title: 'Alt-Tab Under Load',
          howToTest: 'Switch between game, browser, and local AI assistant—verify zero stutter.',
        },
        {
          id: 'c3',
          title: 'Feel Keyboard Thermals',
          howToTest: 'Notice how cool and quiet the chassis remains compared to bulky budget laptops.',
        },
        {
          id: 'c4',
          title: 'Spot the Core Ultra Badge',
          howToTest: 'Confirm the metallic Intel Core Ultra sticker on the palm rest.',
        },
      ],
    };
  }

  if (pc.stationId === 'C') {
    return {
      matchedPcId: pc.id,
      tierName: pc.tierName,
      archetypeTitle: pc.persona,
      tagline: pc.tagline,
      matchReason: `Matched from your ${profile.primaryNeed} style and ${Math.round(profile.batteryRemaining)}% battery saved across Silicon City.`,
      highlights: [
        { label: 'Hybrid Core Scheduling', detail: pc.highlights[0] },
        { label: '300+ AI-Accelerated Apps', detail: pc.highlights[1] },
        { label: 'Long-Term Performance', detail: pc.highlights[2] },
      ],
      station: STORE_STATIONS.C,
      checklist: [
        {
          id: 'c1',
          title: 'Inspect Task Manager → NPU',
          howToTest: 'Open Task Manager on the Station C demo laptop to see the Intel AI Boost NPU active.',
        },
        {
          id: 'c2',
          title: 'Run an Offline Creative AI Filter',
          howToTest: 'Test local photo/video AI effects with Wi-Fi off—zero cloud wait.',
        },
        {
          id: 'c3',
          title: 'Unplug & Check Battery Estimate',
          howToTest: 'See how hybrid P/E-cores preserve battery during multitasking.',
        },
        {
          id: 'c4',
          title: 'Compare Evo Chassis',
          howToTest: 'Ask the Zone Specialist about Core Ultra 7 thin-and-light vs studio builds.',
        },
      ],
    };
  }

  return {
    matchedPcId: pc.id,
    tierName: pc.tierName,
    archetypeTitle: pc.persona,
    tagline: pc.tagline,
    matchReason: `Matched from your ${profile.primaryNeed} goal and ${Math.round(profile.batteryRemaining)}% battery endurance.`,
    highlights: [
      { label: 'Offline On-Device NPU', detail: pc.highlights[0] },
      { label: '20+ Hour Campus Battery', detail: pc.highlights[1] },
      { label: 'Library-Quiet Thermals', detail: pc.highlights[2] },
    ],
    station: STORE_STATIONS.A,
    checklist: [
      {
        id: 'c1',
        title: 'Test Offline Study AI',
        howToTest: 'Switch Airplane Mode on at Station A and summarize a sample document locally.',
      },
      {
        id: 'c2',
        title: 'Lift & Test Portability',
        howToTest: 'Pick up the Core Ultra 5 laptop—engineered for all-day backpack carry.',
      },
      {
        id: 'c3',
        title: 'Try NPU Studio Effects',
        howToTest: 'Open Camera to test eye-contact & background blur running efficiently on the NPU.',
      },
      {
        id: 'c4',
        title: 'Ask About Student Offers',
        howToTest: 'Show your match at Station A to check store offers on Intel Core Ultra 5 AI PCs.',
      },
    ],
  };
}
