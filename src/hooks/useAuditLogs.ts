import { useState, useEffect } from 'react';
import { AuditLog, AuditLogFilter } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

export function useAuditLogs(filters?: AuditLogFilter) {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!user || !token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.action) params.append('action', filters.action);

      const response = await fetch(`/api/audit?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
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
    token,
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

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // TODO: Create stats API endpoint if needed
        setStats(null);
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
