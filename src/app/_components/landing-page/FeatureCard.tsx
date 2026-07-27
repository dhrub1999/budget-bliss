import React from 'react';
import Image from 'next/image';
import { FeatureCardProps } from '@/constants/data';

const FeatureCard = ({
  title,
  description,
  imageUrl,
  imageWidth,
  imageHeight,
  imageAlt
}: FeatureCardProps) => {
  return (
    <div className='flex flex-col gap-y-6 rounded-2xl border border-neutral-100/15 p-6'>
      <h3 className='font-nunito text-xl font-bold'>{title}</h3>
      <div className='flex w-full justify-center p-4'>
        <Image
          src={imageUrl}
          // Alt text describes what the screenshot shows, not the heading it
          // sits under — repeating the visible <h3> adds nothing for a screen
          // reader and nothing for image search.
          alt={imageAlt ?? title}
          // Per-card, because these are screenshots cropped to their content
          // rather than one fixed art size.
          width={imageWidth}
          height={imageHeight}
          className='h-auto w-full rounded-lg'
          // Below the fold: let the browser defer these rather than competing
          // with the hero image for bandwidth (LCP).
          loading='lazy'
          sizes='(max-width: 768px) 100vw, 50vw'
        />
      </div>
      <p className='font-karla text-lg text-neutral-400'>{description}</p>
    </div>
  );
};

export default FeatureCard;
