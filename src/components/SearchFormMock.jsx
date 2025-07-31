import { useState } from 'react';
import { Box, Grid, TextField, Button, Alert } from '@mui/material';

// Constantes de configuración
const API_CONFIG = {
    key: import.meta.env.VITE_RAPIDAPI_KEY || 'your-api-key-here', 
    host: 'sky-scrapper.p.rapidapi.com',
    baseUrl: 'https://sky-scrapper.p.rapidapi.com/api/v1/flights'
};

// Utilidad para crear headers de la API
const createApiHeaders = () => ({
    'X-RapidAPI-Key': API_CONFIG.key,
    'X-RapidAPI-Host': API_CONFIG.host,
});

// Utilidad para manejar respuestas de la API
const handleApiResponse = async (response, errorMessage) => {
    if (!response.ok) {
        throw new Error(`${errorMessage}: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

// Servicio para buscar aeropuertos
const searchAirport = async (query) => {
    if (!query?.trim()) {
        throw new Error('La consulta de búsqueda no puede estar vacía');
    }

    // Modo desarrollo - simular entityIds
    const isDevelopment = !API_CONFIG.key || API_CONFIG.key === 'your-api-key-here';

    if (isDevelopment) {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mapeo simple para desarrollo
        const mockEntityIds = {
            'london': '12345',
            'nueva york': '67890',
            'new york': '67890',
            'madrid': '11111',
            'barcelona': '22222',
            'paris': '33333'
        };

        const entityId = mockEntityIds[query.toLowerCase()] || `mock-${Date.now()}`;
        return entityId;
    }

    // Modo producción - usar API real
    const url = `${API_CONFIG.baseUrl}/searchAirport?query=${encodeURIComponent(query.trim())}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: createApiHeaders(),
    });

    const data = await handleApiResponse(response, 'Error al buscar aeropuerto');
    const entityId = data?.data?.[0]?.entityId;

    if (!entityId) {
        throw new Error(`No se encontró aeropuerto para "${query}"`);
    }

    return entityId;
};

// Datos simulados para desarrollo
const MOCK_FLIGHT_DATA = {
    "status": true,
    "data": {
        "itineraries": [
            {
                "id": "mock-flight-1",
                "price": { "raw": 419.18, "formatted": "$420" },
                "legs": [
                    {
                        "origin": { "displayCode": "LGW", "name": "London Gatwick", "city": "London" },
                        "destination": { "displayCode": "JFK", "name": "New York JFK", "city": "New York" },
                        "departure": "2024-02-20T12:35:00",
                        "arrival": "2024-02-20T15:50:00",
                        "carriers": { "marketing": [{ "name": "Norse Atlantic Airways" }] }
                    },
                    {
                        "origin": { "displayCode": "JFK", "name": "New York JFK", "city": "New York" },
                        "destination": { "displayCode": "LGW", "name": "London Gatwick", "city": "London" },
                        "departure": "2024-02-22T18:10:00",
                        "arrival": "2024-02-23T06:00:00",
                        "carriers": { "marketing": [{ "name": "Norse Atlantic Airways" }] }
                    }
                ]
            },
            {
                "id": "mock-flight-2",
                "price": { "raw": 527.97, "formatted": "$528" },
                "legs": [
                    {
                        "origin": { "displayCode": "LHR", "name": "London Heathrow", "city": "London" },
                        "destination": { "displayCode": "JFK", "name": "New York JFK", "city": "New York" },
                        "departure": "2024-02-20T07:50:00",
                        "arrival": "2024-02-20T13:55:00",
                        "carriers": { "marketing": [{ "name": "Aer Lingus" }] }
                    },
                    {
                        "origin": { "displayCode": "JFK", "name": "New York JFK", "city": "New York" },
                        "destination": { "displayCode": "LHR", "name": "London Heathrow", "city": "London" },
                        "departure": "2024-02-22T21:10:00",
                        "arrival": "2024-02-23T11:30:00",
                        "carriers": { "marketing": [{ "name": "Aer Lingus" }] }
                    }
                ]
            },
            {
                "id": "mock-flight-3",
                "price": { "raw": 578.71, "formatted": "$579" },
                "legs": [
                    {
                        "origin": { "displayCode": "LHR", "name": "London Heathrow", "city": "London" },
                        "destination": { "displayCode": "EWR", "name": "New York Newark", "city": "New York" },
                        "departure": "2024-02-20T09:50:00",
                        "arrival": "2024-02-20T16:05:00",
                        "carriers": { "marketing": [{ "name": "Aer Lingus" }] }
                    },
                    {
                        "origin": { "displayCode": "EWR", "name": "New York Newark", "city": "New York" },
                        "destination": { "displayCode": "LHR", "name": "London Heathrow", "city": "London" },
                        "departure": "2024-02-22T17:35:00",
                        "arrival": "2024-02-23T08:05:00",
                        "carriers": { "marketing": [{ "name": "Aer Lingus" }] }
                    }
                ]
            }
        ]
    }
};

