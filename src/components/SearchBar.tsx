import React, { useState } from 'react';
import { 
  
  TextField, 
  InputAdornment, 
  IconButton,
  Paper
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = 'Search...' 
}) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.5,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      <TextField
        fullWidth
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        variant="standard"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
          disableUnderline: true,
          sx: { ml: 1 }
        }}
        sx={{ 
          '& .MuiInputBase-root': {
            height: 40,
          }
        }}
      />
    </Paper>
  );
};

export default SearchBar;