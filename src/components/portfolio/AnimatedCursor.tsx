import React, { createContext, useContext, useEffect } from 'react';
import { motion, useMotionValue, useSpring, HTMLMotionProps } from 'motion/react';

type CursorContextType = {
  x: any;
  y: any;
};

const CursorContext = createContext<CursorContextType | null>(null);

interface CursorProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  global?: boolean;
}

export const CursorProvider = ({ children, global = false, ...props }: CursorProviderProps) => {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  return (
    <CursorContext.Provider value={{ x, y }}>
      <div style={{ cursor: global ? 'none' : 'auto', minHeight: '100vh', width: '100%' }} {...props}>
        {children}
      </div>
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) throw new Error("useCursor doit être utilisé à l'intérieur de CursorProvider");
  return context;
};

export const Cursor = ({ children, ...props }: HTMLMotionProps<"div">) => {
  const { x, y } = useCursor();
  const springX = useSpring(x, { stiffness: 800, damping: 40 });
  const springY = useSpring(y, { stiffness: 800, damping: 40 });

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: springX,
        y: springY,
        pointerEvents: 'none',
        zIndex: 9999,
        translateX: '-50%',
        translateY: '-50%',
      }}
      {...props}
    >
      {children || (
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', transform: 'rotate(-25deg)' }}
        >
          <path 
            opacity="0.3" 
            d="M7.236 14.1235L10.1904 7.84548C10.9109 6.31427 13.0891 6.31427 13.8096 7.84548L16.764 14.1235C17.6393 15.9835 15.4758 17.7954 13.7983 16.6071L13.156 16.1522C12.4634 15.6616 11.5366 15.6616 10.844 16.1522L10.2017 16.6072C8.52417 17.7954 6.36069 15.9835 7.236 14.1235Z" 
            fill="#FFE213"
          />
          <path 
            d="M7.236 14.1235L10.1904 7.84548C10.9109 6.31427 13.0891 6.31427 13.8096 7.84548L16.764 14.1235C17.6393 15.9835 15.4758 17.7954 13.7983 16.6071L13.156 16.1522C12.4634 15.6616 11.5366 15.6616 10.844 16.1522L10.2017 16.6072C8.52417 17.7954 6.36069 15.9835 7.236 14.1235Z" 
            stroke="#FFE213" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      )}
    </motion.div>
  );
};

interface CursorFollowProps extends HTMLMotionProps<"div"> {
  sideOffset?: number;
  alignOffset?: number;
}

export const CursorFollow = ({ children, sideOffset = 16, alignOffset = 16, ...props }: CursorFollowProps) => {
  const { x, y } = useCursor();
  const springX = useSpring(x, { stiffness: 300, damping: 30, bounce: 0 });
  const springY = useSpring(y, { stiffness: 300, damping: 30, bounce: 0 });

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: springX,
        y: springY,
        pointerEvents: 'none',
        zIndex: 9998,
        marginLeft: sideOffset,
        marginTop: alignOffset,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
