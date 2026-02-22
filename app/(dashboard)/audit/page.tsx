'use client';

import React, { useState } from 'react';
import { useAuditLogs, useAuditStats } from '@/hooks/useAuditLogs';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AuditLog, AuditAction } from '@/types/models';
import { formatDate } from '@/lib/utils/date';
import { toTitleCase } from '@/lib/utils/formatting';
import { FileText, Search, Filter, Download } from 'lucide-react';

export default function AuditPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<{
    entityType?: string;
    action?: AuditAction;
    performedBy?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>({});

  const { logs, isLoading, error } = useAuditLogs(filters);
  const { stats, isLoading: statsLoading } = useAuditStats();

  // Redirect if not admin or accountant
  if (user && user.role !== 'admin' && user.role !== 'accountant') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900">Access Denied</p>
          <p className="text-gray-600 mt-2">
            Only administrators and accountants can view audit logs
          </p>
        </div>
      </div>
    );
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleExportLogs = () => {
    const csvData = logs.map((log) => ({
      Timestamp: formatDate(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      Action: toTitleCase(log.action),
      'Entity Type': toTitleCase(log.entityType),
      'Entity ID': log.entityId,
      'Performed By': log.performedByName,
      Role: toTitleCase(log.performedByRole),
      'Number of Changes': log.changes.length,
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `audit-log-${timestamp}.csv`;

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const rows = csvData.map((row) => Object.values(row));
    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600">Error</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const getActionBadgeColor = (action: AuditAction) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'accountant':
        return 'bg-indigo-100 text-indigo-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-600 mt-2">
          Track all system changes and user activities
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <p className="text-sm text-gray-600">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalLogs}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600">Creates</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {stats.byAction.create || 0}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600">Updates</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {stats.byAction.update || 0}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600">Deletes</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {stats.byAction.delete || 0}
            </p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <CardTitle>Filters</CardTitle>
          </div>
          <Button onClick={handleClearFilters} variant="secondary" size="sm">
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search entity type, user, ID..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type
            </label>
            <Select
              value={filters.entityType || ''}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              options={[
                { label: 'All Types', value: '' },
                { label: 'Expense', value: 'expense' },
                { label: 'Budget', value: 'budget' },
                { label: 'Category', value: 'category' },
                { label: 'User', value: 'user' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <Select
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              options={[
                { label: 'All Actions', value: '' },
                { label: 'Create', value: 'create' },
                { label: 'Update', value: 'update' },
                { label: 'Delete', value: 'delete' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleExportLogs}
              variant="secondary"
              className="w-full"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardTitle>Audit Logs ({logs.length})</CardTitle>
        <CardDescription>
          Detailed record of all system changes
        </CardDescription>

        <div className="mt-6 overflow-x-auto">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audit logs found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Entity
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Performed By
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(log.timestamp, 'MMM dd, yyyy')}
                      <br />
                      <span className="text-xs text-gray-500">
                        {formatDate(log.timestamp, 'HH:mm:ss')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {toTitleCase(log.action)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <div>{toTitleCase(log.entityType)}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {log.entityId.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="text-gray-900">{log.performedByName}</div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleBadgeColor(
                          log.performedByRole
                        )}`}
                      >
                        {toTitleCase(log.performedByRole)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.changes.length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-700">
                            {log.changes.length} field{log.changes.length !== 1 ? 's' : ''}{' '}
                            changed
                          </summary>
                          <div className="mt-2 space-y-2 text-xs">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="bg-gray-50 p-2 rounded">
                                <div className="font-semibold text-gray-900">
                                  {change.field}
                                </div>
                                <div className="text-red-600">
                                  - {JSON.stringify(change.oldValue)}
                                </div>
                                <div className="text-green-600">
                                  + {JSON.stringify(change.newValue)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400">No changes</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
