import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  tooltip?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, tooltip = 'Back' }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <Tooltip title={tooltip}>
      <IconButton onClick={handleClick} color="inherit" edge="start">
        <ArrowBack />
      </IconButton>
    </Tooltip>
  );
};

export default BackButton;
