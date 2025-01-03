import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../../axios/axios';
import Header from '../../components/Header/Header';
import { IPick } from '../../types/stock';
import styles from './Pick.module.scss';

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
              <th>등락율</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((stock) => (
              <tr key={stock.ticker}>
                <td
                  onClick={() => {
                    if (window.confirm(`${stock.ticker}를 삭제하시겠습니까?`)) {
                      handleDeletePick(stock.ticker);
                    }
                  }}
                >
                  {stock.ticker}
                </td>
                <td>{stock.pick_price}$</td>
                <td>{stock.price}$</td>
                <td>{(((stock.price - stock.pick_price) / stock.pick_price) * 100).toFixed(2)}%</td>
                <td>
                  {(() => {
                    const date = new Date(stock.created_at);
                    return `${date.getFullYear()}.${('0' + (date.getMonth() + 1)).slice(-2)}.${(
                      '0' + date.getDate()
                    ).slice(-2)}`;
                  })()}
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
