import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  return (
    <div>
      <h1 className='text-green-500'>Hello</h1>
    </div>
  );
}
