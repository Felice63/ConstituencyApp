const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/constituents', (req, res) => {
  try {
    const { limit = 10, offset = 0, search = '', filter = '' } = req.query;
    
    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);
    
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }
    
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ error: 'Offset must be non-negative' });
    }
    
    let whereConditions = [];
    let params = [];
    
    if (search) {
      whereConditions.push('(firstName LIKE ? OR lastName LIKE ? OR address LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (filter) {
      try {
        const filterObj = JSON.parse(filter);
        
        if (filterObj.wardNumber !== undefined && filterObj.wardNumber !== null && filterObj.wardNumber !== '') {
          whereConditions.push('wardNumber = ?');
          params.push(parseInt(filterObj.wardNumber));
        }
        
        if (filterObj.householdSizeMin !== undefined && filterObj.householdSizeMin !== null && filterObj.householdSizeMin !== '') {
          whereConditions.push('householdSize >= ?');
          params.push(parseInt(filterObj.householdSizeMin));
        }
        
        if (filterObj.householdSizeMax !== undefined && filterObj.householdSizeMax !== null && filterObj.householdSizeMax !== '') {
          whereConditions.push('householdSize <= ?');
          params.push(parseInt(filterObj.householdSizeMax));
        }
      } catch (e) {
        return res.status(400).json({ error: 'Invalid filter format' });
      }
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    const countQuery = `SELECT COUNT(*) as total FROM constituents ${whereClause}`;
    const totalResult = db.prepare(countQuery).get(...params);
    const total = totalResult.total;
    
    const dataQuery = `
      SELECT * FROM constituents 
      ${whereClause}
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const constituents = db.prepare(dataQuery).all(...params, parsedLimit, parsedOffset);
    
    res.json({
      data: constituents,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        page: Math.floor(parsedOffset / parsedLimit) + 1,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/constituents', (req, res) => {
  try {
    const { firstName, lastName, address, wardNumber, householdSize } = req.body;
    
    if (!firstName || !lastName || !address || wardNumber === undefined || householdSize === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO constituents (firstName, lastName, address, wardNumber, householdSize, createdAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(firstName, lastName, address, wardNumber, householdSize);
    
    const newConstituent = db.prepare('SELECT * FROM constituents WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newConstituent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/constituents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, address, wardNumber, householdSize } = req.body;
    
    if (!firstName || !lastName || !address || wardNumber === undefined || householdSize === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const stmt = db.prepare(`
      UPDATE constituents 
      SET firstName = ?, lastName = ?, address = ?, wardNumber = ?, householdSize = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(firstName, lastName, address, wardNumber, householdSize, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Constituent not found' });
    }
    
    const updatedConstituent = db.prepare('SELECT * FROM constituents WHERE id = ?').get(id);
    
    res.json(updatedConstituent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/constituents/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM constituents WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Constituent not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
