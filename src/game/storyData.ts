import type {
  CatalogPcCharacter,
  DialogueStep,
  PlayerProfile,
  RecommendationResult,
  StoreStation,
} from './types';

// Compact 28x22 Intel Festival Courtyard coordinates — all 5 pavilions visible within steps of the center Wafer Stage
export const EXPO_PC_CATALOG: CatalogPcCharacter[] = [
  {
    id: 'pc_campus_dash',
    name: 'Campus Dash · Ultra 5',
    tierName: 'Intel Core Ultra 5 AI PC',
    persona: 'The Early-Train Scholar',
    tagline: '20+ hour unplugged battery and silent offline notes so morning classes never wait on a wall plug.',
    wx: 6.8,
    wy: 7.4,
    accentColor: '#00C7FD',
    factionColor: 'Blue',
    avatarIdx: 3,
    accessory: 'grad_cap',
    demoType: 'offline_ai',
    stationId: 'A',
    highlights: [
      'Reads 60-page PDFs & lecture slides on the train with zero Wi-Fi.',
      'Stays cool and whisper-silent at 2 AM while your family sleeps.',
      'Survives lectures, labs, and evening commute past 20 hours.',
    ],
    chatText:
      'Morning, Byte! Remember staring at a 12% battery warning on the early train? Campus Dash on Intel Core Ultra 5 summarizes notes privately offline and lasts all day—so you never hunt for an outlet mid-lecture.',
    demoBurstLabel: 'OFFLINE STUDY AI · 0% CLOUD · 22H BATTERY',
  },
  {
    id: 'pc_flowcraft_pro',
    name: 'FlowCraft Pro · Ultra 7',
    tierName: 'Intel Core Ultra 7 Evo Edition',
    persona: 'The Late-Night Builder',
    tagline: 'Splits heavy coding, slides, music, and 30 browser tabs cleanly without a single freeze.',
    wx: 14.0,
    wy: 6.4,
    accentColor: '#F59E0B',
    factionColor: 'Yellow',
    avatarIdx: 11,
    accessory: 'headphones',
    demoType: 'multitask',
    stationId: 'C',
    highlights: [
      'Juggles Figma, code editors, calls & 30 tabs without choking.',
      'Runs 300+ AI creative & study apps right on the laptop.',
      'Built like metal armor to carry you cleanly from freshman year to graduation.',
    ],
    chatText:
      'You made it to dawn, Byte! FlowCraft Pro on Core Ultra 7 separates heavy builds from background apps automatically—no spinning cursor at 1:47 AM when your deadline is thirteen minutes away.',
    demoBurstLabel: '300+ AI APPS · ZERO STUTTER · GRADUATION READY',
  },
  {
    id: 'pc_apex_frame',
    name: 'Apex Frame · Ultra 9',
    tierName: 'Intel Core Ultra 9 Performance',
    persona: 'The Midnight Squad Ace',
    tagline: 'Intel Arc Graphics + XeSS AI delivers crisp 120 FPS weekends without waking the house.',
    wx: 21.2,
    wy: 7.4,
    accentColor: '#EF4444',
    factionColor: 'Red',
    avatarIdx: 6,
    accessory: 'visor',
    demoType: 'xess_fps',
    stationId: 'B',
    highlights: [
      'XeSS AI turns sharp 120 FPS frames without melting your keyboard.',
      'Keeps squad voice chat crystal clear while the fan stays calm.',
      'Outlasts flashy bargain laptops that slow down after 15 minutes.',
    ],
    chatText:
      'GGs, Byte! After surviving finals week, you deserve Friday night matches that actually stay smooth. Apex Frame on Core Ultra 9 + Arc XeSS locks crisp frames without scorching your palms.',
    demoBurstLabel: 'INTEL ARC + XeSS · COOL 120 FPS',
  },
  {
    id: 'pc_feather_air',
    name: 'FeatherAir · Ultra 5',
    tierName: 'Intel Core Ultra 5 Ultralight',
    persona: 'The Metro Commuter',
    tagline: 'Under 1.2 kg everyday carry with instant wake and natural camera focus for interviews.',
    wx: 7.2,
    wy: 15.1,
    accentColor: '#A855F7',
    factionColor: 'Purple',
    avatarIdx: 16,
    accessory: 'wings',
    demoType: 'battery_air',
    stationId: 'A',
    highlights: [
      'Lighter than two textbooks—leaves the heavy power brick at home.',
      'Wakes the second you open the lid between metro stops.',
      'NPU camera lighting & voice clarity shine during internship calls.',
    ],
    chatText:
      'Glad you are here, Byte! Two buses, a crowded train, and an internship call before noon—FeatherAir stays lighter than a notebook and keeps your camera and voice crisp without draining battery.',
    demoBurstLabel: '1.1KG CARRY · INSTANT WAKE · INTERVIEW READY',
  },
  {
    id: 'pc_canvas_studio',
    name: 'Canvas Studio · Ultra 7',
    tierName: 'Intel Core Ultra 7 Creator',
    persona: 'The Quiet Creator',
    tagline: 'Generate artwork, trim 4K reels, and run private AI tools with zero monthly subscriptions.',
    wx: 20.8,
    wy: 15.5,
    accentColor: '#94A3B8',
    factionColor: 'Black',
    avatarIdx: 21,
    accessory: 'stylus',
    demoType: 'creator_gen',
    stationId: 'C',
    highlights: [
      'Create posters & smart video cuts locally—no paid cloud tokens.',
      'Your drafts, family videos, and client files never leave your SSD.',
      'Arc media engines speed through 4K renders before sunrise.',
    ],
    chatText:
      'Take a breath, Byte—the morning sun is up. Canvas Studio on Core Ultra 7 lets you cut reels and run local AI ideas right on your own laptop, with zero monthly fees and full privacy.',
    demoBurstLabel: 'LOCAL CREATIVE AI · PRIVATE · ZERO FEES',
  },
];

