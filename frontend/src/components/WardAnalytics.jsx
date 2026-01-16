import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../services/api';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0',
];

const WardAnalytics = () => {
  const [wardData, setWardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWardAnalytics();
  }, []);

  const fetchWardAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsApi.getWardAnalytics();
      setWardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load analytics: {error}</Alert>
      </Box>
    );
  }

  const totalConstituents = wardData.reduce((sum, ward) => sum + ward.totalConstituents, 0);
  const totalHouseholdMembers = wardData.reduce((sum, ward) => sum + ward.totalHouseholdMembers, 0);
  const avgHouseholdSize = totalConstituents > 0 
    ? (totalHouseholdMembers / totalConstituents).toFixed(2) 
    : 0;
  const totalGeographicalCoverage = wardData.reduce((sum, ward) => sum + ward.geographicalCoverage, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Ward Analytics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Constituents
              </Typography>
              <Typography variant="h4" component="div">
                {totalConstituents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Household Members
              </Typography>
              <Typography variant="h4" component="div">
                {totalHouseholdMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Household Size
              </Typography>
              <Typography variant="h4" component="div">
                {avgHouseholdSize}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Unique Addresses
              </Typography>
              <Typography variant="h4" component="div">
                {totalGeographicalCoverage}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Constituents by Ward
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wardNumber" label={{ value: 'Ward Number', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Total Constituents', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalConstituents" fill="#1976d2" name="Total Constituents" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Average Household Size by Ward
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wardNumber" label={{ value: 'Ward Number', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Avg Household Size', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgHouseholdSize" stroke="#82ca9d" name="Avg Household Size" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Geographical Coverage by Ward
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wardNumber" label={{ value: 'Ward Number', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Unique Addresses', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="geographicalCoverage" fill="#ff8042" name="Unique Addresses" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ward Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wardData}
                  dataKey="totalConstituents"
                  nameKey="wardNumber"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `Ward ${entry.wardNumber}: ${entry.totalConstituents}`}
                >
                  {wardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ward Statistics Table
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Ward Number</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Total Constituents</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Avg Household Size</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Total Members</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Unique Addresses</th>
                </tr>
              </thead>
              <tbody>
                {wardData.map((ward) => (
                  <tr key={ward.wardNumber} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>Ward {ward.wardNumber}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{ward.totalConstituents}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{ward.avgHouseholdSize}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{ward.totalHouseholdMembers}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{ward.geographicalCoverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default WardAnalytics;
