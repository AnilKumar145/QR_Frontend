import { Container } from '@mui/material';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export const Home: React.FC = () => {
    return (
        <Container maxWidth="sm">
            <QRCodeDisplay />
        </Container>
    );
};