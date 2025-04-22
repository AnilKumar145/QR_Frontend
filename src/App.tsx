import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AttendanceMarking } from './components/AttendanceMarking';
import { QRCodeDisplay } from './components/QRCodeDisplay';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRCodeDisplay />} />
        <Route path="/mark-attendance/:sessionId" element={<AttendanceMarking />} />
      </Routes>
    </Router>
  );
}

export default App;

