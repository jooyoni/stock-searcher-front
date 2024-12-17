import styles from './ModalContainer.module.scss';

function ModalContainer({ children }: { children: React.ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}

export default ModalContainer;
