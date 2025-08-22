import { useEffect, useState } from 'react';

// Hook para detectar se o componente foi hidratado
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}