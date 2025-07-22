import { createRoot } from 'react-dom/client';
import Index from './pages/Index';
import HearingTestPage from './pages/HearingTestPage';
import './index.css';

const path = window.location.pathname;
let Page = Index;
if (path === '/test') {
  Page = HearingTestPage;
}

createRoot(document.getElementById('root')!).render(<Page />);
