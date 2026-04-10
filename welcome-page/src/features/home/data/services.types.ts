import { ServiceIconName } from './service.icon.ts'

export interface HomeService {
  name: string
  url: string
  icon?: ServiceIconName
  shortcut?: string
}

export interface HomeCategory {
  label: string
  services: HomeService[]
}
