import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider as OidcProvider } from 'react-oidc-context';

import App from './App.jsx';
import { AuthProvider as LocalAuthProvider } from './hooks/useAuth'; 
import { BrowserRouter as Router } from 'react-router-dom';
import './styles.css';
import { CartProvider } from './context/CartContext';

const oidcConfig = {
  authority: "http://localhost:8080/realms/proyecto-seguro",
  client_id: "cathering-react",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile email",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OidcProvider {...oidcConfig}>
      <Router> 
        <LocalAuthProvider>
          <CartProvider>
              <App />
          </CartProvider> 
        </LocalAuthProvider>
      </Router>
    </OidcProvider>
  </React.StrictMode>,
);