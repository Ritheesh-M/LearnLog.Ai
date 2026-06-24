import { useEffect, useRef } from "react";

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
      color: string;
    }

    const stars: Star[] = [];
    const colors = ["#ffffff", "#e2e8f0", "#7c3aed", "#3b82f6", "#06b6d4", "#fbbf24", "#ec4899"];

    // Populate stars
    const starCount = Math.min(180, Math.floor((width * height) / 8000));
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Nebula clouds
    interface Nebula {
      x: number;
      y: number;
      radius: number;
      color: string;
    }
    const nebulae: Nebula[] = [
      { x: width * 0.2, y: height * 0.3, radius: width * 0.25, color: "rgba(124, 58, 237, 0.04)" },
      { x: width * 0.75, y: height * 0.7, radius: width * 0.3, color: "rgba(59, 130, 246, 0.04)" },
      { x: width * 0.5, y: height * 0.5, radius: width * 0.2, color: "rgba(6, 182, 212, 0.03)" },
    ];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.fillStyle = "#030014";
      ctx.fillRect(0, 0, width, height);

      // Draw Nebulae
      for (const neb of nebulae) {
        const gradient = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        gradient.addColorStop(0, neb.color);
        gradient.addColorStop(1, "rgba(3, 0, 20, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw and update stars
      for (const star of stars) {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }

        // Clamp alpha
        const currentAlpha = Math.max(0.1, Math.min(1, star.alpha));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle slow float drift to the left
        star.x -= 0.08;
        if (star.x < 0) {
          star.x = width;
          star.y = Math.random() * height;
        }
      }

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      id="starfield-canvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
