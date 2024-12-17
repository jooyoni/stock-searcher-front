import ReactDOM from 'react-dom';

function ModalPortal({ children }: { children: React.ReactNode }) {
  const el = document.getElementById('modal');
  if (!el) return null;
  return ReactDOM.createPortal(children, el);
}

export default ModalPortal;