export const STORY_DIALOGUES: Record<string, DialogueStep> = {
  // ACT I — 1:47 AM STUDY COVE (PAWN)
  trap_intro: {
    id: 'trap_intro',
    speaker: '1:47 AM · Study Cove',
    role: 'Act I · Before Sunrise',
    portrait: 'trap_laptop',
    avatarIdx: 7,
    factionColor: 'Red',
    text: '1:47 AM. The house is dark, save for your desk lamp and a cold mug of tea your mom left beside your books. Dad asked proudly if that ₹39,999 festive-sale laptop could carry you through college—now your final project is due at dawn, every tab is freezing, and the fans sound like a jet. Walk north to the Deadline Gate [WASD / Arrows]!',
    onCompleteEffect: {
      questLabel: 'Push north to the Deadline Gate before your battery dies',
    },
  },

  trap_meltdown: {
    id: 'trap_meltdown',
    speaker: 'Byte (Tired Freshman)',
    role: 'Battery 12% · Draft Unsaved',
    portrait: 'pawn_worker',
    avatarIdx: 2,
    factionColor: 'Blue',
    text: 'Everything just locked at 11 FPS. Not because you did not work hard enough—because one cramped bargain lane cannot carry your dreams, your notes, and your whole future at once. Dad saved months for that box, and the shiny sticker never warned either of you.',
    nextId: 'trap_warp',
  },

  trap_warp: {
    id: 'trap_warp',
    speaker: 'Dawn Lantern Beacon',
    role: 'Act II · Across the Quiet Bridge',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'Pick up the Blue Knight blade and cross east into the Harbor of Quiet Hours. A laptop built right honors every late night and every rupee saved. Meet the Harbor Steward [E]—sunrise starts with breathing room.',
    onCompleteEffect: {
      restoreBattery: 100,
      restoreHp: 100,
      questLabel: 'Talk to the Harbor Steward [E] on the Emerald Harbor',
    },
  },

  // ACT II — HARBOR OF QUIET HOURS (BLUE WARRIOR AWAKENING)
  ecore_greeting: {
    id: 'ecore_greeting',
    speaker: 'Harbor Steward',
    role: 'Act II · Harbor of Quiet Hours',
    portrait: 'ecore_steward',
    avatarIdx: 4,
    factionColor: 'Blue',
    text: 'Breathe easy, Byte—welcome to E-Core Harbor. Real strength is quiet: while background apps rest silently on gentle Efficiency Cores so nobody at home wakes up, your main work flies forward and your charger stays in your backpack all day.',
    nextId: 'ecore_need_choice',
  },

  ecore_need_choice: {
    id: 'ecore_need_choice',
    speaker: 'Harbor Steward',
    role: 'What Carries You Through the Semester?',
    portrait: 'ecore_steward',
    avatarIdx: 4,
    factionColor: 'Blue',
    text: 'Before crossing Copper Plaza, tell me which part of life matters most to you right now:',
    choices: [
      {
        label: 'Early morning commutes, classes & quiet offline study without outlet hunting',
        nextNodeId: 'ecore_after_choice',
        effect: {
          setNeed: 'learning',
          restoreBattery: 15,
          questLabel: 'Visit the Library of Unspoken Notes (West) & Dawn Arena (East)',
        },
      },
      {
        label: 'Unwinding Friday nights with friends at smooth FPS without melting your lap',
        nextNodeId: 'ecore_after_choice',
        effect: {
          setNeed: 'gaming',
          restoreBattery: 15,
          questLabel: 'Visit the Library (West) & Dawn Gaming Arena (East)',
        },
      },
      {
        label: 'Juggling late-night projects, design, reels & 30 tabs without a single crash',
        nextNodeId: 'ecore_after_choice',
        effect: {
          setNeed: 'multitask',
          restoreBattery: 15,
          questLabel: 'Explore the West Library & East Horizon Arena',
        },
      },
    ],
  },

  ecore_after_choice: {
    id: 'ecore_after_choice',
    speaker: 'Harbor Steward',
    role: 'Two Wings of the City',
    portrait: 'ecore_steward',
    avatarIdx: 4,
    factionColor: 'Blue',
    text: 'Cross Copper Plaza north! To the WEST waits the Library of Unspoken Notes; to the EAST waits the Dawn Horizon Arena. Rescue the stranded projects along your path with [O] Slash and guard-dash danger with [Space]!',
  },

  // ACT III-A — WEST: LIBRARY OF UNSPOKEN NOTES (NPU MONASTERY)
  npu_intro: {
    id: 'npu_intro',
    speaker: 'Keeper of Quiet Notes',
    role: 'Act III · Library of Unspoken Notes',
    portrait: 'npu_sentinel',
    avatarIdx: 5,
    factionColor: 'Purple',
    text: 'Welcome inside, Byte. People throw scary words like NPU and TOPS around, so let us keep it human: when you are on a noisy evening bus with zero signal, you still need a quiet partner that organizes your notes without draining your battery or charging a monthly fee.',
    nextId: 'npu_explain',
  },

  npu_explain: {
    id: 'npu_explain',
    speaker: 'Keeper of Quiet Notes',
    role: 'Help That Stays Private & Yours',
    portrait: 'npu_sentinel',
    avatarIdx: 5,
    factionColor: 'Purple',
    text: 'Intel AI Boost NPU runs 300+ everyday tools right on your laptop—summaries, clear meeting audio, study prep—completely private on your own drive, sipping a fraction of the power so your battery lives past sunrise.',
    choices: [
      {
        label: 'Accept the NPU Clarity Pulse! [Unlock P]',
        nextNodeId: 'npu_unlocked',
        effect: {
          unlockNpuPulse: true,
          restoreBattery: 25,
          restoreHp: 30,
        },
      },
      {
        label: 'Wait—what does TOPS actually feel like in daily life?',
        nextNodeId: 'npu_tops_answer',
      },
    ],
  },

  npu_tops_answer: {
    id: 'npu_tops_answer',
    speaker: 'Keeper of Quiet Notes',
    role: 'Why Dedicated AI Matters',
    portrait: 'npu_sentinel',
    avatarIdx: 5,
    factionColor: 'Purple',
    text: 'Think of TOPS as quiet endurance: instead of freezing your music or eating battery to summarize a 60-page lab manual offline, it finishes cleanly in seconds while you stay focused. Take my Clarity Pulse!',
    onCompleteEffect: {
      unlockNpuPulse: true,
      restoreBattery: 25,
      restoreHp: 30,
    },
  },

  npu_unlocked: {
    id: 'npu_unlocked',
    speaker: 'Byte (Blue Knight)',
    role: 'Skill Awakened: [P] NPU Clarity Pulse',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'Clarity Pulse feels calm and steady! Pressing [P] heals Byte, shatters false shields, and frees trapped midnight projects.',
  },

  // ACT III-B — EAST: DAWN HORIZON ARENA (ARC XeSS)
  arc_intro: {
    id: 'arc_intro',
    speaker: 'Horizon Captain',
    role: 'Act III · Dawn Horizon Arena',
    portrait: 'arc_warden',
    avatarIdx: 13,
    factionColor: 'Yellow',
    text: 'Good to see you standing tall, Byte! Everybody works hard all week—at midnight, playing a match with friends or editing a short film should feel effortless, not like holding a burning stove on your lap.',
    nextId: 'arc_explain',
  },

  arc_explain: {
    id: 'arc_explain',
    speaker: 'Horizon Captain',
    role: 'Intel Arc + XeSS Horizon Surge',
    portrait: 'arc_warden',
    avatarIdx: 13,
    factionColor: 'Yellow',
    text: 'Intel Arc Graphics with XeSS AI paints crisp high-FPS frames cleanly without brute-force heat—so your hands stay cool, the room stays quiet, and your laptop lasts for years instead of months.',
    choices: [
      {
        label: 'Awaken XeSS Horizon Surge on my blade!',
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
    speaker: 'Horizon Captain',
    role: 'Both Halves United',
    portrait: 'arc_warden',
    avatarIdx: 1,
    factionColor: 'Yellow',
    text: 'Horizon Surge is yours—swings cut faster and [P] ignites at 120 FPS! Both quiet endurance and fearless speed are ready. March NORTH across the causeway and break Burnout forever!',
  },

  // ACT IV — THE BURNOUT CITADEL (BOSS FIGHT)
  boss_intro: {
    id: 'boss_intro',
    speaker: 'The Lag Titan',
    role: 'Act IV · Voice of Burnout & Bargain Regret',
    portrait: 'lag_titan',
    avatarIdx: 21,
    factionColor: 'Black',
    text: 'Still awake at 2:30 AM? Admit it—most buyers never look past my shiny 70% OFF box! Why dream big when you can watch spinning cursors, hot keyboards, and dead batteries for the next four years?',
    nextId: 'boss_agent_reply',
  },

  boss_agent_reply: {
    id: 'boss_agent_reply',
    speaker: 'Byte (Blue Knight)',
    role: 'For Every Late Night & Every Dream',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'My parents worked too hard for me to settle for broken promises—and tomorrow begins at sunrise. Dodge red floor slams with [Space], shatter that hollow RGB shield with [P], and strike back with [O]!',
    onCompleteEffect: {
      startBossFight: true,
      questLabel: 'Defeat the Lag Titan! [O] Slash · [P] Clarity/XeSS · [Space] Guard Dash',
    },
  },

  // ACT V — DAWN IN THE INTEL FESTIVAL COURTYARD
  expo_welcome: {
    id: 'expo_welcome',
    speaker: 'Byte (Blue Knight)',
    role: 'Act V · Dawn Over Intel AI PC Courtyard',
    portrait: 'agent',
    avatarIdx: 1,
    factionColor: 'Blue',
    text: 'Morning light broke through! Look around the Intel Festival Courtyard—all five champions are sparring in celebration, and the one wearing the Golden Crown fits your semester story best. Press [E] beside any champion or Intel booth, and check [C] for your real store checklist!',
    onCompleteEffect: {
      questLabel: 'Meet sparring Champions [E] · Open Store Checklist [C]',
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
      matchReason: `Matched from your ${profile.primaryNeed} focus and ${Math.round(profile.batteryRemaining)}% battery endurance after rescuing ${profile.tasksRescued} late-night projects.`,
      highlights: [
        { label: 'XeSS AI Upscaling', detail: pc.highlights[0] },
        { label: 'Dedicated NPU + Arc GPU', detail: pc.highlights[1] },
        { label: 'Cool Late-Night Thermals', detail: pc.highlights[2] },
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
          howToTest: 'Confirm the metallic Intel Core Ultra badge on the palm rest.',
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
      matchReason: `Matched from your ${profile.primaryNeed} rhythm and ${Math.round(profile.batteryRemaining)}% battery saved across Silicon City.`,
      highlights: [
        { label: 'Hybrid Core Scheduling', detail: pc.highlights[0] },
        { label: '300+ AI-Accelerated Apps', detail: pc.highlights[1] },
        { label: 'Built to Last All Degree', detail: pc.highlights[2] },
      ],
      station: STORE_STATIONS.C,
      checklist: [
        {
          id: 'c1',
          title: 'Inspect Task Manager -> NPU',
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
