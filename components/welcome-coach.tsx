import Image from 'next/image';

export function WelcomeCoach() {
  return (
    <div className="welcome-portrait">
      <span className="welcome-greeting" lang="es">¡Hola!</span>
      <Image
        src="/brand/kurtes-open-arms.png"
        alt="Your KurtES coach welcoming you with open arms"
        width={1024}
        height={1536}
        unoptimized
        priority
        className="welcome-coach"
      />
    </div>
  );
}
