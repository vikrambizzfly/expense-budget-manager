'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function CategoriesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-2">Manage expense categories</p>
      </div>

      <Card>
        <p className="text-gray-500 text-center py-8">
          Category management coming soon...
        </p>
      </Card>
    </div>
  );
}
