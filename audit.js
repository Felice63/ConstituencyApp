const db = require('./database');

const auditLog = {
  logCreate(entityType, entityId, entityData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO audit_logs (entityType, entityId, operation, changes, timestamp)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      const changes = JSON.stringify({
        new: entityData
      });
      
      stmt.run(entityType, entityId, 'CREATE', changes);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  },

  logUpdate(entityType, entityId, oldData, newData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO audit_logs (entityType, entityId, operation, changes, timestamp)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      const changedFields = {};
      for (const key in newData) {
        if (oldData[key] !== newData[key]) {
          changedFields[key] = {
            old: oldData[key],
            new: newData[key]
          };
        }
      }
      
      const changes = JSON.stringify({
        fields: changedFields
      });
      
      stmt.run(entityType, entityId, 'UPDATE', changes);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  },

  logDelete(entityType, entityId, entityData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO audit_logs (entityType, entityId, operation, changes, timestamp)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      const changes = JSON.stringify({
        old: entityData
      });
      
      stmt.run(entityType, entityId, 'DELETE', changes);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  },

  getAuditLogs(entityType, entityId) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM audit_logs
        WHERE entityType = ? AND entityId = ?
        ORDER BY timestamp DESC
      `);
      
      return stmt.all(entityType, entityId);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  },

  getAllAuditLogs(params = {}) {
    try {
      const { limit = 100, offset = 0, entityType = null, entityId = null } = params;
      
      let whereConditions = [];
      let queryParams = [];
      
      if (entityType) {
        whereConditions.push('entityType = ?');
        queryParams.push(entityType);
      }
      
      if (entityId) {
        whereConditions.push('entityId = ?');
        queryParams.push(entityId);
      }
      
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ') 
        : '';
      
      const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
      const totalResult = db.prepare(countQuery).get(...queryParams);
      const total = totalResult.total;
      
      const dataQuery = `
        SELECT * FROM audit_logs 
        ${whereClause}
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
      `;
      const logs = db.prepare(dataQuery).all(...queryParams, limit, offset);
      
      return {
        data: logs,
        pagination: {
          total,
          limit,
          offset
        }
      };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          limit: params.limit || 100,
          offset: params.offset || 0
        }
      };
    }
  }
};

module.exports = auditLog;
