import MongoDbConnection from '@/lib/db';
import type { AuditLog } from '@/lib/types';

/**
 * Write an audit log entry for an admin action.
 * Do not include sensitive data like raw passwords. Sanitize details before calling.
 */
export async function logAudit(session: any, action: string, resource?: string, details?: any) {
  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('audit_logs');
    const actorEmail: string = (session as any)?.user?.email || 'unknown';
    const actorRole: string | undefined = (session as any)?.role;
    const doc: AuditLog = {
      actorEmail,
      actorRole: actorRole as any,
      action,
      resource,
      message: details?.message,
      resourceId: details?.resourceId,
      details: sanitize(details),
      createdAt: new Date().toISOString(),
    };
    await col.insertOne(doc as any);
  } catch (e) {
    // fail-safe: do not crash API if audit log write fails
    console.warn('Audit log write failed:', e);
  }
}

function sanitize(details: any) {
  if (!details) return undefined;
  try {
    const copy = { ...details };
    // remove sensitive fields if present
    delete (copy as any).password;
    delete (copy as any).passwordHash;
    delete (copy as any).newPassword;
    return copy;
  } catch {
    return undefined;
  }
}