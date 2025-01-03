import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.scss';
import { QueryClient, QueryClientProvider } from 'react-query';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
