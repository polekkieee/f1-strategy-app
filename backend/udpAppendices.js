// F1 25 UDP Data Constants and Lookup Tables
// Based on the official F1 25 UDP specification

const F1_25_CONSTANTS = {
  // Packet IDs
  PACKET_IDS: {
    MOTION: 0,
    SESSION: 1,
    LAP_DATA: 2,
    EVENT: 3,
    PARTICIPANTS: 4,
    CAR_SETUPS: 5,
    CAR_TELEMETRY: 6,
    CAR_STATUS: 7,
    FINAL_CLASSIFICATION: 8,
    LOBBY_INFO: 9,
    CAR_DAMAGE: 10,
    SESSION_HISTORY: 11,
    TYRE_SETS: 12,
    MOTION_EX: 13,
    TIME_TRIAL: 14,
    LAP_POSITIONS: 15
  },

  // Team IDs lookup
  TEAMS: {
    0: 'Mercedes',
    1: 'Ferrari',
    2: 'Red Bull Racing',
    3: 'Williams',
    4: 'Aston Martin',
    5: 'Alpine',
    6: 'RB',
    7: 'Haas',
    8: 'McLaren',
    9: 'Sauber',
    41: 'F1 Generic',
    104: 'F1 Custom Team',
    129: 'Konnersport',
    142: 'APXGP \'24',
    154: 'APXGP \'25',
    155: 'Konnersport \'24',
    158: 'Art GP \'24',
    159: 'Campos \'24',
    160: 'Rodin Motorsport \'24',
    161: 'AIX Racing \'24',
    162: 'DAMS \'24',
    163: 'Hitech \'24',
    164: 'MP Motorsport \'24',
    165: 'Prema \'24',
    166: 'Trident \'24',
    167: 'Van Amersfoort Racing \'24',
    168: 'Invicta \'24',
    185: 'Mercedes \'24',
    186: 'Ferrari \'24',
    187: 'Red Bull Racing \'24',
    188: 'Williams \'24',
    189: 'Aston Martin \'24',
    190: 'Alpine \'24',
    191: 'RB \'24',
    192: 'Haas \'24',
    193: 'McLaren \'24',
    194: 'Sauber \'24'
  },

  // Driver IDs lookup
  DRIVERS: {
    0: 'Carlos Sainz',
    2: 'Daniel Ricciardo',
    3: 'Fernando Alonso',
    4: 'Felipe Massa',
    7: 'Lewis Hamilton',
    9: 'Max Verstappen',
    10: 'Nico Hülkenburg',
    11: 'Kevin Magnussen',
    14: 'Sergio Pérez',
    15: 'Valtteri Bottas',
    17: 'Esteban Ocon',
    19: 'Lance Stroll',
    20: 'Arron Barnes',
    21: 'Martin Giles',
    22: 'Alex Murray',
    23: 'Lucas Roth',
    24: 'Igor Correia',
    25: 'Sophie Levasseur',
    26: 'Jonas Schiffer',
    27: 'Alain Forest',
    28: 'Jay Letourneau',
    29: 'Esto Saari',
    30: 'Yasar Atiyeh',
    31: 'Callisto Calabresi',
    32: 'Naota Izumi',
    33: 'Howard Clarke',
    34: 'Lars Kaufmann',
    35: 'Marie Laursen',
    36: 'Flavio Nieves',
    38: 'Klimek Michalski',
    39: 'Santiago Moreno',
    40: 'Benjamin Coppens',
    41: 'Noah Visser',
    50: 'George Russell',
    54: 'Lando Norris',
    58: 'Charles Leclerc',
    59: 'Pierre Gasly',
    62: 'Alexander Albon',
    70: 'Rashid Nair',
    71: 'Jack Tremblay',
    77: 'Ayrton Senna',
    80: 'Guanyu Zhou',
    83: 'Juan Manuel Correa',
    90: 'Michael Schumacher',
    94: 'Yuki Tsunoda',
    102: 'Aidan Jackson',
    109: 'Jenson Button',
    110: 'David Coulthard',
    112: 'Oscar Piastri',
    113: 'Liam Lawson',
    116: 'Richard Verschoor',
    123: 'Enzo Fittipaldi',
    125: 'Mark Webber',
    126: 'Jacques Villeneuve',
    127: 'Callie Mayer',
    132: 'Logan Sargeant',
    136: 'Jack Doohan',
    137: 'Amaury Cordeel',
    138: 'Dennis Hauger',
    145: 'Zane Maloney',
    146: 'Victor Martins',
    147: 'Oliver Bearman',
    148: 'Jak Crawford',
    149: 'Isack Hadjar',
    152: 'Roman Stanek',
    153: 'Kush Maini',
    156: 'Brendon Leigh',
    157: 'David Tonizza',
    158: 'Jarno Opmeer',
    159: 'Lucas Blakeley',
    160: 'Paul Aron',
    161: 'Gabriel Bortoleto',
    162: 'Franco Colapinto',
    163: 'Taylor Barnard',
    164: 'Joshua Dürksen',
    165: 'Andrea-Kimi Antonelli',
    166: 'Ritomo Miyata',
    167: 'Rafael Villagómez',
    168: 'Zak O\'Sullivan',
    169: 'Pepe Marti',
    170: 'Sonny Hayes',
    171: 'Joshua Pearce',
    172: 'Callum Voisin',
    173: 'Matias Zagazeta',
    174: 'Nikola Tsolov',
    175: 'Tim Tramnitz',
    185: 'Luca Cortez'
  },

  // Track IDs lookup
  TRACKS: {
    0: 'Melbourne',
    2: 'Shanghai',
    3: 'Sakhir (Bahrain)',
    4: 'Catalunya',
    5: 'Monaco',
    6: 'Montreal',
    7: 'Silverstone',
    9: 'Hungaroring',
    10: 'Spa',
    11: 'Monza',
    12: 'Singapore',
    13: 'Suzuka',
    14: 'Abu Dhabi',
    15: 'Texas',
    16: 'Brazil',
    17: 'Austria',
    19: 'Mexico',
    20: 'Baku (Azerbaijan)',
    26: 'Zandvoort',
    27: 'Imola',
    29: 'Jeddah',
    30: 'Miami',
    31: 'Las Vegas',
    32: 'Losail',
    39: 'Silverstone (Reverse)',
    40: 'Austria (Reverse)',
    41: 'Zandvoort (Reverse)'
  },

  // Nationality IDs lookup
  NATIONALITIES: {
    1: 'American',
    2: 'Argentinean',
    3: 'Australian',
    4: 'Austrian',
    5: 'Azerbaijani',
    6: 'Bahraini',
    7: 'Belgian',
    8: 'Bolivian',
    9: 'Brazilian',
    10: 'British',
    11: 'Bulgarian',
    12: 'Cameroonian',
    13: 'Canadian',
    14: 'Chilean',
    15: 'Chinese',
    16: 'Colombian',
    17: 'Costa Rican',
    18: 'Croatian',
    19: 'Cypriot',
    20: 'Czech',
    21: 'Danish',
    22: 'Dutch',
    23: 'Ecuadorian',
    24: 'English',
    25: 'Emirian',
    26: 'Estonian',
    27: 'Finnish',
    28: 'French',
    29: 'German',
    30: 'Ghanaian',
    31: 'Greek',
    32: 'Guatemalan',
    33: 'Honduran',
    34: 'Hong Konger',
    35: 'Hungarian',
    36: 'Icelander',
    37: 'Indian',
    38: 'Indonesian',
    39: 'Irish',
    40: 'Israeli',
    41: 'Italian',
    42: 'Jamaican',
    43: 'Japanese',
    44: 'Jordanian',
    45: 'Kuwaiti',
    46: 'Latvian',
    47: 'Lebanese',
    48: 'Lithuanian',
    49: 'Luxembourger',
    50: 'Malaysian',
    51: 'Maltese',
    52: 'Mexican',
    53: 'Monegasque',
    54: 'New Zealander',
    55: 'Nicaraguan',
    56: 'Northern Irish',
    57: 'Norwegian',
    58: 'Omani',
    59: 'Pakistani',
    60: 'Panamanian',
    61: 'Paraguayan',
    62: 'Peruvian',
    63: 'Polish',
    64: 'Portuguese',
    65: 'Qatari',
    66: 'Romanian',
    68: 'Salvadoran',
    69: 'Saudi',
    70: 'Scottish',
    71: 'Serbian',
    72: 'Singaporean',
    73: 'Slovakian',
    74: 'Slovenian',
    75: 'South Korean',
    76: 'South African',
    77: 'Spanish',
    78: 'Swedish',
    79: 'Swiss',
    80: 'Thai',
    81: 'Turkish',
    82: 'Uruguayan',
    83: 'Ukrainian',
    84: 'Venezuelan',
    85: 'Barbadian',
    86: 'Welsh',
    87: 'Vietnamese',
    88: 'Algerian',
    89: 'Bosnian',
    90: 'Filipino'
  },

  // Game Mode IDs lookup
  GAME_MODES: {
    4: 'Grand Prix \'23',
    5: 'Time Trial',
    6: 'Splitscreen',
    7: 'Online Custom',
    15: 'Online Weekly Event',
    17: 'Story Mode (Braking Point)',
    27: 'My Team Career \'25',
    28: 'Driver Career \'25',
    29: 'Career \'25 Online',
    30: 'Challenge Career \'25',
    75: 'Story Mode (APXGP)',
    127: 'Benchmark'
  },

  // Session types lookup
  SESSION_TYPES: {
    0: 'Unknown',
    1: 'Practice 1',
    2: 'Practice 2',
    3: 'Practice 3',
    4: 'Short Practice',
    5: 'Qualifying 1',
    6: 'Qualifying 2',
    7: 'Qualifying 3',
    8: 'Short Qualifying',
    9: 'One-Shot Qualifying',
    10: 'Sprint Shootout 1',
    11: 'Sprint Shootout 2',
    12: 'Sprint Shootout 3',
    13: 'Short Sprint Shootout',
    14: 'One-Shot Sprint Shootout',
    15: 'Race',
    16: 'Race 2',
    17: 'Race 3',
    18: 'Time Trial'
  },

  // Ruleset IDs lookup
  RULESETS: {
    0: 'Practice & Qualifying',
    1: 'Race',
    2: 'Time Trial',
    12: 'Elimination'
  },

  // Surface types lookup
  SURFACE_TYPES: {
    0: 'Tarmac',
    1: 'Rumble strip',
    2: 'Concrete',
    3: 'Rock',
    4: 'Gravel',
    5: 'Mud',
    6: 'Sand',
    7: 'Grass',
    8: 'Water',
    9: 'Cobblestone',
    10: 'Metal',
    11: 'Ridged'
  },

  // Button flags (for bitwise operations)
  BUTTON_FLAGS: {
    CROSS_A: 0x00000001,
    TRIANGLE_Y: 0x00000002,
    CIRCLE_B: 0x00000004,
    SQUARE_X: 0x00000008,
    DPAD_LEFT: 0x00000010,
    DPAD_RIGHT: 0x00000020,
    DPAD_UP: 0x00000040,
    DPAD_DOWN: 0x00000080,
    OPTIONS_MENU: 0x00000100,
    L1_LB: 0x00000200,
    R1_RB: 0x00000400,
    L2_LT: 0x00000800,
    R2_RT: 0x00001000,
    LEFT_STICK_CLICK: 0x00002000,
    RIGHT_STICK_CLICK: 0x00004000,
    RIGHT_STICK_LEFT: 0x00008000,
    RIGHT_STICK_RIGHT: 0x00010000,
    RIGHT_STICK_UP: 0x00020000,
    RIGHT_STICK_DOWN: 0x00040000,
    SPECIAL: 0x00080000,
    UDP_ACTION_1: 0x00100000,
    UDP_ACTION_2: 0x00200000,
    UDP_ACTION_3: 0x00400000,
    UDP_ACTION_4: 0x00800000,
    UDP_ACTION_5: 0x01000000,
    UDP_ACTION_6: 0x02000000,
    UDP_ACTION_7: 0x04000000,
    UDP_ACTION_8: 0x08000000,
    UDP_ACTION_9: 0x10000000,
    UDP_ACTION_10: 0x20000000,
    UDP_ACTION_11: 0x40000000,
    UDP_ACTION_12: 0x80000000
  },

  // Penalty types lookup
  PENALTY_TYPES: {
    0: 'Drive through',
    1: 'Stop Go',
    2: 'Grid penalty',
    3: 'Penalty reminder',
    4: 'Time penalty',
    5: 'Warning',
    6: 'Disqualified',
    7: 'Removed from formation lap',
    8: 'Parked too long timer',
    9: 'Tyre regulations',
    10: 'This lap invalidated',
    11: 'This and next lap invalidated',
    12: 'This lap invalidated without reason',
    13: 'This and next lap invalidated without reason',
    14: 'This and previous lap invalidated',
    15: 'This and previous lap invalidated without reason',
    16: 'Retired',
    17: 'Black flag timer'
  },

  // Infringement types lookup
  INFRINGEMENT_TYPES: {
    0: 'Blocking by slow driving',
    1: 'Blocking by wrong way driving',
    2: 'Reversing off the start line',
    3: 'Big Collision',
    4: 'Small Collision',
    5: 'Collision failed to hand back position single',
    6: 'Collision failed to hand back position multiple',
    7: 'Corner cutting gained time',
    8: 'Corner cutting overtake single',
    9: 'Corner cutting overtake multiple',
    10: 'Crossed pit exit lane',
    11: 'Ignoring blue flags',
    12: 'Ignoring yellow flags',
    13: 'Ignoring drive through',
    14: 'Too many drive throughs',
    15: 'Drive through reminder serve within n laps',
    16: 'Drive through reminder serve this lap',
    17: 'Pit lane speeding',
    18: 'Parked for too long',
    19: 'Ignoring tyre regulations',
    20: 'Too many penalties',
    21: 'Multiple warnings',
    22: 'Approaching disqualification',
    23: 'Tyre regulations select single',
    24: 'Tyre regulations select multiple',
    25: 'Lap invalidated corner cutting',
    26: 'Lap invalidated running wide',
    27: 'Corner cutting ran wide gained time minor',
    28: 'Corner cutting ran wide gained time significant',
    29: 'Corner cutting ran wide gained time extreme',
    30: 'Lap invalidated wall riding',
    31: 'Lap invalidated flashback used',
    32: 'Lap invalidated reset to track',
    33: 'Blocking the pitlane',
    34: 'Jump start',
    35: 'Safety car to car collision',
    36: 'Safety car illegal overtake',
    37: 'Safety car exceeding allowed pace',
    38: 'Virtual safety car exceeding allowed pace',
    39: 'Formation lap below allowed speed',
    40: 'Formation lap parking',
    41: 'Retired mechanical failure',
    42: 'Retired terminally damaged',
    43: 'Safety car falling too far back',
    44: 'Black flag timer',
    45: 'Unserved stop go penalty',
    46: 'Unserved drive through penalty',
    47: 'Engine component change',
    48: 'Gearbox change',
    49: 'Parc Fermé change',
    50: 'League grid penalty',
    51: 'Retry penalty',
    52: 'Illegal time gain',
    53: 'Mandatory pitstop',
    54: 'Attribute assigned'
  },

  // Event String Codes
  EVENT_CODES: {
    'SSTA': 'Session Started',
    'SEND': 'Session Ended',
    'FTLP': 'Fastest Lap',
    'RTMT': 'Retirement',
    'DRSE': 'DRS enabled',
    'DRSD': 'DRS disabled',
    'TMPT': 'Team mate in pits',
    'CHQF': 'Chequered flag',
    'RCWN': 'Race Winner',
    'PENA': 'Penalty Issued',
    'SPTP': 'Speed Trap Triggered',
    'STLG': 'Start lights',
    'LGOT': 'Lights out',
    'DTSV': 'Drive through served',
    'SGSV': 'Stop go served',
    'FLBK': 'Flashback',
    'BUTN': 'Button status',
    'RDFL': 'Red Flag',
    'OVTK': 'Overtake',
    'SCAR': 'Safety Car',
    'COLL': 'Collision'
  },

  // Wheel array indices
  WHEEL_INDICES: {
    REAR_LEFT: 0,
    REAR_RIGHT: 1,
    FRONT_LEFT: 2,
    FRONT_RIGHT: 3
  },

  // Tyre compounds
  TYRE_COMPOUNDS: {
    ACTUAL: {
      7: 'Inter',
      8: 'Wet',
      9: 'Dry (Classic)',
      10: 'Wet (Classic)',
      11: 'Super Soft (F2)',
      12: 'Soft (F2)',
      13: 'Medium (F2)',
      14: 'Hard (F2)',
      15: 'Wet (F2)',
      16: 'C5',
      17: 'C4',
      18: 'C3',
      19: 'C2',
      20: 'C1',
      21: 'C0',
      22: 'C6'
    },
    VISUAL: {
      7: 'Inter',
      8: 'Wet',
      15: 'Wet (F2)',
      16: 'Soft',
      17: 'Medium',
      18: 'Hard',
      19: 'Super Soft (F2)',
      20: 'Soft (F2)',
      21: 'Medium (F2)',
      22: 'Hard (F2)'
    }
  },

  // Weather types
  WEATHER: {
    0: 'Clear',
    1: 'Light Cloud',
    2: 'Overcast',
    3: 'Light Rain',
    4: 'Heavy Rain',
    5: 'Storm'
  },

  // Safety car status
  SAFETY_CAR_STATUS: {
    0: 'No Safety Car',
    1: 'Full Safety Car',
    2: 'Virtual Safety Car',
    3: 'Formation Lap Safety Car'
  },

  // Result status
  RESULT_STATUS: {
    0: 'Invalid',
    1: 'Inactive',
    2: 'Active',
    3: 'Finished',
    4: 'Did Not Finish',
    5: 'Disqualified',
    6: 'Not Classified',
    7: 'Retired'
  },

  // Platform IDs
  PLATFORMS: {
    1: 'Steam',
    3: 'PlayStation',
    4: 'Xbox',
    6: 'Origin',
    255: 'Unknown'
  }
};

