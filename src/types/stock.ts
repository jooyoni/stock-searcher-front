export interface IStock {
  high_price_year: number;
  id: number;
  low_price_year: number;
  name: string;
  pbr: number;
  per: number;
  price: number;
  ticker: string;
  update_date: string;
}

export interface IPortfolio {
  avg_price: number;
  high_price_year: number;
  low_price_year: number;
  name: string;
  pbr: number;
  per: number;
  price: number;
  shares: number;
  ticker: string;
  update_date: string;
}

export interface IPick {
  created_at: string;
  pick_price: number;
  price: number;
  ticker: string;
}
