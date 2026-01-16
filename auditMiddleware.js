const db = require('./database');

const logAudit = (entityType, entityId, action, oldData = null, newData = null) => {
  const changes = [];
  
  if (action === 'UPDATE' && oldData && newData) {
    const fields = ['firstName', 'lastName', 'address', 'wardNumber', 'householdSize'];
    fields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push({
          field,
          oldValue: oldData[field],
          newValue: newData[field]
        });
      }
    });
  }
  
  const stmt = db.prepare(`
    INSERT INTO audit_logs (entityType, entityId, action, oldData, newData, changes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  
  stmt.run(
    entityType,
    entityId,
    action,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    changes.length > 0 ? JSON.stringify(changes) : null
  );
};

const auditMiddleware = {
  logCreate: (entityType, entityId, newData) => {
    logAudit(entityType, entityId, 'CREATE', null, newData);
  },
  
  logUpdate: (entityType, entityId, oldData, newData) => {
    logAudit(entityType, entityId, 'UPDATE', oldData, newData);
  },
  
  logDelete: (entityType, entityId, oldData) => {
    logAudit(entityType, entityId, 'DELETE', oldData, null);
  }
};

module.exports = auditMiddleware;
