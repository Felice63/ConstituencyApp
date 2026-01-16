const API_BASE_URL = '/api';

export const constituentApi = {
  async getAll(params = {}) {
    const { limit = 10, offset = 0, search = '', filter = null } = params;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (search) {
      queryParams.set('search', search);
    }
    
    if (filter) {
      queryParams.set('filter', JSON.stringify(filter));
    }
    
    const response = await fetch(`${API_BASE_URL}/constituents?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch constituents');
    }
    return response.json();
  },

  async create(constituent) {
    const response = await fetch(`${API_BASE_URL}/constituents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(constituent),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create constituent');
    }
    return response.json();
  },

  async update(id, constituent) {
    const response = await fetch(`${API_BASE_URL}/constituents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(constituent),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update constituent');
    }
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/constituents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete constituent');
    }
    return true;
  },

  async exportCSV() {
    const response = await fetch(`${API_BASE_URL}/constituents/export/csv`);
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }
    return response.blob();
  },

  async importCSV(csvData) {
    const response = await fetch(`${API_BASE_URL}/constituents/import/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to import CSV');
    }
    return response.json();
  },
};
