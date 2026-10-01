import { useCallback, useEffect, useState } from "react";

// Small auto-dismissing toast state shared by the institute pages
export default function useToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback(
    (message, tone = "success") => setToast({ message, tone }),
    []
  );

  return [toast, notify];
}
