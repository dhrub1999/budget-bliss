import React from 'react';
import Image from 'next/image';
import { FeatureCardProps } from '@/constants/data';

const FeatureCard = ({ title, description, imageUrl }: FeatureCardProps) => {
  return (
    <div className='flex flex-col gap-y-6 rounded-2xl border border-neutral-100/15 p-6'>
      <h3 className='font-nunito text-xl font-bold'>{title}</h3>
      <div className='flex w-full justify-center p-4'>
        <Image src={imageUrl} alt={title} width={1440} height={640} />
      </div>
      <p className='font-karla text-lg text-neutral-400'>{description}</p>
    </div>
  );
};

export default FeatureCard;
