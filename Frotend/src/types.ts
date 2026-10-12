export type Page = 'landing' | 'arrendatario' | 'propietario' | 'admin-login' | 'admin-dashboard'
export type NavigateFn = (page: Page) => void

export interface Property {
  id: number
  title: string
  neighborhood: string
  type: string
  area: number
  rooms: number
  bathrooms: number
  parking: number
  estrato: number
  publishedPrice: number
  estimatedPrice: number
  source: string
  imageId: string
  address: string
}
