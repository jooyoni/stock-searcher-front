import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../../axios/axios';
import Header from '../../components/Header/Header';
import styles from './RealizedProfit.module.scss';
import { IMonthTargetPrice, IPortfolio, IRealizedProfit } from '../../types/stock';
import { useEffect, useState } from 'react';
import ModalPortal from '../../components/ModalPortal/ModalPortal';
import ModalContainer from '../../components/ModalContainer/ModalContainer';

function RealizedProfit() {
  const { data, refetch } = useQuery<IRealizedProfit[]>({
    queryKey: ['realized-profit'],
    queryFn: () => axiosInstance.get('/api/realized-profit-loss').then((res) => res.data),
  });

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [updateProfit, setUpdateProfit] = useState<IRealizedProfit | null>(null);

  const { mutateAsync: deleteProfit } = useMutation((id: number) =>
    axiosInstance.delete(`/api/realized-profit-loss`, { data: { id } }).then((res) => res.data)
  );

  async function handleDelete(id: number) {
    try {
      await deleteProfit(id);
      refetch();
      alert('삭제 완료');
    } catch {
      alert('삭제 실패');
    }
  }

  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  const [monthData, setMonthData] = useState<
    {
      year: number;
      month: number;
      price: number;
    }[]
  >([]);

  useEffect(() => {
    if (!data) return;
    const newMonthData: {
      year: number;
      month: number;
      price: number;
    }[] = [];
    data?.forEach((item) => {
      const date = new Date(item.created_at);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const lastData = newMonthData[newMonthData.length - 1];
      if (lastData && lastData.year === year && lastData.month === month) {
        lastData.price += item.sell_price;
      } else {
        newMonthData.push({ year, month, price: item.sell_price });
      }
    });
    setMonthData(newMonthData);
  }, [data]);

  const { data: monthTargetPrice, refetch: refetchMonthTargetPrice } = useQuery<IMonthTargetPrice>({
    queryKey: ['month-target-price'],
    queryFn: () => axiosInstance.get('/api/target-price').then((res) => res.data),
  });

  const { data: portfolio } = useQuery<IPortfolio[]>({
    queryKey: ['portfolio'],
    queryFn: () => axiosInstance.get('/api/stock/portfolio').then((res) => res.data),
  });

  const { data: exchangeRate } = useQuery<{ exchange_rate: number }>({
    queryKey: ['exchange-rate'],
    queryFn: () => axiosInstance.get('/api/exchange-rate').then((res) => res.data),
  });

  const [updateTargetPriceModalOpen, setUpdateTargetPriceModalOpen] = useState(false);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.totalProfit}>
          <span>총 실현손익</span>
          <span>
            {(() => {
              const totalPrice = data ? data.reduce((acc, item) => acc + item.sell_price, 0) : 0;
              return (totalPrice >= 0 ? '+' : '') + totalPrice?.toLocaleString();
            })()}
            원
          </span>
        </div>
        {(() => {
          if (!portfolio || !exchangeRate) return null;
          return (
            <div className={styles.monthProfit}>
              <span>이번 달 목표 수익</span>
              <span>{monthTargetPrice?.target_price.toLocaleString()}원</span>
              <span>
                (
                {(() => {
                  const thisMonth = monthData.find(
                    (item) => item.year === new Date().getFullYear() && item.month === new Date().getMonth() + 1
                  );
                  const thisMonthPrice = thisMonth?.price || 0;

                  let totalInvestment = 0;
                  let totalMarketValue = 0;
                  for (const stock of portfolio) {
                    totalInvestment += stock.avg_price * stock.shares;
                    totalMarketValue += stock.price * stock.shares;
                  }
                  const totalProfit = totalMarketValue - totalInvestment;

                  return Math.floor(
                    thisMonthPrice +
                      totalProfit * (exchangeRate.exchange_rate || 0) -
                      (monthTargetPrice?.target_price || 0)
                  ).toLocaleString();
                })()}
                원)
              </span>
              <button onClick={() => setUpdateTargetPriceModalOpen(true)} className={styles.updateButton}>
                수정
              </button>
            </div>
          );
        })()}

        <div className={styles.viewMode}>
          <button className={viewMode === 'day' ? styles.active : ''} onClick={() => setViewMode('day')}>
            일별
          </button>
          <button className={viewMode === 'month' ? styles.active : ''} onClick={() => setViewMode('month')}>
            월별
          </button>
        </div>
        <table className={styles.profitTable}>
          <thead>
            <tr>
              {viewMode === 'day' ? (
                <>
                  <th></th>
                  <th>티커</th>
                  <th>실현손익</th>
                  <th>변경</th>
                </>
              ) : (
                <>
                  <th>월</th>
                  <th>실현손익</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {viewMode === 'day'
              ? data?.map((item) => {
                  return (
                    <tr key={item.created_at}>
                      <td>
                        {(() => {
                          const date = new Date(item.created_at);
                          return `${date.getFullYear()}-${
                            date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
                          }-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
                        })()}
                      </td>
                      <td>{item.ticker}</td>
                      <td>{item.sell_price.toLocaleString()}</td>
                      <td>
                        <div className={styles.btns}>
                          <button onClick={() => setUpdateProfit(item)}>수정</button>
                          <button
                            onClick={() => {
                              if (window.confirm('삭제하시겠습니까?')) {
                                handleDelete(item.id);
                              }
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              : monthData.map((item) => {
                  return (
                    <tr key={`${item.year}-${item.month}`}>
                      <td>{`${item.year}-${('0' + item.month).slice(-2)}`}</td>
                      <td>{item.price.toLocaleString()}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      <button className={styles.addButton} onClick={() => setAddModalOpen(true)}>
        +
      </button>
      {addModalOpen && <AddProfitModal handleClose={() => setAddModalOpen(false)} onUpdate={() => refetch()} />}
      {updateProfit && (
        <UpdateProfitModal profit={updateProfit} handleClose={() => setUpdateProfit(null)} onUpdate={() => refetch()} />
      )}
      {updateTargetPriceModalOpen && (
        <UpdateTargetPriceModal
          handleClose={() => setUpdateTargetPriceModalOpen(false)}
          onUpdate={() => refetchMonthTargetPrice()}
        />
      )}
    </>
  );
}

function AddProfitModal({ handleClose, onUpdate }: { handleClose: () => void; onUpdate: () => void }) {
  const [ticker, setTicker] = useState('');
  const [sellPrice, setSellPrice] = useState<number | null>(null);

  const { mutateAsync } = useMutation(() =>
    axiosInstance
      .post('/api/realized-profit-loss', {
        ticker,
        sell_price: sellPrice,
      })
      .then((res) => res.data)
  );
  async function handleAdd() {
    handleClose();
    try {
      await mutateAsync();
      onUpdate();
      alert('추가 완료');
    } catch {
      alert('추가 실패');
    }
  }
  return (
    <ModalPortal>
      <ModalContainer>
        <div className={`${styles.modalContent} ${styles.addModalContent}`}>
          <h2>추가</h2>
          <input type='text' placeholder='ticker' value={ticker} onChange={(e) => setTicker(e.currentTarget.value)} />
          <input
            type='number'
            placeholder='실현손익'
            value={sellPrice || ''}
            onChange={(e) => setSellPrice(Number(e.currentTarget.value))}
          />
          <div className={styles.modalButton}>
            <button onClick={handleClose}>취소</button>
            <button onClick={handleAdd}>추가</button>
          </div>
        </div>
      </ModalContainer>
    </ModalPortal>
  );
}

function UpdateProfitModal({
  profit,
  handleClose,
  onUpdate,
}: {
  profit: IRealizedProfit;
  handleClose: () => void;
  onUpdate: () => void;
}) {
  const [ticker, setTicker] = useState(profit.ticker);
  const [sellPrice, setSellPrice] = useState(profit.sell_price);

  const { mutateAsync } = useMutation(() =>
    axiosInstance
      .put(`/api/realized-profit-loss`, {
        id: profit.id,
        ticker,
        sell_price: sellPrice,
      })
      .then((res) => res.data)
  );

  async function handleUpdate() {
    handleClose();
    try {
      await mutateAsync();
      onUpdate();
      alert('수정 완료');
    } catch {
      alert('수정 실패');
    }
  }

  return (
    <ModalPortal>
      <ModalContainer>
        <div className={`${styles.modalContent} ${styles.addModalContent}`}>
          <h2>수정</h2>
          <input type='text' placeholder='ticker' value={ticker} onChange={(e) => setTicker(e.currentTarget.value)} />
          <input
            type='number'
            placeholder='실현손익'
            value={sellPrice || ''}
            onChange={(e) => setSellPrice(Number(e.currentTarget.value))}
          />
          <div className={styles.modalButton}>
            <button onClick={handleClose}>취소</button>
            <button onClick={handleUpdate}>수정</button>
          </div>
        </div>
      </ModalContainer>
    </ModalPortal>
  );
}

function UpdateTargetPriceModal({ handleClose, onUpdate }: { handleClose: () => void; onUpdate: () => void }) {
  const [targetPrice, setTargetPrice] = useState(0);

  const { mutateAsync } = useMutation(() =>
    axiosInstance
      .put('/api/target-price', {
        target_price: targetPrice,
      })
      .then((res) => res.data)
  );

  async function handleUpdate() {
    handleClose();
    try {
      await mutateAsync();
      onUpdate();
      alert('수정 완료');
    } catch {
      alert('수정 실패');
    }
  }
  return (
    <ModalPortal>
      <ModalContainer>
        <div className={`${styles.modalContent} ${styles.addModalContent}`}>
          <h2>이번 달 목표 수정</h2>
          <input
            type='number'
            placeholder='목표 수익'
            value={targetPrice || ''}
            onChange={(e) => setTargetPrice(Number(e.currentTarget.value))}
          />
          <div className={styles.modalButton}>
            <button onClick={handleClose}>취소</button>
            <button onClick={handleUpdate} disabled={!targetPrice}>
              수정
            </button>
          </div>
        </div>
      </ModalContainer>
    </ModalPortal>
  );
}

export default RealizedProfit;
