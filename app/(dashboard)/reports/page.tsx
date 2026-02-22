'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Export and generate reports</p>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Report generation coming soon...
        </p>
      </Card>
    </div>
  );
}
