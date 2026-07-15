'use client';

import * as React from 'react';
import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import {
  goals,
  totalSavedAmount,
  totalTargetAmount,
  formatINRFull,
  formatINR
} from './overview-data';
import { AddGoalDialog } from './add-goal-dialog';

const savingsRate = Math.round((totalSavedAmount / totalTargetAmount) * 100);

const radialData = [
  {
    name: 'Savings Rate',
    value: savingsRate,
    fill: '#4ade80'
  }
];

const chartConfig = {
  value: {
    label: 'Savings Rate'
  }
} satisfies ChartConfig;

export function GoalsSavings() {
  const [isClient, setIsClient] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (hasError) {
    return (
      <Card className='bg-card h-full border-red-500/40'>
        <CardContent className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-6'>
          <div className='text-4xl'>⚠️</div>
          <p className='text-muted-foreground text-center text-sm'>
            Failed to load goals & savings.
          </p>
          <button
            onClick={() => setHasError(false)}
            className='border-border hover:bg-muted rounded-md border px-4 py-2 text-sm transition-colors'
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  const isEmpty = goals.length === 0;

  return (
    <>
      <Card className='bg-card flex h-full flex-col'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              Goals &amp; Savings
            </CardTitle>
            <span className='text-muted-foreground text-xs'>
              {formatINR(totalSavedAmount)} saved
            </span>
          </div>
        </CardHeader>
        <CardContent className='flex flex-1 flex-col gap-4 px-4 pb-4'>
          {!isClient ? (
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <div className='flex justify-between'>
                    <div className='bg-muted h-3 w-28 animate-pulse rounded' />
                    <div className='bg-muted h-3 w-16 animate-pulse rounded' />
                  </div>
                  <div className='bg-muted h-2 animate-pulse rounded-full' />
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center'>
              <div className='text-3xl'>🎯</div>
              <p className='text-muted-foreground text-sm'>No goals yet.</p>
              <p className='text-muted-foreground text-xs'>
                Add a goal to start tracking your savings progress.
              </p>
            </div>
          ) : (
            <>
              {/* Radial savings rate chart */}
              <div className='flex items-center gap-4'>
                <div className='relative h-[90px] w-[90px] shrink-0'>
                  <ChartContainer
                    config={chartConfig}
                    className='h-full w-full'
                  >
                    <RadialBarChart
                      width={90}
                      height={90}
                      data={radialData}
                      innerRadius={28}
                      outerRadius={42}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type='number'
                        domain={[0, 100]}
                        tick={false}
                      />
                      <RadialBar
                        dataKey='value'
                        cornerRadius={6}
                        background={{ fill: 'hsl(var(--muted))' }}
                      />
                    </RadialBarChart>
                  </ChartContainer>
                  <div className='absolute inset-0 flex flex-col items-center justify-center'>
                    <span className='text-foreground text-sm font-bold'>
                      {savingsRate}%
                    </span>
                    <span className='text-muted-foreground text-[9px]'>
                      saved
                    </span>
                  </div>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Total Saved</p>
                  <p className='text-foreground text-xl font-bold'>
                    {formatINRFull(totalSavedAmount)}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    of {formatINRFull(totalTargetAmount)} target
                  </p>
                </div>
              </div>

              {/* Per-goal progress bars */}
              <div className='flex flex-1 flex-col gap-3 overflow-auto'>
                {goals.map((goal) => {
                  const pct = Math.round(
                    (goal.savedAmount / goal.targetAmount) * 100
                  );
                  return (
                    <div key={goal.id} className='space-y-1'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-1.5'>
                          <span className='text-sm'>{goal.icon}</span>
                          <span className='text-foreground text-xs font-medium'>
                            {goal.name}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground text-xs'>
                            {formatINR(goal.savedAmount)}
                          </span>
                          <span
                            className='text-xs font-semibold'
                            style={{ color: goal.color }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className='bg-muted relative h-2 w-full overflow-hidden rounded-full'>
                        <div
                          className='h-full rounded-full transition-all duration-700 ease-out'
                          style={{
                            width: `${pct}%`,
                            backgroundColor: goal.color
                          }}
                        />
                      </div>
                      <p className='text-muted-foreground text-right text-[10px]'>
                        Target: {formatINRFull(goal.targetAmount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <Button
            onClick={() => setDialogOpen(true)}
            className='mt-auto w-full gap-2 bg-[#4ade80] font-semibold text-black hover:bg-[#22c55e]'
          >
            <Plus className='h-4 w-4' />
            Add New Goal
          </Button>
        </CardContent>
      </Card>
      <AddGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