// Función para convertir datos de la API al formato esperado por FlightsTable
const transformFlightData = (apiData) => {
    if (!apiData?.data?.itineraries) return [];

    return apiData.data.itineraries.map(itinerary => {
        const outbound = itinerary.legs[0];
        const returnFlight = itinerary.legs[1];

        return {
            airline: outbound.carriers.marketing[0]?.name || 'Aerolínea desconocida',
            departure: `${outbound.origin.displayCode} ${new Date(outbound.departure).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })}`,
            arrival: `${returnFlight.destination.displayCode} ${new Date(returnFlight.arrival).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })}`,
            price: itinerary.price.formatted
        };
    });
};

// Servicio para buscar vuelos (con modo desarrollo)
const searchFlights = async (searchParams) => {
    // Modo desarrollo - usar datos simulados
    const isDevelopment = !API_CONFIG.key || API_CONFIG.key === 'your-api-key-here';

    if (isDevelopment) {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generar datos dinámicos basados en la búsqueda
        const mockData = {
            ...MOCK_FLIGHT_DATA,
            data: {
                itineraries: MOCK_FLIGHT_DATA.data.itineraries.map(flight => ({
                    ...flight,
                    legs: flight.legs.map(leg => ({
                        ...leg,
                        origin: {
                            ...leg.origin,
                            displayCode: searchParams.origin.substring(0, 3).toUpperCase(),
                            city: searchParams.origin
                        },
                        destination: {
                            ...leg.destination,
                            displayCode: searchParams.destination.substring(0, 3).toUpperCase(),
                            city: searchParams.destination
                        }
                    }))
                }))
            }
        };

        return transformFlightData(mockData);
    }

    // Modo producción - usar API real
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
    return transformFlightData(data);
};

// Hook personalizado para manejar la búsqueda de vuelos
const useFlightSearch = (setFlights) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchFlightsWithValidation = async (formData) => {
        const { origin, destination, date } = formData;

        // Validación
        if (!origin?.trim() || !destination?.trim() || !date) {
            throw new Error('Por favor completa todos los campos');
        }

        setLoading(true);
        setError(null);

        try {
            // Búsqueda paralela de entidades de aeropuertos
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
            const errorMessage = err.message || 'Error inesperado al buscar vuelos';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { searchFlights: searchFlightsWithValidation, loading, error, clearError: () => setError(null) };
};

// Componente del formulario
const SearchForm = ({ setFlights }) => {
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        date: ''
    });

    const { searchFlights, loading, error, clearError } = useFlightSearch(setFlights);

    // Manejador genérico para cambios en inputs
    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));

        // Limpiar error cuando el usuario empiece a escribir
        if (error) clearError();
    };

    const handleSearch = async () => {
        try {
            await searchFlights(formData);
        } catch (err) {
            console.error('Error en búsqueda:', err);
        }
    };

    // Configuración de campos del formulario
    const formFields = [
        {
            key: 'origin',
            label: 'Origen',
            type: 'text',
            value: formData.origin,
            onChange: handleInputChange('origin')
        },
        {
            key: 'destination',
            label: 'Destino',
            type: 'text',
            value: formData.destination,
            onChange: handleInputChange('destination')
        },
        {
            key: 'date',
            label: 'Fecha',
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
                        sx={{ height: '56px' }} // Altura más específica que '100%'
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SearchForm;