import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';

function InventoryManagement() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({});
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage]);

  const fetchBooks = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_DB_URL}/books?page=${page}&pageSize=10`
      );
      const newBooks = response.data.book;
      setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      setFilteredBooks((prevFilteredBooks) => [...prevFilteredBooks, ...newBooks]);
      calculateInventorySummary([...books, ...newBooks]);
      setTotalPages(Math.ceil(response.data.totalCount / 10));
    } catch (error) {
      console.error('Error in fetching books', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInventorySummary = (books) => {
    const summary = books.reduce((acc, book) => {
      acc[book.availability] = (acc[book.availability] || 0) + 1;
      return acc;
    }, {});
    setInventorySummary(summary);
  };

  const handleScroll = (event) => {
    const tableContainer = event.target;
    if (
      tableContainer.scrollTop + tableContainer.offsetHeight >=
        tableContainer.scrollHeight &&
      currentPage < totalPages
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const barChart = () => {
    const genres = books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(genres),
      datasets: [
        {
          label: 'Books by Genre',
          data: Object.values(genres),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    };
  };

  const pieChart = () => ({
    labels: ['In Stock', 'Out of Stock'],
    datasets: [
      {
        label: 'Inventory Status',
        data: [inventorySummary[true] || 0, inventorySummary[false] || 0],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  });

  const handleAvailabilityFilterChange = (event) => {
    const filterValue = event.target.value;
    setAvailabilityFilter(filterValue);
    const filteredBooks = books.filter((book) => {
      if (filterValue === 'All') return true;
      return filterValue === 'In Stock' ? book.availability : !book.availability;
    });
    setFilteredBooks(filteredBooks);
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Inventory Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px', height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Inventory Availability by Genre
            </Typography>
            <Bar data={barChart()} options={{ responsive: true, maintainAspectRatio: false }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px', height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Inventory Status
            </Typography>
            <Pie data={pieChart()} options={{ responsive: true, maintainAspectRatio: false }} />
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Inventory Filters
      </Typography>
      <select value={availabilityFilter} onChange={handleAvailabilityFilterChange}>
        <option value="All">All</option>
        <option value="In Stock">In Stock</option>
        <option value="Out of Stock">Out of Stock</option>
      </select>

      <Typography variant="h6" gutterBottom>
        Inventory Count Summary
      </Typography>
      <ul>
        {Object.keys(inventorySummary).map((key) => (
          <li key={key}>
            {key === 'true' ? 'In Stock' : 'Out of Stock'}: {inventorySummary[key]}
          </li>
        ))}
      </ul>

      <div
        style={{ marginTop: '20px', marginBottom: '20px', maxHeight: '500px', overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Genre</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBooks.map((book, index) => (
                <TableRow key={index} hover>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell>{book.price}</TableCell>
                  <TableCell>{book.availability ? 'In Stock' : 'Out of Stock'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {loading && <Typography variant="h6">Loading...</Typography>}
    </Container>
  );
}

export default InventoryManagement;
