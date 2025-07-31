import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import SearchFormMock from '../components/SearchFormMock';
import FlightsTable from '../components/FlightsTable';
import { Box } from '@mui/material';

const Home = () => {
    const [flights, setFlights] = useState([]);

    return (
        <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
        >
            <SearchFormMock setFlights={setFlights} />
            <FlightsTable flights={flights} />
        </Box>
    );
};

export default Home;
