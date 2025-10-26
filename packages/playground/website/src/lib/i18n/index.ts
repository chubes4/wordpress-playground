/**
 * i18n module for WordPress Playground Website
 *
 * This module exports all i18n-related utilities, hooks, and configuration.
 * Import from this file to access translation functionality throughout the app.
 *
 * @example
 * ```tsx
 * import { useI18n } from '@/lib/i18n';
 *
 * function MyComponent() {
 *   const { __ } = useI18n();
 *   return <h1>{__('Welcome to Playground')}</h1>;
 * }
 * ```
 */

export * from './config';
export * from './use-i18n';
export { I18nProvider } from './provider';
