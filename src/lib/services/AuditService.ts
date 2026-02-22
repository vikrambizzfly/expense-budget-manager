import { v4 as uuidv4 } from 'uuid';
import { getStorageAdapter } from '../storage/LocalStorageAdapter';
import {
  AuditLog,
  AuditAction,
  User,
  UserRole,
  AuditLogFilter,
} from '@/types/models';
import { Collections } from '../storage/StorageInterface';

export class AuditService {
  private storage = getStorageAdapter();

  /**
   * Log an audit event
   */
  async logAction(
    entityType: string,
    entityId: string,
    action: AuditAction,
    performedBy: string,
    performedByName: string,
    performedByRole: UserRole,
    changes: Array<{ field: string; oldValue: any; newValue: any }> = []
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: uuidv4(),
      entityType,
      entityId,
      action,
      performedBy,
      performedByName,
      performedByRole,
      changes,
      timestamp: new Date().toISOString(),
    };

    await this.storage.create(Collections.AUDIT_LOGS, auditLog);
    return auditLog;
  }

  /**
   * Log a create action
   */
  async logCreate(
    entityType: string,
    entityId: string,
    user: User,
    newData: any
  ): Promise<AuditLog> {
    const changes = Object.keys(newData).map((field) => ({
      field,
      oldValue: null,
      newValue: newData[field],
    }));

    return this.logAction(
      entityType,
      entityId,
      AuditAction.CREATE,
      user.id,
      user.name,
      user.role,
      changes
    );
  }

  /**
   * Log an update action with field-level changes
   */
  async logUpdate(
    entityType: string,
    entityId: string,
    user: User,
    oldData: any,
    newData: any
  ): Promise<AuditLog> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    // Compare old and new data to find changes
    const allFields = new Set([
      ...Object.keys(oldData),
      ...Object.keys(newData),
    ]);

    allFields.forEach((field) => {
      // Skip metadata fields
      if (['createdAt', 'updatedAt', 'createdBy', 'updatedBy'].includes(field)) {
        return;
      }

      const oldValue = oldData[field];
      const newValue = newData[field];

      // Only log if values are different
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue,
          newValue,
        });
      }
    });

    return this.logAction(
      entityType,
      entityId,
      AuditAction.UPDATE,
      user.id,
      user.name,
      user.role,
      changes
    );
  }

  /**
   * Log a delete action
   */
  async logDelete(
    entityType: string,
    entityId: string,
    user: User,
    deletedData: any
  ): Promise<AuditLog> {
    const changes = Object.keys(deletedData).map((field) => ({
      field,
      oldValue: deletedData[field],
      newValue: null,
    }));

    return this.logAction(
      entityType,
      entityId,
      AuditAction.DELETE,
      user.id,
      user.name,
      user.role,
      changes
    );
  }

  /**
   * Get all audit logs with optional filtering
   */
  async getAuditLogs(
    userRole: UserRole,
    filter?: AuditLogFilter
  ): Promise<AuditLog[]> {
    // Only admins and accountants can view audit logs
    if (userRole !== 'admin' && userRole !== 'accountant') {
      throw new Error('Unauthorized: Only admins and accountants can view audit logs');
    }

    let logs = await this.storage.getAll<AuditLog>(Collections.AUDIT_LOGS);

    // Apply filters
    if (filter) {
      if (filter.entityType) {
        logs = logs.filter((log) => log.entityType === filter.entityType);
      }

      if (filter.action) {
        logs = logs.filter((log) => log.action === filter.action);
      }

      if (filter.performedBy) {
        logs = logs.filter((log) => log.performedBy === filter.performedBy);
      }

      if (filter.startDate) {
        logs = logs.filter(
          (log) => new Date(log.timestamp) >= new Date(filter.startDate!)
        );
      }

      if (filter.endDate) {
        logs = logs.filter(
          (log) => new Date(log.timestamp) <= new Date(filter.endDate!)
        );
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        logs = logs.filter(
          (log) =>
            log.entityType.toLowerCase().includes(searchLower) ||
            log.performedByName.toLowerCase().includes(searchLower) ||
            log.entityId.toLowerCase().includes(searchLower)
        );
      }
    }

    // Sort by timestamp descending (newest first)
    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditHistory(
    entityType: string,
    entityId: string,
    userRole: UserRole
  ): Promise<AuditLog[]> {
    if (userRole !== 'admin' && userRole !== 'accountant') {
      throw new Error('Unauthorized: Only admins and accountants can view audit logs');
    }

    const logs = await this.storage.query<AuditLog>(
      Collections.AUDIT_LOGS,
      (log) => log.entityType === entityType && log.entityId === entityId
    );

    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get recent audit activity (last N logs)
   */
  async getRecentActivity(
    userRole: UserRole,
    limit: number = 50
  ): Promise<AuditLog[]> {
    if (userRole !== 'admin' && userRole !== 'accountant') {
      throw new Error('Unauthorized: Only admins and accountants can view audit logs');
    }

    const logs = await this.storage.getAll<AuditLog>(Collections.AUDIT_LOGS);
    const sorted = logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return sorted.slice(0, limit);
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(userRole: UserRole): Promise<{
    totalLogs: number;
    byAction: Record<AuditAction, number>;
    byEntityType: Record<string, number>;
    byUser: Record<string, number>;
  }> {
    if (userRole !== 'admin' && userRole !== 'accountant') {
      throw new Error('Unauthorized: Only admins and accountants can view audit logs');
    }

    const logs = await this.storage.getAll<AuditLog>(Collections.AUDIT_LOGS);

    const byAction: Record<AuditAction, number> = {
      create: 0,
      update: 0,
      delete: 0,
    };

    const byEntityType: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    logs.forEach((log) => {
      byAction[log.action]++;

      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;

      byUser[log.performedByName] = (byUser[log.performedByName] || 0) + 1;
    });

    return {
      totalLogs: logs.length,
      byAction,
      byEntityType,
      byUser,
    };
  }
}
