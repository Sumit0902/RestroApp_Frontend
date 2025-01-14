import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './global.css'
import "@radix-ui/themes/styles.css";
import { Theme } from '@radix-ui/themes';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store/store.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Theme appearance='light' accentColor='gray' panelBackground="translucent">
          <App />
        </Theme>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
