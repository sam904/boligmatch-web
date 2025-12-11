import AppRouter from './app/router';
import CookieConsent from './components/common/CookieConsent';

function App() {
  return (
    <div>
      <AppRouter />
      <CookieConsent />
    </div>
  );
}

export default App;
