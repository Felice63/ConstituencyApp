import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Map as MapIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { constituentApi } from '../services/api';

const ConstituentTable = () => {
  const [constituents, setConstituents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newRow, setNewRow] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [householdSizeMin, setHouseholdSizeMin] = useState('');
  const [householdSizeMax, setHouseholdSizeMax] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const ward = params.get('ward') || '';
    const minSize = params.get('minSize') || '';
    const maxSize = params.get('maxSize') || '';

    setSearchTerm(search);
    setDebouncedSearchTerm(search);
    setWardFilter(ward);
    setHouseholdSizeMin(minSize);
    setHouseholdSizeMax(maxSize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (wardFilter) params.set('ward', wardFilter);
    if (householdSizeMin) params.set('minSize', householdSizeMin);
    if (householdSizeMax) params.set('maxSize', householdSizeMax);

    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [debouncedSearchTerm, wardFilter, householdSizeMin, householdSizeMax]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchConstituents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await constituentApi.getAll();
      setConstituents(data);
    } catch (error) {
      showSnackbar('Failed to load constituents: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchConstituents();
  }, [fetchConstituents]);

  const filteredConstituents = useMemo(() => {
    return constituents.filter(constituent => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = !debouncedSearchTerm || 
        constituent.firstName.toLowerCase().includes(searchLower) ||
        constituent.lastName.toLowerCase().includes(searchLower) ||
        constituent.address.toLowerCase().includes(searchLower);

      const matchesWard = !wardFilter || constituent.wardNumber === parseInt(wardFilter);

      const minSize = householdSizeMin ? parseInt(householdSizeMin) : 0;
      const maxSize = householdSizeMax ? parseInt(householdSizeMax) : Infinity;
      const matchesHouseholdSize = constituent.householdSize >= minSize && constituent.householdSize <= maxSize;

      return matchesSearch && matchesWard && matchesHouseholdSize;
    });
  }, [constituents, debouncedSearchTerm, wardFilter, householdSizeMin, householdSizeMax]);

  const uniqueWards = useMemo(() => {
    const wards = [...new Set(constituents.map(c => c.wardNumber))];
    return wards.sort((a, b) => a - b);
  }, [constituents]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setWardFilter('');
    setHouseholdSizeMin('');
    setHouseholdSizeMax('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchTerm) count++;
    if (wardFilter) count++;
    if (householdSizeMin || householdSizeMax) count++;
    return count;
  }, [debouncedSearchTerm, wardFilter, householdSizeMin, householdSizeMax]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value || value.trim() === '') {
          newErrors[name] = 'This field is required';
        } else if (value.trim().length < 2) {
          newErrors[name] = 'Must be at least 2 characters';
        } else if (!/^[a-zA-Z\s-']+$/.test(value)) {
          newErrors[name] = 'Only letters, spaces, hyphens and apostrophes allowed';
        } else {
          delete newErrors[name];
        }
        break;

      case 'address':
        if (!value || value.trim() === '') {
          newErrors[name] = 'Address is required';
        } else if (value.trim().length < 5) {
          newErrors[name] = 'Address must be at least 5 characters';
        } else {
          delete newErrors[name];
        }
        break;

      case 'wardNumber': {
        const wardNum = parseInt(value);
        if (value === '' || value === null || value === undefined) {
          newErrors[name] = 'Ward number is required';
        } else if (isNaN(wardNum)) {
          newErrors[name] = 'Must be a valid number';
        } else if (wardNum < 1 || wardNum > 50) {
          newErrors[name] = 'Must be between 1 and 50';
        } else if (!Number.isInteger(wardNum)) {
          newErrors[name] = 'Must be a whole number';
        } else {
          delete newErrors[name];
        }
        break;
      }

      case 'householdSize': {
        const householdNum = parseInt(value);
        if (value === '' || value === null || value === undefined) {
          newErrors[name] = 'Household size is required';
        } else if (isNaN(householdNum)) {
          newErrors[name] = 'Must be a valid number';
        } else if (householdNum < 1 || householdNum > 50) {
          newErrors[name] = 'Must be between 1 and 50';
        } else if (!Number.isInteger(householdNum)) {
          newErrors[name] = 'Must be a whole number';
        } else {
          delete newErrors[name];
        }
        break;
      }

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (formData) => {
    const fields = ['firstName', 'lastName', 'address', 'wardNumber', 'householdSize'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleEdit = (constituent) => {
    setEditingId(constituent.id);
    setEditForm({
      firstName: constituent.firstName,
      lastName: constituent.lastName,
      address: constituent.address,
      wardNumber: constituent.wardNumber,
      householdSize: constituent.householdSize,
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setErrors({});
  };

  const handleSaveEdit = async () => {
    if (!validateForm(editForm)) {
      showSnackbar('Please fix validation errors before saving', 'error');
      return;
    }

    try {
      await constituentApi.update(editingId, editForm);
      await fetchConstituents();
      setEditingId(null);
      setEditForm({});
      setErrors({});
      showSnackbar('Constituent updated successfully');
    } catch (error) {
      showSnackbar('Failed to update constituent: ' + error.message, 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await constituentApi.delete(deleteDialog.id);
      await fetchConstituents();
      showSnackbar('Constituent deleted successfully');
    } catch (error) {
      showSnackbar('Failed to delete constituent: ' + error.message, 'error');
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null });
  };

  const handleEditChange = (field, value) => {
    const newForm = { ...editForm, [field]: value };
    setEditForm(newForm);
    validateField(field, value);
  };

  const handleAddNew = () => {
    setNewRow({
      firstName: '',
      lastName: '',
      address: '',
      wardNumber: '',
      householdSize: '',
    });
    setErrors({});
  };

  const handleCancelNew = () => {
    setNewRow(null);
    setErrors({});
  };

  const handleNewChange = (field, value) => {
    const newForm = { ...newRow, [field]: value };
    setNewRow(newForm);
    validateField(field, value);
  };

  const handleSaveNew = async () => {
    if (!validateForm(newRow)) {
      showSnackbar('Please fix validation errors before saving', 'error');
      return;
    }

    try {
      await constituentApi.create(newRow);
      await fetchConstituents();
      setNewRow(null);
      setErrors({});
      showSnackbar('Constituent added successfully');
    } catch (error) {
      showSnackbar('Failed to add constituent: ' + error.message, 'error');
    }
  };

  const handleMapClick = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
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
          Constituents Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          disabled={newRow !== null || editingId !== null}
        >
          Add New
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Ward Number</InputLabel>
              <Select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                label="Ward Number"
              >
                <MenuItem value="">All Wards</MenuItem>
                {uniqueWards.map(ward => (
                  <MenuItem key={ward} value={ward}>Ward {ward}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Min Household Size"
              type="number"
              value={householdSizeMin}
              onChange={(e) => setHouseholdSizeMin(e.target.value)}
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Max Household Size"
              type="number"
              value={householdSizeMax}
              onChange={(e) => setHouseholdSizeMax(e.target.value)}
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={activeFiltersCount === 0}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Active Filters:
            </Typography>
            {debouncedSearchTerm && (
              <Chip
                label={`Search: "${debouncedSearchTerm}"`}
                onDelete={() => {
                  setSearchTerm('');
                  setDebouncedSearchTerm('');
                }}
                size="small"
              />
            )}
            {wardFilter && (
              <Chip
                label={`Ward: ${wardFilter}`}
                onDelete={() => setWardFilter('')}
                size="small"
              />
            )}
            {(householdSizeMin || householdSizeMax) && (
              <Chip
                label={`Household: ${householdSizeMin || '1'}-${householdSizeMax || '∞'}`}
                onDelete={() => {
                  setHouseholdSizeMin('');
                  setHouseholdSizeMax('');
                }}
                size="small"
              />
            )}
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredConstituents.length} of {constituents.length} constituents
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Ward Number</TableCell>
              <TableCell>Household Size</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {newRow && (
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={newRow.firstName}
                    onChange={(e) => handleNewChange('firstName', e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={newRow.lastName}
                    onChange={(e) => handleNewChange('lastName', e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={newRow.address}
                    onChange={(e) => handleNewChange('address', e.target.value)}
                    error={!!errors.address}
                    helperText={errors.address}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={newRow.wardNumber}
                    onChange={(e) => handleNewChange('wardNumber', e.target.value)}
                    error={!!errors.wardNumber}
                    helperText={errors.wardNumber}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={newRow.householdSize}
                    onChange={(e) => handleNewChange('householdSize', e.target.value)}
                    error={!!errors.householdSize}
                    helperText={errors.householdSize}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={handleSaveNew}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton color="default" onClick={handleCancelNew}>
                    <CancelIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )}

            {filteredConstituents.map((constituent) => (
              <TableRow key={constituent.id}>
                {editingId === constituent.id ? (
                  <>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.firstName}
                        onChange={(e) => handleEditChange('firstName', e.target.value)}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.lastName}
                        onChange={(e) => handleEditChange('lastName', e.target.value)}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.address}
                        onChange={(e) => handleEditChange('address', e.target.value)}
                        error={!!errors.address}
                        helperText={errors.address}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={editForm.wardNumber}
                        onChange={(e) => handleEditChange('wardNumber', e.target.value)}
                        error={!!errors.wardNumber}
                        helperText={errors.wardNumber}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={editForm.householdSize}
                        onChange={(e) => handleEditChange('householdSize', e.target.value)}
                        error={!!errors.householdSize}
                        helperText={errors.householdSize}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={handleSaveEdit}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton color="default" onClick={handleCancelEdit}>
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{constituent.firstName}</TableCell>
                    <TableCell>{constituent.lastName}</TableCell>
                    <TableCell>{constituent.address}</TableCell>
                    <TableCell>{constituent.wardNumber}</TableCell>
                    <TableCell>{constituent.householdSize}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="success"
                        onClick={() => handleMapClick(constituent.address)}
                        title="View on Google Maps"
                      >
                        <MapIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(constituent)}
                        disabled={editingId !== null || newRow !== null}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(constituent.id)}
                        disabled={editingId !== null || newRow !== null}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}

            {filteredConstituents.length === 0 && !newRow && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">
                    {constituents.length === 0 
                      ? 'No constituents found. Click "Add New" to create one.'
                      : 'No constituents match the current filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this constituent? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConstituentTable;
