import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

export function SplashScreen({ finishLoading }: { finishLoading: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState<number>(0);
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    
    // Safety fallback: force hide after 6 seconds
    timers.push(setTimeout(() => setForceHide(true), 6000));
    
    if (shouldReduceMotion || finishLoading) {
      timers.push(setTimeout(() => setStep(7), 10)); // jump to end state
    } else {
      timers.push(setTimeout(() => setStep(1), 100)); // triangle appears
      timers.push(setTimeout(() => setStep(2), 200)); // triangle -> roof
      timers.push(setTimeout(() => setStep(3), 300)); // draw walls
      timers.push(setTimeout(() => setStep(4), 400)); // window
      timers.push(setTimeout(() => setStep(5), 500)); // door
      timers.push(setTimeout(() => setStep(6), 600)); // brand
      timers.push(setTimeout(() => setStep(7), 700)); // tagline
    }

    return () => timers.forEach(clearTimeout);
  }, [shouldReduceMotion, finishLoading]);

  // Only exit if finishLoading is true AND our minimum sequence is done (step 7) OR if forceHide is triggered
  const isReadyToHide = finishLoading || forceHide;

  return (
    <AnimatePresence>
      {!isReadyToHide && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <motion.div
            animate={ step >= 7 && !finishLoading && !shouldReduceMotion ? { opacity: [1, 0.6, 1] } : { opacity: 1 } }
            transition={ step >= 7 && !finishLoading ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {} }
            className="flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: step >= 1 ? 1 : 0.92, opacity: step >= 1 ? 1 : 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
              className="relative flex justify-center items-center"
            >
              <svg viewBox="0 0 100 100" className="w-[100px] h-[100px] md:w-[130px] md:h-[130px]">
                {/* Floor of the initial triangle (disappears in step 2) */}
                <motion.path
                  d="M 20 75 L 80 75"
                  fill="none"
                  stroke="#4aa4f0"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: step >= 2 ? 0 : 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
                />

                {/* Chevron (Triangle top -> Roof) */}
                <motion.path
                  d={step >= 2 ? "M 10 55 L 50 15 L 90 55" : "M 20 75 L 50 15 L 80 75"}
                  fill="none"
                  stroke="#4aa4f0"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={false}
                  animate={{ d: step >= 2 ? "M 10 55 L 50 15 L 90 55" : "M 20 75 L 50 15 L 80 75" }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeInOut" }}
                />

                {/* Left Wall */}
                <motion.path
                  d="M 20 45 L 20 85"
                  fill="none"
                  stroke="#4aa4f0"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: step >= 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeInOut" }}
                />

                {/* Right Wall */}
                <motion.path
                  d="M 80 45 L 80 85"
                  fill="none"
                  stroke="#4aa4f0"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: step >= 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeInOut" }}
                />

                {/* Base */}
                <motion.path
                  d="M 20 85 L 80 85"
                  fill="none"
                  stroke="#4aa4f0"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: step >= 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeInOut" }}
                />

                {/* Window */}
                <motion.g
                  fill="#4aa4f0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: step >= 4 ? 1 : 0, scale: step >= 4 ? 1 : 0.8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                  style={{ originX: "50px", originY: "45px" }}
                >
                  <rect x="40" y="35" width="8" height="8" rx="1.5" />
                  <rect x="52" y="35" width="8" height="8" rx="1.5" />
                  <rect x="40" y="47" width="8" height="8" rx="1.5" />
                  <rect x="52" y="47" width="8" height="8" rx="1.5" />
                </motion.g>

                {/* Door */}
                <motion.rect
                  x="42"
                  width="16"
                  fill="#8cc63f"
                  rx="1.5"
                  initial={{ y: 85, height: 0, opacity: 0 }}
                  animate={{ y: step >= 5 ? 61 : 85, height: step >= 5 ? 24 : 0, opacity: step >= 5 ? 1 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 6 ? 1 : 0, y: step >= 6 ? 0 : 10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
              className="mt-6 text-3xl md:text-4xl font-bold tracking-tight text-[#4aa4f0]"
            >
              Tenan<span className="text-[#8cc63f]">TO</span>wners
            </motion.div>
            
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: step >= 7 ? 1 : 0, y: step >= 7 ? 0 : 5 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
              className="mt-2 text-sm md:text-base font-semibold tracking-wide text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
            >
              <span>Trust</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#8cc63f]" />
              <span>Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#8cc63f]" />
              <span>Repeat</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
