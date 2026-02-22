import { useState, useEffect } from 'react';
import { AuditLog, AuditLogFilter, UserRole } from '@/types/models';
import { AuditService } from '@/lib/services/AuditService';
import { useAuth } from '@/contexts/AuthContext';

export function useAuditLogs(filters?: AuditLogFilter) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auditService = new AuditService();

  const fetchLogs = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await auditService.getAuditLogs(user.role as UserRole, filters);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [
    user,
    filters?.entityType,
    filters?.action,
    filters?.performedBy,
    filters?.startDate,
    filters?.endDate,
    filters?.search,
  ]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs,
  };
}

export function useAuditStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalLogs: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
    byUser: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const auditService = new AuditService();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await auditService.getAuditStats(user.role as UserRole);
        setStats(data);
      } catch (err) {
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, isLoading };
}
