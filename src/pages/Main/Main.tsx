import { useQuery } from 'react-query';
import { axiosInstance } from '../../axios/axios';
import { IStock } from '../../types/stock';
import styles from './Main.module.scss';
import Header from '../../components/Header/Header';
function Main() {
  const { data } = useQuery<IStock[]>({
    queryKey: ['stockList'],
    queryFn: () => axiosInstance.get('/api/stock/list').then((res) => res.data),
  });
  return (
    <>
      <Header />
      <div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>PRICE</th>
              <th>LOW</th>
              <th>HIGH</th>
              <th>PER</th>
              <th>PBR</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((stock) => (
              <tr key={stock.id}>
                <td>
                  <div className={styles.stockInfo}>
                    <span>{stock.ticker}</span>
                  </div>
                </td>
                <td>{stock.price}$</td>
                <td>{stock.low_price_year}$</td>
                <td>{stock.high_price_year}$</td>
                <td>{stock.per}</td>
                <td>{stock.pbr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Main;
