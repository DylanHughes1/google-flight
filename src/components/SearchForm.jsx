import { useState } from 'react';
import { Box, Grid, TextField, Button, Alert } from '@mui/material';

const API_CONFIG = {
  key: import.meta.env.VITE_RAPIDAPI_KEY,
  host: 'sky-scrapper.p.rapidapi.com',
  baseUrl: 'https://sky-scrapper.p.rapidapi.com/api/v1/flights'
};

const createApiHeaders = () => ({
  'X-RapidAPI-Key': API_CONFIG.key,
  'X-RapidAPI-Host': API_CONFIG.host,
});

const handleApiResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const searchAirport = async (query) => {
  if (!query?.trim()) {
    throw new Error('The search query cannot be empty');
  }

  const url = `${API_CONFIG.baseUrl}/searchAirport?query=${encodeURIComponent(query.trim())}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: createApiHeaders(),
  });

  const data = await handleApiResponse(response, 'Error searching for airport');
  const entityId = data?.data?.[0]?.entityId;

  if (!entityId) {
    throw new Error(`No airport found for "${query}"`);
  }

  return entityId;
};

const searchFlights = async (searchParams) => {
  const { origin, destination, originEntityId, destinationEntityId, date, adults = 1 } = searchParams;

  const url = new URL(`${API_CONFIG.baseUrl}/searchFlights`);
  const params = {
    originSkyId: origin,
    destinationSkyId: destination,
    originEntityId,
    destinationEntityId,
    date,
    adults: adults.toString()
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: createApiHeaders(),
  });

  const data = await handleApiResponse(response, 'Error al buscar vuelos');
  return data?.data || [];
};

const useFlightSearch = (setFlights) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFlightsWithValidation = async (formData) => {
    const { origin, destination, date } = formData;

    if (!origin?.trim() || !destination?.trim() || !date) {
      throw new Error('Please complete all the fields');
    }

    setLoading(true);
    setError(null);

    try {
      const [originEntityId, destinationEntityId] = await Promise.all([
        searchAirport(origin),
        searchAirport(destination)
      ]);

      const flights = await searchFlights({
        origin: origin.trim(),
        destination: destination.trim(),
        originEntityId,
        destinationEntityId,
        date,
      });

      setFlights(flights);
      return flights;
    } catch (err) {
      const errorMessage = err.message || 'Unexpected error searching flights';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchFlights: searchFlightsWithValidation, loading, error, clearError: () => setError(null) };
};

const SearchForm = ({ setFlights }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: ''
  });

  const { searchFlights, loading, error, clearError } = useFlightSearch(setFlights);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));

    if (error) clearError();
  };

  const handleSearch = async () => {
    try {
      await searchFlights(formData);
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  };

  const formFields = [
    {
      key: 'origin',
      label: 'Origin',
      type: 'text',
      value: formData.origin,
      onChange: handleInputChange('origin')
    },
    {
      key: 'destination',
      label: 'Destination',
      type: 'text',
      value: formData.destination,
      onChange: handleInputChange('destination')
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      value: formData.date,
      onChange: handleInputChange('date'),
      InputLabelProps: { shrink: true }
    }
  ];

  return (
    <Box mb={4}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} alignItems="center">
        {formFields.map(({ key, label, type, value, onChange, ...props }) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <TextField
              label={label}
              type={type}
              value={value}
              onChange={onChange}
              fullWidth
              disabled={loading}
              {...props}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            onClick={handleSearch}
            fullWidth
            disabled={loading}
            sx={{ height: '56px' }} 
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchForm;