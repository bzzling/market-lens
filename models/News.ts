export interface NewsArticle {
  title: string
  source_id: string
  link: string
  pubDate: string
  description: string
  image_url: string | null
}

export interface NewsResponse {
  status: string
  totalResults: number
  results: NewsArticle[]
}