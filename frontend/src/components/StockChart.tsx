'use client';

import React from 'react';

interface StockChartProps {
  totalStock: number;
  availableStock: number;
  usedStock: number;
}

const StockChart: React.FC<StockChartProps> = ({ totalStock, availableStock, usedStock }) => {
  const availablePercentage = totalStock > 0 ? (availableStock / totalStock) * 100 : 0;
  const usedPercentage = totalStock > 0 ? (usedStock / totalStock) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 font-semibold">Stock Distribution</span>
        <span className="text-slate-900 font-bold">{totalStock} Total Units</span>
      </div>
      
      {/* Visual Chart */}
      <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 ease-out"
          style={{ width: `${availablePercentage}%` }}
        ></div>
        <div 
          className="absolute top-0 h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000 ease-out"
          style={{ 
            left: `${availablePercentage}%`,
            width: `${usedPercentage}%` 
          }}
        ></div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-slate-600">Available ({availableStock})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-slate-600">Used ({usedStock})</span>
          </div>
        </div>
        <div className="text-slate-500">
          {availablePercentage.toFixed(1)}% available
        </div>
      </div>
    </div>
  );
};

export default StockChart;