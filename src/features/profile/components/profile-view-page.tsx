'use client';

import { authClient } from '@/lib/auth/client';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Button } from '@/components/ui/button';

export default function ProfileViewPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  if (!user) {
    return <div className='p-4 text-white'>Loading profile...</div>;
  }

  return (
    <div className='flex w-full flex-col p-8'>
      <div className='max-w-md rounded-xl border border-white/10 bg-[#161616] p-6 text-white'>
        <h2 className='mb-6 text-2xl font-bold'>Profile</h2>
        <div className='mb-6 flex items-center gap-4'>
          <UserAvatarProfile user={user} className='h-16 w-16' />
          <div>
            <p className='text-lg font-semibold'>{user.name}</p>
            <p className='text-sm text-neutral-400'>{user.email}</p>
          </div>
        </div>
        <Button variant='outline' className='w-full border-white/10'>
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
