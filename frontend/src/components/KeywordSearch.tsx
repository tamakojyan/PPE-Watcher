import { useState } from 'react';
import { Grid, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

type KeywordSearchProps = {
  onSearch: (keyword?: string) => void;
};

export default function KeywordSearch({ onSearch }: KeywordSearchProps) {
  const [keyword, setKeyword] = useState('');

  const handleClear = () => {
    setKeyword('');
    onSearch(undefined);
  };

  const handleSearch = () => {
    const trimmed = keyword.trim();
    onSearch(trimmed || undefined);
  };

  return (
    <>
      <Grid size={{ md: 4 }}>
        <TextField
          fullWidth
          label="Search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClear}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ md: 2 }}>
        <Button variant="contained" sx={{ mt: 1 }} onClick={handleSearch}>
          Search
        </Button>
      </Grid>
    </>
  );
}
