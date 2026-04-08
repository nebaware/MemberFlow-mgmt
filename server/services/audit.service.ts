import { dbService } from './db.service.js';

type AuditEntry = {
  id: string;
  timestamp: string;
  actorUid?: string;
  actorRole?: string;
  orgId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
};

const createAuditId = () => `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const logAudit = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
  const db = dbService.get();
  if (!Array.isArray(db.auditLogs)) {
    db.auditLogs = [];
  }

  db.auditLogs.unshift({
    id: createAuditId(),
    timestamp: new Date().toISOString(),
    ...entry,
  });

  // Keep the file bounded for local JSON storage.
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }

  dbService.save(db);
};
