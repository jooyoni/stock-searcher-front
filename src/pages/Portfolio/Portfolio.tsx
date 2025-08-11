import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../../axios/axios';
import styles from './Portfolio.module.scss';
import { IPortfolio } from '../../types/stock';
import ModalPortal from '../../components/ModalPortal/ModalPortal';
import ModalContainer from '../../components/ModalContainer/ModalContainer';
import { useState } from 'react';
import Header from '../../components/Header/Header';

function Portfolio() {
  const { data, refetch } = useQuery<IPortfolio[]>({
    queryKey: ['portfolio'],
    queryFn: () => axiosInstance.get('/api/stock/portfolio').then((res) => res.data),
  });

  const { data: exchangeRate } = useQuery<{ exchange_rate: number }>({
    queryKey: ['exchange-rate'],
    queryFn: () => axiosInstance.get('/api/exchange-rate').then((res) => res.data),
  });

  const [currency, setCurrency] = useState<'krw' | 'usd'>('krw');

  const [addModalOpen, setAddModalOpen] = useState(false);
  return (
    <>
      <Header />
      <div className={styles.portfolioPage}>
        <div className={styles.currencySetting}>
          <button className={currency === 'krw' ? styles.active : ''} onClick={() => setCurrency('krw')}>
            원화
          </button>
          <button className={currency === 'usd' ? styles.active : ''} onClick={() => setCurrency('usd')}>
            달러
          </button>
        </div>
        <div className={styles.totalInvestInfo}>
          {(() => {
            if (!data) return null;
            let totalInvestment = 0;
            let totalMarketValue = 0;
            for (const stock of data) {
              totalInvestment +=
                stock.avg_price * stock.shares * (currency === 'krw' ? exchangeRate?.exchange_rate || 0 : 1);
              totalMarketValue +=
                stock.price * stock.shares * (currency === 'krw' ? exchangeRate?.exchange_rate || 0 : 1);
            }
            const totalProfit = totalMarketValue - totalInvestment;
            const totalReturnRate = (totalProfit / totalInvestment) * 100;
            return (
              <>
                <span>
                  총 투자금액 : {Number(totalInvestment.toFixed(currency === 'krw' ? 0 : 2)).toLocaleString()}
                  {currency === 'krw' ? '원' : '$'}
                </span>
                <span>
                  총 평가금액 : {Number(totalMarketValue.toFixed(currency === 'krw' ? 0 : 2)).toLocaleString()}
                  {currency === 'krw' ? '원' : '$'}
                </span>
                <span>
                  총 손익 : {Number(totalProfit.toFixed(currency === 'krw' ? 0 : 2)).toLocaleString()}
                  {currency === 'krw' ? '원' : '$'}
                </span>
                <span>총 수익률 : {Number(totalReturnRate.toFixed(2))}%</span>
              </>
            );
          })()}
        </div>
        <ul className={styles.portfolioList}>
          {data?.map((stock) => {
            return (
              <PortfolioStock
                exchangeRate={exchangeRate?.exchange_rate || 0}
                key={stock.ticker}
                stock={stock}
                onUpdate={() => {
                  refetch();
                }}
                currency={currency}
              />
            );
          })}
        </ul>
        <button className={styles.addButton} onClick={() => setAddModalOpen(true)}>
          +
        </button>
      </div>
      {addModalOpen && <AddPortfolioModal handleClose={() => setAddModalOpen(false)} onUpdate={() => refetch()} />}
    </>
  );
}

