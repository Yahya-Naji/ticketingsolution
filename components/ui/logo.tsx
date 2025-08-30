import React from 'react';
import Image from 'next/image';

export const CredexLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/credexlogo.png"
        alt="Credex Systems"
        width={120}
        height={40}
        className="h-8 w-auto"
        priority
      />
    </div>
  );
};