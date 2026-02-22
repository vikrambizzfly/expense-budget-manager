'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function UsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">Manage user accounts</p>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          User management coming soon...
        </p>
      </Card>
    </div>
  );
}
