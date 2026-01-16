const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/constituents', (req, res) => {
  try {
    const constituents = db.prepare('SELECT * FROM constituents ORDER BY createdAt DESC').all();
    res.json(constituents);
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
