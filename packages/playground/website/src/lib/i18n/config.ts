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
	'pt-br', // Portuguese (Brazil)
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
	'pt-br': { name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
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

		// Register the locale data with WordPress i18n
		setLocaleData(localeData.default, TEXT_DOMAIN);
	} catch (error) {
		console.warn(`Failed to load locale data for ${locale}:`, error);
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
 * Get locale from URL parameter or storage.
 */
export function getInitialLocale(): SupportedLocale {
	// Check URL parameter first
	if (typeof window !== 'undefined') {
		const urlParams = new URLSearchParams(window.location.search);
		const urlLocale = urlParams.get('locale');
		if (urlLocale && isSupportedLocale(urlLocale)) {
			return urlLocale;
		}

		// Check localStorage
		const storedLocale = localStorage.getItem('playground-locale');
		if (storedLocale && isSupportedLocale(storedLocale)) {
			return storedLocale;
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
