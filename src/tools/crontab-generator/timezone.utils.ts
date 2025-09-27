// Popular IANA timezone identifiers
export const popularTimezones = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  'UTC',
];

// Get all IANA timezones
export function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    // Fallback for older browsers
    return [
      ...popularTimezones,
      'Africa/Cairo',
      'Africa/Johannesburg',
      'America/Argentina/Buenos_Aires',
      'America/Sao_Paulo',
      'America/Mexico_City',
      'America/Toronto',
      'America/Vancouver',
      'Asia/Manila',
      'Asia/Jakarta',
      'Asia/Kuala_Lumpur',
      'Europe/Dublin',
      'Europe/Vienna',
      'Europe/Prague',
      'Europe/Warsaw',
      'Europe/Moscow',
      'Pacific/Honolulu',
    ];
  }
}

// Get timezone display name
export function getTimezoneDisplayName(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'long',
    });
    
    const parts = formatter.formatToParts(new Date());
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';
    
    // Format as "America/New_York (Eastern Standard Time)"
    return `${timezone} (${timeZoneName})`;
  } catch {
    return timezone;
  }
}

// Get timezone options for select component
export function getTimezoneOptions() {
  const allTimezones = getAllTimezones();
  const popularSet = new Set(popularTimezones);
  
  const popularOptions = popularTimezones.map(tz => ({
    label: getTimezoneDisplayName(tz),
    value: tz,
    popular: true,
  }));
  
  const otherOptions = allTimezones
    .filter(tz => !popularSet.has(tz))
    .sort()
    .map(tz => ({
      label: getTimezoneDisplayName(tz),
      value: tz,
      popular: false,
    }));
  
  return [...popularOptions, ...otherOptions];
}

// Format date with timezone
export function formatDateInTimezone(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}