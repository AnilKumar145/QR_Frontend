import { AppBar, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="fixed" sx={{ zIndex: 1300 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            QR Attendance
          </Link>
        </Typography>
        <nav>
          <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            Admin
          </Link>
          <Link to="/attendance" style={{ textDecoration: 'none', color: 'inherit' }}>
            Attendance
          </Link>
        </nav>
      </Toolbar>
    </AppBar>
  );
};

export default Header;