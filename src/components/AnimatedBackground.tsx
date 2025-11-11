import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  particleCount?: number;
  parallaxIntensity?: number;
  enableParticles?: boolean;
  enableGradient?: boolean;
}


export default function AnimatedBackground({
  particleCount = 50,
  parallaxIntensity = 0.5,
  enableParticles = true,
  enableGradient = true,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    if (!enableGradient && !enableParticles) return;

    const canvas = canvasRef.current;
    const gradientContainer = gradientRef.current;

    const cleanupFunctions: (() => void)[] = [];

    // Initialize canvas for particles
    if (canvas && enableParticles) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };
        //

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        cleanupFunctions.push(() => window.removeEventListener('resize', resizeCanvas));

        // Initialize particles
        particlesRef.current = Array.from({ length: particleCount }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        }));

        // Animation loop for particles
        const animate = () => {
          if (!ctx) return;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          particlesRef.current.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(16, 185, 129, ${particle.opacity})`;
            ctx.fill();

            // Draw connections
            particlesRef.current.slice(i + 1).forEach((otherParticle) => {
              const dx = particle.x - otherParticle.x;
              const dy = particle.y - otherParticle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 120) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 * (1 - distance / 120)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            });
          });

          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
      }
    }

    // Handle parallax for gradient
    if (gradientContainer && enableGradient) {
      const scrollHandler = () => {
        const scrollY = window.scrollY * parallaxIntensity;
        gradientContainer.style.transform = `translateY(${scrollY}px)`;
      };

      window.addEventListener('scroll', scrollHandler, { passive: true });
      cleanupFunctions.push(() => window.removeEventListener('scroll', scrollHandler));
    }

    // Combined cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [particleCount, parallaxIntensity, enableParticles, enableGradient]);

  return (
    <>
      {/* Moving Gradient Background */}
      {enableGradient && (
        <div
          ref={gradientRef}
          className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 opacity-50">
              <div
                className="absolute inset-0 animate-gradient-x"
                style={{
                  background: 'linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 50%, rgba(16,185,129,0.1) 100%)',
                  backgroundSize: '200% 200%',
                }}
              />
              {/* Floating orbs */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float-slow" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float-slow animation-delay-2000" />
              <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl animate-float-slow animation-delay-4000" />
            </div>
          </div>
        </div>
      )}

      {/* Particle Flow Canvas */}
      {enableParticles && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ opacity: 0.6 }}
        />
      )}
    </>
  );
}

