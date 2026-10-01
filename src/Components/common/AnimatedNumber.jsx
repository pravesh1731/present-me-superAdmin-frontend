import React, { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Counts up (or down) to `value` with an ease-out curve. Snaps instantly for people who
// have asked their OS to reduce motion.
export default function AnimatedNumber({ value, format, duration = 700 }) {
  const target = Number(value) || 0;
  const [shown, setShown] = useState(prefersReducedMotion() ? target : 0);
  const current = useRef(shown);

  useEffect(() => {
    if (prefersReducedMotion() || current.current === target) {
      current.current = target;
      setShown(target);
      return undefined;
    }

    const from = current.current;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;

      current.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  const rounded = Math.round(shown);
  return <>{format ? format(rounded) : rounded.toLocaleString("en-IN")}</>;
}
