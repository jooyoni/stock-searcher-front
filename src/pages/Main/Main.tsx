import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../../axios/axios';
import { IStock } from '../../types/stock';
import styles from './Main.module.scss';
import Header from '../../components/Header/Header';
import { useEffect, useState } from 'react';

function Main() {
  const { data } = useQuery<IStock[]>({
    queryKey: ['stockList'],
    queryFn: () => axiosInstance.get('/api/stock/list').then((res) => res.data),
    initialData: JSON.parse(localStorage.getItem('cachedStockList') || '[]'),
  });

  function handleStockClick(ticker: string) {
    const storage = [...checkedList];
    if (!storage.includes(ticker)) storage.push(ticker);
    localStorage.setItem('stockList', JSON.stringify(storage));
    localStorage.setItem('cachedStockList', JSON.stringify(data));
    window.location.href = `https://invest.deepsearch.com/stock/${ticker}`;
  }

  function handleCancelAll() {
    if (!window.confirm('전체취소 하시겠습니까?')) return;
    setCheckedList([]);
    localStorage.removeItem('stockList');
  }

  const [checkedList, setCheckedList] = useState<string[]>(JSON.parse(localStorage.getItem('stockList') || '[]'));

  useEffect(() => {
    const handlePageShow = () => {
      setCheckedList(JSON.parse(localStorage.getItem('stockList') || '[]'));
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const { mutateAsync: postPick } = useMutation<null, null, { ticker: string; pick_price: number }>({
    mutationFn: (props) =>
      axiosInstance
        .post('/api/stock/pick', {
          ticker: props.ticker,
          pick_price: props.pick_price,
        })
        .then((res) => res.data),
  });

  async function handlePick(ticker: string, pick_price: number) {
    alert(`${ticker} 관심종목 등록 완료`);
    try {
      await postPick({ ticker, pick_price });
    } catch {
      alert('에러가 발생했습니다.');
    }
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <button className={styles.cancelAllButton} onClick={() => handleCancelAll()}>
          전체취소
        </button>
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
            {data
              ?.sort((a, b) => a.pbr - b.pbr)
              .map((stock) => {
                return (
                  <tr
                    key={stock.id}
                    onClick={() => {
                      handleStockClick(stock.ticker);
                    }}
                    className={checkedList.includes(stock.ticker) ? styles.checked : ''}
                  >
                    <td>
                      <div className={styles.stockInfo}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            let newList = [...checkedList];
                            if (newList.includes(stock.ticker)) {
                              newList = newList.filter((ticker) => ticker !== stock.ticker);
                            } else {
                              newList.push(stock.ticker);
                            }
                            setCheckedList(newList);
                            localStorage.setItem('stockList', JSON.stringify(newList));
                          }}
                        >
                          {stock.ticker}
                        </span>
                      </div>
                    </td>
                    <td>{stock.price}$</td>
                    <td>{stock.low_price_year}$</td>
                    <td>{stock.high_price_year}$</td>
                    <td>{stock.per}</td>
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePick(stock.ticker, stock.price);
                      }}
                    >
                      {stock.pbr}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Main;
