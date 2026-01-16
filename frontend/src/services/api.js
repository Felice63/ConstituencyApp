const API_BASE_URL = '/api';

export const constituentApi = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/constituents`);
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
};
