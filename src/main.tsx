import React from 'react';
import ReactDOM from 'react-dom/client';

// Tailwind and custom styles
import './index.css';

//  Root component
import App from './App';

// Redux store
import { store } from './store';
import { Provider } from 'react-redux';

// Render the app
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
