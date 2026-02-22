'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function AuditPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-2">View system audit trail</p>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Audit log coming soon...
        </p>
      </Card>
    </div>
  );
}
