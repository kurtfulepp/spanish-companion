'use client';

import { useState } from 'react';
import Image from 'next/image';

export function WelcomeCoach() {
  const [ready, setReady] = useState(false);

  return (
    <div className="welcome-portrait" data-greeting-ready={ready}>
      <span className="welcome-greeting" lang="es">¡Hola!</span>
      <Image
        src="/brand/kurtes-open-arms.png"
        alt="Your KurtES coach welcoming you with open arms"
        width={1024}
        height={1536}
        unoptimized
        priority
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        className="welcome-coach"
      />
    </div>
  );
}
