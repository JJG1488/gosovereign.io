export interface PortfolioItem {
  id: string;
  name: string;
  description: string;
  images: string[];
}

// This file is auto-generated from your store configuration
export const portfolio: PortfolioItem[] = {{PORTFOLIO_JSON}};

export function getPortfolioItem(id: string): PortfolioItem | undefined {
  return portfolio.find((p) => p.id === id);
}
