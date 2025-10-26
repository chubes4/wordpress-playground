/**
 * Custom React hook for i18n functionality.
 *
 * This hook provides a convenient way to access WordPress i18n functions
 * within React components, with proper text domain scoping.
 */

import { useCallback, useMemo } from 'react';
import {
	__ as wpTranslate,
	_x as wpTranslateWithContext,
	_n as wpTranslatePlural,
	_nx as wpTranslatePluralWithContext,
	sprintf,
	isRTL,
} from '@wordpress/i18n';
import { TEXT_DOMAIN } from './config';

/**
 * Translation functions with automatic text domain binding.
 */
export interface I18nFunctions {
	/**
	 * Translate a string.
	 *
	 * @param text - The text to translate
	 * @returns The translated text
	 *
	 * @example
	 * const { __ } = useI18n();
	 * const text = __('Save Playground');
	 */
	__(text: string): string;

	/**
	 * Translate a string with context.
	 * Context helps disambiguate identical strings with different meanings.
	 *
	 * @param text - The text to translate
	 * @param context - The context for the translation
	 * @returns The translated text
	 *
	 * @example
	 * const { _x } = useI18n();
	 * // "Save" as in "download"
	 * const saveButton = _x('Save', 'button label');
	 * // "Save" as in "rescue"
	 * const saveAction = _x('Save', 'action verb');
	 */
	_x(text: string, context: string): string;

	/**
	 * Translate a string with plural forms.
	 *
	 * @param singular - The singular form
	 * @param plural - The plural form
	 * @param count - The number that determines which form to use
	 * @returns The translated text in the appropriate form
	 *
	 * @example
	 * const { _n } = useI18n();
	 * const text = _n('1 file', '%d files', fileCount);
	 */
	_n(singular: string, plural: string, count: number): string;

	/**
	 * Translate a string with plural forms and context.
	 *
	 * @param singular - The singular form
	 * @param plural - The plural form
	 * @param count - The number that determines which form to use
	 * @param context - The context for the translation
	 * @returns The translated text in the appropriate form
	 *
	 * @example
	 * const { _nx } = useI18n();
	 * const text = _nx('1 item', '%d items', count, 'shopping cart');
	 */
	_nx(
		singular: string,
		plural: string,
		count: number,
		context: string
	): string;

	/**
	 * Format a string with placeholders.
	 *
	 * @param format - The format string with %s, %d, etc.
	 * @param args - Values to substitute into the format string
	 * @returns The formatted string
	 *
	 * @example
	 * const { sprintf } = useI18n();
	 * const text = sprintf('Saving %d / %d files...', current, total);
	 */
	sprintf(format: string, ...args: (string | number)[]): string;

	/**
	 * Check if the current locale uses right-to-left text direction.
	 *
	 * @returns true if the locale is RTL, false otherwise
	 *
	 * @example
	 * const { isRTL } = useI18n();
	 * const direction = isRTL() ? 'rtl' : 'ltr';
	 */
	isRTL(): boolean;
}

/**
 * Hook that provides i18n translation functions.
 *
 * All translation functions are automatically bound to the
 * WordPress Playground text domain.
 *
 * @returns Object containing translation functions
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const { __ } = useI18n();
 *   return <button>{__('Save')}</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function FileCounter({ count }: { count: number }) {
 *   const { _n, sprintf } = useI18n();
 *   const text = sprintf(
 *     _n('Saving %d file...', 'Saving %d files...', count),
 *     count
 *   );
 *   return <div>{text}</div>;
 * }
 * ```
 */
export function useI18n(): I18nFunctions {
	// Memoize the translation function to avoid recreating on every render
	const __ = useCallback((text: string): string => {
		return wpTranslate(text, TEXT_DOMAIN);
	}, []);

	const _x = useCallback((text: string, context: string): string => {
		return wpTranslateWithContext(text, context, TEXT_DOMAIN);
	}, []);

	const _n = useCallback(
		(singular: string, plural: string, count: number): string => {
			return wpTranslatePlural(singular, plural, count, TEXT_DOMAIN);
		},
		[]
	);

	const _nx = useCallback(
		(
			singular: string,
			plural: string,
			count: number,
			context: string
		): string => {
			return wpTranslatePluralWithContext(
				singular,
				plural,
				count,
				context,
				TEXT_DOMAIN
			);
		},
		[]
	);

	// Return all i18n functions as a stable object
	return useMemo(
		() => ({
			__,
			_x,
			_n,
			_nx,
			sprintf,
			isRTL,
		}),
		[__, _x, _n, _nx]
	);
}
