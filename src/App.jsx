import { Container, Typography, Box, Paper } from '@mui/material';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import Home from './pages/Home';

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 'lg',
          width: '100%',
          p: 4,
          bgcolor: 'white',
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 4 }}
        >
          Google Flights
          <LocalAirportIcon color="primary" fontSize="large" />
        </Typography>

        <Home />
      </Paper>
    </Box>
  );
}

export default App;
