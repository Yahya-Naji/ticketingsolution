import React from 'react';
import Image from 'next/image';

export const CredexLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/credexlogo.png"
        alt="Credex Systems"
        width={250}
        height={150}
        priority
      />
    </div>
  );
};