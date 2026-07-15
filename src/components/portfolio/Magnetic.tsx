import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface MagneticProps {
  children: React.ReactElement;
  magneticPull?: number;
}

export function Magnetic({ children, magneticPull = 0.3 }: MagneticProps) {
  const magnetic = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const xTo = gsap.quickTo(magnetic.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(magnetic.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = magnetic.current!.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * magneticPull);
      yTo(y * magneticPull);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    const element = magnetic.current;
    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, { scope: magnetic });

  return React.cloneElement(children, { ref: magnetic });
}
