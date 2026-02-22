'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface BarChartData {
  name: string;
  [key: string]: any;
}

interface BarChartComponentProps {
  data: BarChartData[];
  title?: string;
  dataKeys: { key: string; color: string; label: string }[];
}

export function BarChartComponent({
  data,
  title,
  dataKeys,
}: BarChartComponentProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) =>
              formatCurrency(value, { showCents: false })
            }
          />
          <Tooltip
            formatter={(value: number | undefined) => formatCurrency(value || 0)}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          {dataKeys.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              fill={item.color}
              name={item.label}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
