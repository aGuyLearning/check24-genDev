export interface StreamingPackageCoverage {
  coverage: TournamentCoverage[];
  package_id: number;
  package_name: string;
}
export interface TournamentCoverage {
  coverage_percentage: number;
  tournament_name: string;
  covered_games: number;
  total_games: number;
  highlighted_games: number;
}

export interface Game {
  id: number;
  starts_at: string;
  tournament_name: string;
  team_home: string;
  team_away: string;
}

export interface StreamingPackageTimeFrame {
  start_time: string;
  end_time: string;
  games: number[];
}

export interface StreamingPackages {
    [key: string]: StreamingPackageInfo;
}

export interface StreamingPackageCompetitionCoverage {
    'covered_games': number[];
    'uncovered_games': number[];
}

export interface StreamingPackageInfo {
  monthly_price_cents: number;
  monthly_price_yearly_subscription_in_cents: number;
  covered_games: number[];
  has_monthly_price: boolean;
  competition_coverage: {[key: string]: StreamingPackageCompetitionCoverage};
}

export interface StreamingPackageSelection {[key: string]: StreamingPackageTimeFrame[];}

export interface StreamingPackageOverview {
  packages: {[key: string]: StreamingPackageInfo};
  competition_to_games: any;
  selected_packages: {[key: string]: SelectedStreamingPackageInfo[]};
  total_cost: number;
  uncovered_games: number[];
}

export interface SelectedStreamingPackageInfo {
  start_time: string;
  end_time: string;
  games: number[];
}

export interface GameInfo {
  game_id: number;
  starts_at: string;
  tournament_name: string;
  team_home: string;
  team_away: string;
}

export interface IcalEvent {
  start: Date;
  end?: Date;
  title: string;
  description?: string;
  location?: string;
  url?: string;
}