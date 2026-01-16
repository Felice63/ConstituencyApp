import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { auditApi } from '../services/api';

const AuditHistory = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const [error, setError] = useState(null);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: rowsPerPage,
        offset: (page - 1) * rowsPerPage,
        entityType: 'constituent',
      };

      const response = await auditApi.getAllAuditLogs(params);
      setAuditLogs(response.data);
      setTotalCount(response.pagination.total);
    } catch (error) {
      setError('Failed to load audit logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(1);
  };

  const toggleExpanded = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getOperationIcon = (operation) => {
    switch (operation) {
      case 'CREATE':
        return <AddIcon fontSize="small" />;
      case 'UPDATE':
        return <EditIcon fontSize="small" />;
      case 'DELETE':
        return <DeleteIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getOperationColor = (operation) => {
    switch (operation) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'primary';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderChanges = (log) => {
    try {
      const changes = JSON.parse(log.changes);

      if (log.operation === 'CREATE') {
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Created with:
            </Typography>
            <Box sx={{ pl: 2 }}>
              {Object.entries(changes.new).map(([key, value]) => (
                <Typography key={key} variant="body2">
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </Typography>
              ))}
            </Box>
          </Box>
        );
      }

      if (log.operation === 'UPDATE') {
        const fieldChanges = changes.fields || {};
        if (Object.keys(fieldChanges).length === 0) {
          return <Typography variant="body2" color="text.secondary">No changes detected</Typography>;
        }

        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Modified fields:
            </Typography>
            <Box sx={{ pl: 2 }}>
              {Object.entries(fieldChanges).map(([field, change]) => (
                <Box key={field} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{field}:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>
                    <span style={{ textDecoration: 'line-through', color: '#d32f2f' }}>
                      {JSON.stringify(change.old)}
                    </span>
                    {' → '}
                    <span style={{ color: '#2e7d32' }}>
                      {JSON.stringify(change.new)}
                    </span>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );
      }

      if (log.operation === 'DELETE') {
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Deleted record:
            </Typography>
            <Box sx={{ pl: 2 }}>
              {Object.entries(changes.old).map(([key, value]) => (
                <Typography key={key} variant="body2">
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </Typography>
              ))}
            </Box>
          </Box>
        );
      }

      return <Typography variant="body2">No change details available</Typography>;
    } catch (error) {
      return <Typography variant="body2" color="error">Error parsing changes</Typography>;
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  if (loading && auditLogs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Audit History
        </Typography>
      </Box>

      {error && (
        <Card sx={{ mb: 3, bgcolor: '#ffebee' }}>
          <CardContent>
            <Typography color="error">{error}</Typography>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {auditLogs.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} - {Math.min(page * rowsPerPage, totalCount)} of {totalCount} audit entries
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows per page</InputLabel>
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              label="Rows per page"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Entity ID</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Changes Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <>
                <TableRow key={log.id} hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(log.id)}
                    >
                      {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                  <TableCell>
                    <Chip
                      label={`Constituent #${log.entityId}`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getOperationIcon(log.operation)}
                      label={log.operation}
                      color={getOperationColor(log.operation)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {log.operation === 'CREATE' && 'New constituent created'}
                    {log.operation === 'UPDATE' && 'Constituent updated'}
                    {log.operation === 'DELETE' && 'Constituent deleted'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                    <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        {renderChanges(log)}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}

            {auditLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary">
                    No audit logs found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default AuditHistory;
