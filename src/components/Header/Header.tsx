import { useQuery } from 'react-query';
import styles from './Header.module.scss';
import { IPortfolio } from '../../types/stock';
import { axiosInstance } from '../../axios/axios';
import { Link } from 'react-router-dom';

function Header() {
  const { data } = useQuery<IPortfolio[]>({
    queryKey: ['portfolio'],
    queryFn: () => axiosInstance.get('/api/stock/portfolio').then((res) => res.data),
  });

  const { data: exchangeRate } = useQuery<{ exchange_rate: number }>({
    queryKey: ['exchange-rate'],
    queryFn: () => axiosInstance.get('/api/exchange-rate').then((res) => res.data),
  });
  return (
    <header className={styles.header}>
      <span>
        {(() => {
          if (!data) return null;
          let totalInvestment = 0;
          let totalMarketValue = 0;
          for (const stock of data) {
            totalInvestment += stock.avg_price * stock.shares;
            totalMarketValue += stock.price * stock.shares;
          }
          const totalProfit = totalMarketValue - totalInvestment;
          return (
            <span>
              {totalProfit >= 0 ? '+' : null}
              {Number((totalProfit * (exchangeRate?.exchange_rate || 0)).toFixed(0)).toLocaleString()}원
            </span>
          );
        })()}
      </span>
      <ul>
        <li>
          <Link to='/'>홈</Link>
        </li>
        <li>
          <Link to='/pick'>찜</Link>
        </li>
        <li>
          <Link to='/realized-profit'>실현손익</Link>
        </li>
        <li>
          <Link to='/portfolio'>포폴</Link>
        </li>
      </ul>
    </header>
  );
}

export default Header;
