import AppRouter from './app/router';
import CookieConsent from './components/common/CookieConsent';

function App() {
  return (
    <>
      <AppRouter />
      <CookieConsent />
    </>
  );
}

export default App;
