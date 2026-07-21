'use client';

import * as React from 'react';
import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  AlertTriangle,
  Target,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { formatINRFull, formatINR } from './overview-data';
import { AddGoalDialog } from './add-goal-dialog';
import { EditGoalDialog } from './edit-goal-dialog';
import { ContributeGoalDialog } from './contribute-goal-dialog';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { toast } from 'sonner';

const chartConfig = {
  value: {
    label: 'Savings Rate'
  }
} satisfies ChartConfig;

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  color: string;
  deadline: string;
  isCompleted?: boolean;
  completedAt?: string | null;
  userId?: string;
  createdAt?: string;
}

interface GoalsSavingsProps {
  dbGoals?: Goal[];
}

export function GoalsSavings({ dbGoals = [] }: GoalsSavingsProps) {
  const [isClient, setIsClient] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  const [selectedEditGoal, setSelectedEditGoal] = React.useState<Goal | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const [selectedContributeGoal, setSelectedContributeGoal] =
    React.useState<Goal | null>(null);
  const [contributeDialogOpen, setContributeDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const totalSavedAmount = React.useMemo(() => {
    return dbGoals.reduce((sum, g) => sum + g.savedAmount, 0);
  }, [dbGoals]);

  const totalTargetAmount = React.useMemo(() => {
    return dbGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  }, [dbGoals]);

  const savingsRate = React.useMemo(() => {
    if (totalTargetAmount === 0) return 0;
    return Math.round((totalSavedAmount / totalTargetAmount) * 100);
  }, [totalSavedAmount, totalTargetAmount]);

  const radialData = React.useMemo(() => {
    return [
      {
        name: 'Savings Rate',
        value: Math.min(savingsRate, 100),
        fill: '#4ade80'
      }
    ];
  }, [savingsRate]);

  async function handleDeleteGoal(goalId: string, goalName: string) {
    if (!confirm(`Are you sure you want to delete the goal "${goalName}"?`))
      return;

    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted goal "${goalName}"`);
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to delete goal');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete goal');
    }
  }

  async function handleToggleComplete(goal: Goal) {
    const newStatus = !goal.isCompleted;
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus
            ? `🎉 Marked "${goal.name}" as Achieved!`
            : `Reopened "${goal.name}"`
        );
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to update goal');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update goal');
    }
  }

  if (hasError) {
    return (
      <Card className='bg-card h-full border-red-500/40'>
        <CardContent className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-6'>
          <AlertTriangle className='h-10 w-10 text-red-500' />
          <p className='text-muted-foreground text-center text-sm'>
            Failed to load goals & savings.
          </p>
          <button
            onClick={() => setHasError(false)}
            className='border-border hover:bg-muted cursor-pointer rounded-md border px-4 py-2 text-sm transition-colors'
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  const isEmpty = dbGoals.length === 0;

  return (
    <>
      <Card className='bg-card flex h-full flex-col'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              Goals &amp; Savings
            </CardTitle>
            <span className='text-muted-foreground text-xs font-medium'>
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
            <div className='flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center'>
              <Target className='text-muted-foreground h-8 w-8' />
              <p className='text-muted-foreground text-sm font-medium'>
                No goals yet.
              </p>
              <p className='text-muted-foreground text-xs'>
                Add a goal to start tracking your savings progress.
              </p>
            </div>
          ) : (
            <>
              {/* Radial savings rate chart */}
              <div className='flex items-center gap-4 border-b border-zinc-800/60 pb-3'>
                <div className='relative h-[84px] w-[84px] shrink-0'>
                  <ChartContainer
                    config={chartConfig}
                    className='h-full w-full'
                  >
                    <RadialBarChart
                      width={84}
                      height={84}
                      data={radialData}
                      innerRadius={26}
                      outerRadius={38}
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
                    <span className='text-foreground text-xs font-bold'>
                      {savingsRate}%
                    </span>
                    <span className='text-muted-foreground text-[8px] tracking-wider uppercase'>
                      saved
                    </span>
                  </div>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Total Saved</p>
                  <p className='text-foreground text-xl font-bold tracking-tight'>
                    {formatINRFull(totalSavedAmount)}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    of {formatINRFull(totalTargetAmount)} target
                  </p>
                </div>
              </div>

              {/* Per-goal list */}
              <div className='flex flex-1 flex-col gap-3.5 overflow-auto pr-1'>
                {dbGoals.map((goal) => {
                  const pct =
                    goal.targetAmount > 0
                      ? Math.round((goal.savedAmount / goal.targetAmount) * 100)
                      : 0;
                  const isAchieved =
                    goal.isCompleted || goal.savedAmount >= goal.targetAmount;

                  return (
                    <div
                      key={goal.id}
                      className='space-y-1.5 rounded-xl border border-zinc-800/60 bg-[#161618] p-2.5 transition-all hover:border-zinc-700/80'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex min-w-0 items-center gap-2'>
                          <div
                            className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900'
                            style={{ color: goal.color }}
                          >
                            <DynamicIcon
                              emoji={goal.icon}
                              className='h-4 w-4'
                            />
                          </div>
                          <div className='truncate'>
                            <span className='text-foreground block truncate text-xs font-semibold'>
                              {goal.name}
                            </span>
                            {isAchieved && (
                              <span className='inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400'>
                                <CheckCircle2 className='h-3 w-3' /> Achieved
                              </span>
                            )}
                          </div>
                        </div>

                        <div className='flex shrink-0 items-center gap-1.5'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => {
                              setSelectedContributeGoal(goal);
                              setContributeDialogOpen(true);
                            }}
                            className='h-7 cursor-pointer border border-emerald-500/20 bg-emerald-500/10 px-2 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300'
                            title='Top up savings'
                          >
                            <DollarSign className='mr-0.5 h-3 w-3' /> Top-up
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 cursor-pointer text-zinc-400 hover:text-white'
                              >
                                <MoreVertical className='h-3.5 w-3.5' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='end'
                              className='border-zinc-800 bg-[#18181b] text-white'
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEditGoal(goal);
                                  setEditDialogOpen(true);
                                }}
                                className='cursor-pointer gap-2 hover:bg-zinc-800'
                              >
                                <Edit2 className='h-3.5 w-3.5' /> Edit Goal
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleComplete(goal)}
                                className='cursor-pointer gap-2 text-emerald-400 hover:bg-zinc-800'
                              >
                                <CheckCircle2 className='h-3.5 w-3.5' />
                                {isAchieved ? 'Mark Active' : 'Mark Achieved'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteGoal(goal.id, goal.name)
                                }
                                className='cursor-pointer gap-2 text-rose-400 hover:bg-zinc-800'
                              >
                                <Trash2 className='h-3.5 w-3.5' /> Delete Goal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className='flex items-center justify-between pt-0.5 text-[10px] text-zinc-400'>
                        <span>{formatINR(goal.savedAmount)} saved</span>
                        <span
                          className='font-semibold'
                          style={{ color: goal.color }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className='relative h-2 w-full overflow-hidden rounded-full bg-zinc-800'>
                        <div
                          className='h-full rounded-full transition-all duration-700 ease-out'
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: goal.color
                          }}
                        />
                      </div>
                      <div className='flex justify-between pt-0.5 text-[9px] text-zinc-500'>
                        <span>Target: {formatINRFull(goal.targetAmount)}</span>
                        <span>
                          Due:{' '}
                          {new Date(goal.deadline).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <Button
            onClick={() => setAddDialogOpen(true)}
            className='mt-auto w-full cursor-pointer gap-2 bg-[#4ade80] font-semibold text-black hover:bg-[#22c55e]'
          >
            <Plus className='h-4 w-4' />
            Add New Goal
          </Button>
        </CardContent>
      </Card>

      <AddGoalDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <EditGoalDialog
        goal={selectedEditGoal}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <ContributeGoalDialog
        goal={selectedContributeGoal}
        open={contributeDialogOpen}
        onOpenChange={setContributeDialogOpen}
      />
    </>
  );
}
