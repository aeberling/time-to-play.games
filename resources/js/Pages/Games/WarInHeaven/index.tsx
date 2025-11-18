import { lazy } from 'react';

/**
 * War in Heaven Game Entry Point
 *
 * Lazy loads the main game component for code splitting
 */
export const WarInHeaven = lazy(() => import('./WarInHeavenGame'));

export default WarInHeaven;
