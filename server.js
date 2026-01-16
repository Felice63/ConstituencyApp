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

const escapeCSVField = (field) => {
  if (field == null) {
    return '';
  }
  const str = String(field);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

app.get('/api/constituents/export/csv', (req, res) => {
  try {
    const constituents = db.prepare('SELECT * FROM constituents ORDER BY createdAt DESC').all();
    
    const headers = ['id', 'firstName', 'lastName', 'address', 'wardNumber', 'householdSize', 'createdAt'];
    const csvHeaders = headers.join(',');
    
    const csvRows = constituents.map(constituent => 
      headers.map(header => escapeCSVField(constituent[header])).join(',')
    );
    
    const csv = [csvHeaders, ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="constituents.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const parseCSVLine = (line) => {
  const fields = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"' && insideQuotes && nextChar === '"') {
      currentField += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  fields.push(currentField);
  return fields;
};

app.post('/api/constituents/import/csv', (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV data is required' });
    }
    
    const lines = csvData.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file must contain headers and at least one data row' });
    }
    
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    
    const requiredHeaders = ['firstName', 'lastName', 'address', 'wardNumber', 'householdSize'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}` 
      });
    }
    
    const headerIndices = {};
    headers.forEach((header, index) => {
      headerIndices[header] = index;
    });
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };
    
    const stmt = db.prepare(`
      INSERT INTO constituents (firstName, lastName, address, wardNumber, householdSize, createdAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      try {
        const fields = parseCSVLine(line);
        
        const firstName = fields[headerIndices.firstName]?.trim() || '';
        const lastName = fields[headerIndices.lastName]?.trim() || '';
        const address = fields[headerIndices.address]?.trim() || '';
        const wardNumber = fields[headerIndices.wardNumber]?.trim() || '';
        const householdSize = fields[headerIndices.householdSize]?.trim() || '';
        
        if (!firstName || !lastName || !address || !wardNumber || !householdSize) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields'
          });
          continue;
        }
        
        const wardNum = parseInt(wardNumber);
        const householdNum = parseInt(householdSize);
        
        if (isNaN(wardNum) || wardNum < 1 || wardNum > 50) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Ward number must be between 1 and 50'
          });
          continue;
        }
        
        if (isNaN(householdNum) || householdNum < 1 || householdNum > 50) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Household size must be between 1 and 50'
          });
          continue;
        }
        
        if (firstName.length < 2 || lastName.length < 2) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'First and last names must be at least 2 characters'
          });
          continue;
        }
        
        if (address.length < 5) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Address must be at least 5 characters'
          });
          continue;
        }
        
        stmt.run(firstName, lastName, address, wardNum, householdNum);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message
        });
      }
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/wards', (req, res) => {
  try {
    const wardStats = db.prepare(`
      SELECT 
        wardNumber,
        COUNT(*) as totalConstituents,
        AVG(householdSize) as avgHouseholdSize,
        SUM(householdSize) as totalHouseholdMembers,
        COUNT(DISTINCT address) as uniqueAddresses
      FROM constituents
      GROUP BY wardNumber
      ORDER BY wardNumber ASC
    `).all();

    const formattedStats = wardStats.map(ward => ({
      wardNumber: ward.wardNumber,
      totalConstituents: ward.totalConstituents,
      avgHouseholdSize: parseFloat(ward.avgHouseholdSize.toFixed(2)),
      totalHouseholdMembers: ward.totalHouseholdMembers,
      geographicalCoverage: ward.uniqueAddresses
    }));

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
