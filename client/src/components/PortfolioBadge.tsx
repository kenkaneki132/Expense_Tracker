import "./portfolio-badge.css";

// Link back to the portfolio. Change PORTFOLIO_URL if the portfolio moves.
export const PORTFOLIO_URL = "https://kenkaneki132.github.io/";

export default function PortfolioBadge() {
  return (
    <a className="sm-badge" href={PORTFOLIO_URL} title="See more projects by Sreevatsav Mourila">
      <svg className="sm-badge-mark" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="sm-badge-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#sm-badge-g)" />
        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="26" fontWeight="700" fill="#06121a">SM</text>
      </svg>
      <span>Sreevatsav Mourila · Portfolio</span>
      <span className="sm-badge-arrow" aria-hidden="true">→</span>
    </a>
  );
}
