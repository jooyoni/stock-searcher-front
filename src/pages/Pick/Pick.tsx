import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../../axios/axios';
import Header from '../../components/Header/Header';
import { IPick } from '../../types/stock';
import styles from './Pick.module.scss';
import { useEffect, useState } from 'react';

function Pick() {
  const { data, refetch } = useQuery<IPick[]>({
    queryKey: ['pick'],
    queryFn: () => axiosInstance.get('/api/stock/pick').then((res) => res.data),
  });

  const { mutateAsync: deletePick } = useMutation({
    mutationFn: (ticker: string) => axiosInstance.delete(`/api/stock/pick?ticker=${ticker}`).then((res) => res.data),
  });

  async function handleDeletePick(ticker: string) {
    try {
      await deletePick(ticker);
      refetch();
    } catch (error) {
      alert('에러 발생');
    }
  }

  const [lastViewStock] = useState(sessionStorage.getItem('lastViewStock') || '');

  const [selectedPick, setSelectedPick] = useState<string[]>(JSON.parse(localStorage.getItem('selectedPick') || '[]'));

  useEffect(() => {
    localStorage.setItem('selectedPick', JSON.stringify(selectedPick));
  }, [selectedPick]);
  return (
    <>
      <Header />
      <div className={styles.container}>
        <table className={styles.pickTable}>
          <thead>
            <tr>
              <th></th>
              <th>등록가</th>
              <th>현재가</th>
              <th>PBR</th>
              <th>등락율</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((stock) => (
              <tr
                key={stock.ticker}
                onClick={() => {
                  sessionStorage.setItem('lastViewStock', stock.ticker);
                  window.location.href = `https://invest.deepsearch.com/stock/${stock.ticker}`;
                }}
                className={`${selectedPick.includes(stock.ticker) ? styles.active : ''} ${
                  lastViewStock === stock.ticker ? styles.viewed : ''
                }`}
              >
                <td
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedPick.includes(stock.ticker)) {
                      setSelectedPick(selectedPick.filter((ticker) => ticker !== stock.ticker));
                    } else {
                      setSelectedPick([...selectedPick, stock.ticker]);
                    }
                  }}
                >
                  {stock.ticker}
                </td>
                <td>{stock.pick_price}$</td>
                <td>{stock.price}$</td>
                <td>{stock.pbr}</td>
                <td>{(((stock.price - stock.pick_price) / stock.pick_price) * 100).toFixed(2)}%</td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`${stock.ticker}를 삭제하시겠습니까?`)) {
                        handleDeletePick(stock.ticker);
                      }
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Pick;
