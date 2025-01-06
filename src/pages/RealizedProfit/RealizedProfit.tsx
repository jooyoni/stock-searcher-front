import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../../axios/axios';
import Header from '../../components/Header/Header';
import styles from './RealizedProfit.module.scss';
import { IRealizedProfit } from '../../types/stock';
import { useState } from 'react';
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
              : (() => {
                  const monthData: {
                    year: number;
                    month: number;
                    price: number;
                  }[] = [];
                  data?.forEach((item) => {
                    const date = new Date(item.created_at);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const lastData = monthData[monthData.length - 1];
                    if (lastData && lastData.year === year && lastData.month === month) {
                      lastData.price += item.sell_price;
                    } else {
                      monthData.push({ year, month, price: item.sell_price });
                    }
                  });

                  return monthData.map((item) => {
                    return (
                      <tr key={`${item.year}-${item.month}`}>
                        <td>{`${item.year}-${('0' + item.month).slice(-2)}`}</td>
                        <td>{item.price.toLocaleString()}</td>
                      </tr>
                    );
                  });
                })()}
          </tbody>
        </table>
        {/* <div className={styles.monthProfit}>
          <span>월별 실현손익</span>
          <span>
            {(() => {
              const totalPrice = data ? data.reduce((acc, item) => acc + item.sell_price, 0) : 0;
              return (totalPrice >= 0 ? '+' : '') + totalPrice?.toLocaleString();
            })()}
            원
          </span>
        </div> */}
      </div>
      <button className={styles.addButton} onClick={() => setAddModalOpen(true)}>
        +
      </button>
      {addModalOpen && <AddProfitModal handleClose={() => setAddModalOpen(false)} onUpdate={() => refetch()} />}
      {updateProfit && (
        <UpdateProfitModal profit={updateProfit} handleClose={() => setUpdateProfit(null)} onUpdate={() => refetch()} />
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

export default RealizedProfit;
