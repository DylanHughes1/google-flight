import React from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, TableContainer, tableCellClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const FlightsTable = ({ flights }) => {
  if (flights.length === 0) return null;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ fontWeight: 'bold' }}>Airline</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: 'bold' }}>Departure</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: 'bold' }}>Arrival</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: 'bold' }}>Price</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flights.map((flight, index) => (
            <TableRow key={index} sx={{
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
              },
            }}>
              <TableCell>{flight.airline}</TableCell>
              <TableCell>{flight.departure}</TableCell>
              <TableCell>{flight.arrival}</TableCell>
              <TableCell>{flight.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FlightsTable;
