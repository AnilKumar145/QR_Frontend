import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface TimerProps {
    seconds: number;
    onComplete?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ seconds: initialSeconds, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        // Reset timer when initial seconds changes
        setTimeLeft(initialSeconds);

        // Don't start timer if seconds is 0 or negative
        if (initialSeconds <= 0) {
            onComplete?.();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(intervalId);
                    onComplete?.();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Cleanup interval on component unmount or when seconds changes
        return () => clearInterval(intervalId);
    }, [initialSeconds, onComplete]);

    // Calculate progress percentage
    const progress = Math.max(0, Math.min(100, (timeLeft / initialSeconds) * 100));

    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress
                variant="determinate"
                value={progress}
                size={60}
                thickness={4}
                color={timeLeft < 30 ? "error" : "primary"}
            />
            <Box
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
                top={0}
                left={0}
                bottom={0}
                right={0}
            >
                <Typography 
                    variant="caption" 
                    component="div" 
                    color={timeLeft < 30 ? "error" : "text.secondary"}
                >
                    {Math.max(0, timeLeft)}s
                </Typography>
            </Box>
        </Box>
    );
};
