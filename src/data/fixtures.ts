export interface Fixture {
  id: string
  opponent: string
  home: boolean
  date: string
}

// Points as of 13 March 2026 (GW28 complete, GW29 starts 14 March)
export const ARSENAL_CURRENT_POINTS = 64
export const CITY_CURRENT_POINTS = 57

// Arsenal remaining fixtures — 9 games from GW29 to GW38
export const ARSENAL_REMAINING: Fixture[] = [
  { id: 'ars-1', opponent: 'Everton',       home: true,  date: '14 Mar' },
  { id: 'ars-2', opponent: 'Wolves',         home: false, date: '21 Mar' },
  { id: 'ars-3', opponent: 'Bournemouth',    home: true,  date: '11 Apr' },
  { id: 'ars-4', opponent: 'Man City',       home: false, date: '19 Apr' },
  { id: 'ars-5', opponent: 'Newcastle',      home: true,  date: '25 Apr' },
  { id: 'ars-6', opponent: 'Fulham',         home: true,  date: '2 May'  },
  { id: 'ars-7', opponent: 'West Ham',       home: false, date: '9 May'  },
  { id: 'ars-8', opponent: 'Burnley',        home: true,  date: '17 May' },
  { id: 'ars-9', opponent: 'Crystal Palace', home: false, date: '24 May' },
]

// Man City remaining fixtures — 9 games from GW29 to GW38
export const CITY_REMAINING: Fixture[] = [
  { id: 'mci-1', opponent: 'West Ham',       home: false, date: '14 Mar' },
  { id: 'mci-2', opponent: 'Crystal Palace', home: true,  date: '21 Mar' },
  { id: 'mci-3', opponent: 'Chelsea',        home: false, date: '12 Apr' },
  { id: 'mci-4', opponent: 'Arsenal',        home: true,  date: '19 Apr' },
  { id: 'mci-5', opponent: 'Burnley',        home: false, date: '26 Apr' },
  { id: 'mci-6', opponent: 'Everton',        home: false, date: '2 May'  },
  { id: 'mci-7', opponent: 'Brentford',      home: true,  date: '9 May'  },
  { id: 'mci-8', opponent: 'Bournemouth',    home: false, date: '17 May' },
  { id: 'mci-9', opponent: 'Aston Villa',    home: true,  date: '24 May' },
]