function AddPortfolioModal({ handleClose, onUpdate }: { handleClose: () => void; onUpdate: () => void }) {
  const [ticker, setTicker] = useState('');
  const [avgPrice, setAvgPrice] = useState<number | null>(null);
  const [shares, setShares] = useState<number | null>(null);

  const { mutateAsync } = useMutation(() =>
    axiosInstance
      .post('/api/stock/portfolio', {
        ticker,
        avgPrice,
        shares,
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
            placeholder='구매단가'
            value={avgPrice || ''}
            onChange={(e) => setAvgPrice(Number(e.currentTarget.value))}
          />
          <input
            type='number'
            placeholder='보유수량'
            value={shares || ''}
            onChange={(e) => setShares(Number(e.currentTarget.value))}
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

function PortfolioStock({
  stock,
  onUpdate,
  currency,
  exchangeRate,
}: {
  stock: IPortfolio;
  onUpdate: () => void;
  currency: 'krw' | 'usd';
  exchangeRate: number;
}) {
  const currencyMark = currency === 'krw' ? '원' : '$';
  const marketValue = stock.price * stock.shares * (currency === 'krw' ? exchangeRate : 1);
  const investment = stock.avg_price * stock.shares * (currency === 'krw' ? exchangeRate : 1);
  const returnRate = ((marketValue - investment) / investment) * 100;

  const [averageDownCalculatorOpen, setAverageDownCalculatorOpen] = useState(false);
  const [addTargetPrice, setAddTargetPrice] = useState(stock.price);
  const [addMoney, setAddMoney] = useState(0);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const [avgPrice, setAvgPrice] = useState(stock.avg_price);
  const [shares, setShares] = useState(stock.shares);

  const { mutateAsync } = useMutation(() =>
    axiosInstance
      .put('/api/stock/portfolio', {
        ticker: stock.ticker,
        avgPrice,
        shares,
      })
      .then((res) => res.data)
  );

  async function handleUpdate() {
    setUpdateModalOpen(false);
    try {
      await mutateAsync();
      alert('수정 완료');
      onUpdate();
    } catch {
      alert('수정 실패');
    }
  }

  const { mutateAsync: deleteMutateAsync } = useMutation(() =>
    axiosInstance.delete(`/api/stock/portfolio?ticker=${stock.ticker}`).then((res) => res.data)
  );
  async function handleDelete() {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await deleteMutateAsync();
      onUpdate();
      alert('삭제 완료');
    } catch {
      alert('삭제 실패');
    }
  }
  return (
    <>
      <li>
        <h2>{stock.ticker}</h2>
        <span>{stock.name}</span>
        <span>
          현재가 : {Number((stock.price * (currency === 'krw' ? exchangeRate : 1)).toFixed(4)).toLocaleString()}
          {currencyMark}
        </span>
        <span>
          평단가 : {Number((stock.avg_price * (currency === 'krw' ? exchangeRate : 1)).toFixed(4)).toLocaleString()}
          {currencyMark}
        </span>
        <span>총 주식 수 : {stock.shares.toLocaleString()}개</span>
        <span>
          평가금액 : {Number(marketValue.toFixed(currency === 'krw' ? 0 : 2)).toLocaleString()}
          {currencyMark}
        </span>
        <span>
          투자금액 : {Number(investment.toFixed(currency === 'krw' ? 0 : 2)).toLocaleString()}
          {currencyMark}
        </span>
        <span>
          평가손익 : {Number((marketValue - investment).toFixed(currency === 'krw' ? 0 : 2)).toLocaleString()}
          {currencyMark}
        </span>
        <span>수익률 : {Number(returnRate.toFixed(2))}%</span>
        <div className={styles.buttons}>
          <button onClick={() => setAverageDownCalculatorOpen(true)}>물타기</button>
          <button onClick={() => setUpdateModalOpen(true)}>수정</button>
          <button onClick={handleDelete}>삭제</button>
        </div>
      </li>
      {averageDownCalculatorOpen && (
        <ModalPortal>
          <ModalContainer>
            <div className={styles.modalContent}>
              <h2>물타기</h2>
              <ul className={styles.averageDownCalculator}>
                <li>
                  <span>현재 평단가</span>
                  <input type='number' value={stock.avg_price} disabled />
                </li>
                <li>
                  <span>물타기 단가</span>
                  <input
                    type='number'
                    value={addTargetPrice}
                    onChange={(e) => setAddTargetPrice(Number(e.currentTarget.value))}
                  />
                </li>
                <li>
                  <span>물타기 자본(원)</span>
                  <input
                    type='text'
                    value={addMoney ? addMoney.toLocaleString() : ''}
                    onChange={(e) => setAddMoney(Number(e.currentTarget.value.replace(/,/g, '')))}
                  />
                </li>
              </ul>
              <span className={styles.averageDownCalculatorResult}>
                예상 평단가 :{' '}
                {(() => {
                  const ADD_MONEY = addMoney / exchangeRate;
                  const CAN_BUY_SHARES = Math.floor(ADD_MONEY / stock.price);
                  const NEW_AVG_PRICE = (stock.avg_price * stock.shares + ADD_MONEY) / (stock.shares + CAN_BUY_SHARES);
                  return NEW_AVG_PRICE.toFixed(4);
                })()}
                $
              </span>
              <div className={styles.modalButton}>
                <button onClick={() => setAverageDownCalculatorOpen(false)}>취소</button>
              </div>
            </div>
          </ModalContainer>
        </ModalPortal>
      )}
      {updateModalOpen && (
        <ModalPortal>
          <ModalContainer>
            <div className={styles.modalContent}>
              <h2>수정</h2>
              <ul className={styles.buyInfo}>
                <li>
                  <span>ticker.</span>
                  <span>{stock.ticker}</span>
                </li>
                <li>
                  <span>구매단가</span>
                  <input
                    type='number'
                    placeholder='구매단가'
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(Number(e.currentTarget.value))}
                  />
                </li>
                <li>
                  <span>보유수량</span>
                  <input
                    type='number'
                    placeholder='보유수량'
                    value={shares}
                    onChange={(e) => setShares(Number(e.currentTarget.value))}
                  />
                </li>
              </ul>
              <div className={styles.modalButton}>
                <button onClick={() => setUpdateModalOpen(false)}>취소</button>
                <button onClick={handleUpdate}>변경</button>
              </div>
            </div>
          </ModalContainer>
        </ModalPortal>
      )}
    </>
  );
}

export default Portfolio;
