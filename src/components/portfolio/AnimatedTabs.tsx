import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { motion, HTMLMotionProps, Transition, AnimatePresence } from 'motion/react';

type TabsContextType = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps extends Omit<React.ComponentProps<'div'>, 'defaultValue'> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export const Tabs = ({ defaultValue, value: controlledValue, onValueChange, children, ...props }: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const setValue = (newValue: string) => {
    if (newValue !== value) {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div {...props} style={{ display: 'flex', position: 'relative', borderBottom: '1px solid #27272A', ...props.style }}>
      {children}
    </div>
  );
};

interface TabsTriggerProps extends Omit<HTMLMotionProps<'button'>, 'value'> {
  value: string;
  asChild?: boolean;
}

export const TabsTrigger = ({ value, asChild = false, children, style, ...props }: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.setValue(value)}
      style={{
        position: 'relative',
        background: 'transparent',
        border: 'none',
        padding: '16px 24px',
        fontSize: '1.05rem',
        fontWeight: isActive ? 600 : 500,
        color: isActive ? '#FFE213' : '#A1A1AA',
        cursor: 'pointer',
        transition: 'color 0.2s',
        ...style,
      }}
      {...(props as any)}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="active-tab-indicator"
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#FFE213',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
};

export const TabContents = ({ children, transition, style, ...props }: React.ComponentProps<'div'> & { transition?: Transition }) => {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }} {...props}>
      <AnimatePresence mode="popLayout" initial={false}>
        {children}
      </AnimatePresence>
    </div>
  );
};

interface TabsContentProps extends Omit<HTMLMotionProps<'div'>, 'value'> {
  value: string;
  asChild?: boolean;
}

export const TabsContent = ({ value, children, ...props }: TabsContentProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
