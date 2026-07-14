import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SpendingCategoriesSkeleton() {
  return (
    <Card className='bg-card h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-3 w-24' />
          </div>
          <div className='space-y-2 text-right'>
            <Skeleton className='ml-auto h-3 w-20' />
            <Skeleton className='ml-auto h-5 w-28' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div className='space-y-3'>
          {[85, 65, 45, 25, 55, 40].map((w, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-7 rounded-md' style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalsSavingsSkeleton() {
  return (
    <Card className='bg-card flex h-full flex-col'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-5 w-36' />
          <Skeleton className='h-4 w-20' />
        </div>
      </CardHeader>
      <CardContent className='flex-1 space-y-4 px-4 pb-4'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-[90px] w-[90px] rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-3 w-20' />
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-3 w-28' />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='space-y-2'>
            <div className='flex justify-between'>
              <Skeleton className='h-3 w-28' />
              <Skeleton className='h-3 w-16' />
            </div>
            <Skeleton className='h-2 w-full rounded-full' />
            <Skeleton className='ml-auto h-3 w-24' />
          </div>
        ))}
        <Skeleton className='mt-auto h-10 w-full rounded-md' />
      </CardContent>
    </Card>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <Card className='bg-card flex h-full flex-col'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-5 w-44' />
          <Skeleton className='h-4 w-16' />
        </div>
        <div className='mt-2 flex gap-2'>
          <Skeleton className='h-7 w-28' />
          <Skeleton className='ml-auto h-7 w-24' />
        </div>
        <div className='mt-1 flex gap-4'>
          <Skeleton className='h-7 w-12' />
          <Skeleton className='h-7 w-20' />
          <Skeleton className='h-7 w-20' />
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div className='divide-border/50 divide-y'>
          {[...Array(7)].map((_, i) => (
            <div key={i} className='flex items-center gap-3 py-2.5'>
              <Skeleton className='h-9 w-9 rounded-xl' />
              <div className='flex-1 space-y-1.5'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-20' />
              </div>
              <div className='space-y-1.5 text-right'>
                <Skeleton className='ml-auto h-4 w-20' />
                <Skeleton className='ml-auto h-3 w-24' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialCalendarSkeleton() {
  return (
    <Card className='bg-card h-full'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-5 w-40' />
          <div className='flex items-center gap-1'>
            <Skeleton className='h-7 w-7 rounded-md' />
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-7 w-7 rounded-md' />
          </div>
        </div>
        <Skeleton className='h-3 w-36' />
      </CardHeader>
      <CardContent className='px-3 pb-4'>
        <div className='grid grid-cols-7 gap-y-1'>
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className='mx-auto h-8 w-8 rounded-md' />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
