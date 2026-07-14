'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { insights } from './overview-data';
import { cn } from '@/lib/utils';

export function QuickInsights() {
  return (
    <Card className='bg-card h-full'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-semibold'>Quick Insights</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3 px-4 pb-4'>
        {insights.length === 0 ? (
          <div className='flex h-[160px] flex-col items-center justify-center gap-2 text-center'>
            <div className='text-3xl'>✨</div>
            <p className='text-muted-foreground text-sm'>
              No insights available yet.
            </p>
            <p className='text-muted-foreground text-xs'>
              Add more transactions to generate financial insights.
            </p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className='group border-border/50 bg-muted/30 hover:bg-muted/60 flex items-start gap-3 rounded-lg border p-3 transition-all duration-200'
            >
              <div
                className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base'
                style={{ backgroundColor: `${insight.color}20` }}
              >
                <span>{insight.icon}</span>
              </div>
              <p className='text-muted-foreground group-hover:text-foreground text-sm leading-relaxed'>
                {insight.text}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
