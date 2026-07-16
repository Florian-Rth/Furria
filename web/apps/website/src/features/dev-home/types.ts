export interface DevHomeApp {
  name: string;
  description: string;
  statusLabel: string;
  statusColor: 'warning' | 'default';
}

export interface DevHomeContent {
  title: string;
  badgeLabel: string;
  intro: string;
  apps: DevHomeApp[];
}
