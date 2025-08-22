import { useEffect, useLayoutEffect } from 'react';

// Hook que funciona tanto no servidor quanto no cliente
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;