// Helper functions for using the constants
const F1_25_HELPERS = {
  // Get packet type name from ID
  getPacketName: (packetId) => {
    const entry = Object.entries(F1_25_CONSTANTS.PACKET_IDS)
      .find(([_, id]) => id === packetId);
    return entry ? entry[0] : 'UNKNOWN';
  },

  // Get team name from ID
  getTeamName: (teamId) => {
    return F1_25_CONSTANTS.TEAMS[teamId] || 'Unknown Team';
  },

  // Get driver name from ID
  getDriverName: (driverId) => {
    return F1_25_CONSTANTS.DRIVERS[driverId] || 'Unknown Driver';
  },

  // Get track name from ID
  getTrackName: (trackId) => {
    return F1_25_CONSTANTS.TRACKS[trackId] || 'Unknown Track';
  },

  // Get nationality from ID
  getNationality: (nationalityId) => {
    return F1_25_CONSTANTS.NATIONALITIES[nationalityId] || 'Unknown';
  },

  // Check if a button is pressed
  isButtonPressed: (buttonStatus, buttonFlag) => {
    return (buttonStatus & buttonFlag) !== 0;
  },

  // Get all pressed buttons
  getPressedButtons: (buttonStatus) => {
    const pressed = [];
    for (const [name, flag] of Object.entries(F1_25_CONSTANTS.BUTTON_FLAGS)) {
      if ((buttonStatus & flag) !== 0) {
        pressed.push(name);
      }
    }
    return pressed;
  },

  // Get event description from code
  getEventDescription: (eventCode) => {
    // eventCode is a 4-byte array, convert to string
    const codeStr = String.fromCharCode(...eventCode).replace(/\0/g, '');
    return F1_25_CONSTANTS.EVENT_CODES[codeStr] || 'Unknown Event';
  },

  // Get surface type name
  getSurfaceType: (surfaceId) => {
    return F1_25_CONSTANTS.SURFACE_TYPES[surfaceId] || 'Unknown Surface';
  },

  // Get weather description
  getWeatherDescription: (weatherId) => {
    return F1_25_CONSTANTS.WEATHER[weatherId] || 'Unknown Weather';
  },

  // Get session type name
  getSessionTypeName: (sessionTypeId) => {
    return F1_25_CONSTANTS.SESSION_TYPES[sessionTypeId] || 'Unknown Session';
  },

  // Get penalty type name
  getPenaltyType: (penaltyId) => {
    return F1_25_CONSTANTS.PENALTY_TYPES[penaltyId] || 'Unknown Penalty';
  },

  // Get infringement type name
  getInfringementType: (infringementId) => {
    return F1_25_CONSTANTS.INFRINGEMENT_TYPES[infringementId] || 'Unknown Infringement';
  },

  // Convert normalized vector to float
  normalizedToFloat: (value) => {
    return value / 32767.0;
  },

  // Get wheel name from index
  getWheelName: (index) => {
    const wheels = ['Rear Left', 'Rear Right', 'Front Left', 'Front Right'];
    return wheels[index] || 'Unknown Wheel';
  },

  // Get safety car status name
  getTrackStatus: (statusId) => {
    return F1_25_CONSTANTS.SAFETY_CAR_STATUS[statusId] || 'Unknown Status';
  },

  // Get result status name
  getResultStatus: (statusId) => {
    return F1_25_CONSTANTS.RESULT_STATUS[statusId] || 'Unknown Status';
  },

  // Get tyre compound name
  getTyreCompound: (compoundId, isVisual = false) => {
    const compounds = isVisual ? 
      F1_25_CONSTANTS.TYRE_COMPOUNDS.VISUAL : 
      F1_25_CONSTANTS.TYRE_COMPOUNDS.ACTUAL;
    return compounds[compoundId] || `Unknown Compound (${compoundId})`;
  }
};

// Export for use in Node.js
module.exports = {
    F1_25_CONSTANTS,
    F1_25_HELPERS
};