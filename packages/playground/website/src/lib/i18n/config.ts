/**
 * i18n Configuration for WordPress Playground Website
 *
 * This module provides configuration and initialization for the
 * WordPress i18n package (@wordpress/i18n).
 */

import { setLocaleData } from '@wordpress/i18n';

/**
 * The text domain for the WordPress Playground website.
 * Used to scope translations to this specific application.
 */
export const TEXT_DOMAIN = 'playground-website';

/**
 * Default locale for the application.
 */
export const DEFAULT_LOCALE = 'en';

/**
 * Supported locales for the application.
 * Add new locales here as translations become available.
 */
export const SUPPORTED_LOCALES = [
	'en', // English
	'es', // Spanish
	'pt', // Portuguese
	'ja', // Japanese
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Locale metadata including display names.
 */
export const LOCALE_METADATA: Record<
	SupportedLocale,
	{ name: string; nativeName: string }
> = {
	en: { name: 'English', nativeName: 'English' },
	es: { name: 'Spanish', nativeName: 'Español' },
	pt: { name: 'Portuguese', nativeName: 'Português' },
	ja: { name: 'Japanese', nativeName: '日本語' },
};

/**
 * Validate if a string is a supported locale.
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
	return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Initialize locale data for a specific locale.
 * This function loads translation data and registers it with @wordpress/i18n.
 *
 * @param locale - The locale code to initialize
 */
export async function initializeLocale(locale: SupportedLocale): Promise<void> {
	// For English, we don't need to load any translations
	if (locale === DEFAULT_LOCALE) {
		return;
	}

	try {
		// Dynamically import the locale data
		const localeData = await import(`./locales/${locale}.json`);

		console.log(`[i18n] Loading locale: ${locale}`);
		console.log('[i18n] Locale data:', localeData.default);

		// Register the locale data with WordPress i18n
		// setLocaleData expects the locale_data property from the Jed format
		setLocaleData(localeData.default.locale_data[TEXT_DOMAIN], TEXT_DOMAIN);

		console.log(`[i18n] Successfully loaded ${locale} translations`);
	} catch (error) {
		console.error(
			`[i18n] Failed to load locale data for ${locale}:`,
			error
		);
		// Fall back to default locale (English) on error
	}
}

/**
 * Get the browser's preferred locale from available options.
 */
export function getBrowserLocale(): SupportedLocale {
	if (typeof navigator === 'undefined') {
		return DEFAULT_LOCALE;
	}

	// Get browser languages in order of preference
	const browserLanguages = navigator.languages || [navigator.language];

	// Find the first supported locale
	for (const lang of browserLanguages) {
		// Normalize to lowercase and check exact match
		const normalizedLang = lang.toLowerCase();
		if (isSupportedLocale(normalizedLang)) {
			return normalizedLang;
		}

		// Check language without region (e.g., 'pt' from 'pt-BR')
		const baseLang = normalizedLang.split('-')[0];
		if (isSupportedLocale(baseLang)) {
			return baseLang;
		}

		// Check with hyphen normalized to match our format (e.g., 'pt-br')
		const hyphenatedLang = normalizedLang.replace('_', '-');
		if (isSupportedLocale(hyphenatedLang)) {
			return hyphenatedLang;
		}
	}

	return DEFAULT_LOCALE;
}

/**
 * Normalize locale string to match our supported format.
 * Converts WordPress locale format (e.g., 'pt_BR') to our format (e.g., 'pt-br').
 */
function normalizeLocaleString(locale: string): string {
	return locale.toLowerCase().replace(/_/g, '-');
}

/**
 * Match a locale string to a supported locale, with fallback to base language.
 * Examples:
 *   - 'pt-pt' -> 'pt'
 *   - 'pt-br' -> 'pt'
 *   - 'es-mx' -> 'es'
 *   - 'es-es' -> 'es'
 */
function matchSupportedLocale(locale: string): SupportedLocale | null {
	const normalized = normalizeLocaleString(locale);

	// Try exact match first
	if (isSupportedLocale(normalized)) {
		return normalized;
	}

	// Try base language (e.g., 'pt' from 'pt-pt')
	const baseLang = normalized.split('-')[0];
	if (isSupportedLocale(baseLang)) {
		return baseLang;
	}

	return null;
}

/**
 * Get locale from URL parameter or storage.
 */
export function getInitialLocale(): SupportedLocale {
	if (typeof window !== 'undefined') {
		const urlParams = new URLSearchParams(window.location.search);

		// Check 'locale' parameter
		const urlLocale = urlParams.get('locale');
		if (urlLocale) {
			const matched = matchSupportedLocale(urlLocale);
			if (matched) {
				return matched;
			}
		}

		// Check 'language' parameter (WordPress format like 'pt_BR')
		const languageParam = urlParams.get('language');
		if (languageParam) {
			const matched = matchSupportedLocale(languageParam);
			if (matched) {
				return matched;
			}
		}

		// Only check localStorage if no URL parameters were provided
		// This ensures URL parameters always take precedence
		if (!urlLocale && !languageParam) {
			const storedLocale = localStorage.getItem('playground-locale');
			if (storedLocale && isSupportedLocale(storedLocale)) {
				return storedLocale;
			}
		}
	}

	// Fall back to browser locale
	return getBrowserLocale();
}

/**
 * Save the current locale to localStorage.
 */
export function saveLocale(locale: SupportedLocale): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem('playground-locale', locale);
	}
}
