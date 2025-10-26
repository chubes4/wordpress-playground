/**
 * I18n Provider Component
 *
 * This component initializes the i18n system and provides
 * locale management throughout the application.
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
	getInitialLocale,
	initializeLocale,
	saveLocale,
	type SupportedLocale,
} from './config';

export interface I18nProviderProps {
	children: ReactNode;
	/**
	 * Optional initial locale. If not provided, will be determined
	 * from URL params, localStorage, or browser settings.
	 */
	initialLocale?: SupportedLocale;
}

/**
 * Provider component that initializes the i18n system.
 *
 * This component should wrap the entire application to ensure
 * translations are available throughout the component tree.
 *
 * @example
 * ```tsx
 * import { I18nProvider } from '@/lib/i18n';
 *
 * function App() {
 *   return (
 *     <I18nProvider>
 *       <YourApp />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider({
	children,
	initialLocale,
}: I18nProviderProps): JSX.Element {
	const [locale, setLocale] = useState<SupportedLocale>(() => {
		const detectedLocale = initialLocale || getInitialLocale();
		console.log('[i18n] Detected locale:', detectedLocale);
		return detectedLocale;
	});
	const [isLoading, setIsLoading] = useState(true);

	// Initialize the locale on mount and when locale changes
	useEffect(() => {
		let isCancelled = false;

		async function loadLocale() {
			setIsLoading(true);
			try {
				await initializeLocale(locale);
				if (!isCancelled) {
					saveLocale(locale);
					setIsLoading(false);
				}
			} catch (error) {
				console.error('Failed to initialize locale:', error);
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		}

		loadLocale();

		return () => {
			isCancelled = true;
		};
	}, [locale]);

	// Expose locale change function globally for debugging/testing
	useEffect(() => {
		if (typeof window !== 'undefined') {
			(window as any).__setPlaygroundLocale = (
				newLocale: SupportedLocale
			) => {
				setLocale(newLocale);
			};
		}

		return () => {
			if (typeof window !== 'undefined') {
				delete (window as any).__setPlaygroundLocale;
			}
		};
	}, []);

	// Render children immediately - translations will update when loaded
	// This prevents blocking the entire UI on locale loading
	return <>{children}</>;
}
