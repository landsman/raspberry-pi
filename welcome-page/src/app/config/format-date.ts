import type { Config } from './config-provider'

export function formatDate(date: Date, config: Config): string {
  return date.toLocaleDateString(config.locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: config.timezone,
  })
}

export function formatTime(date: Date, config: Config): string {
  return date.toLocaleTimeString(config.locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: config.timezone,
  })
}
