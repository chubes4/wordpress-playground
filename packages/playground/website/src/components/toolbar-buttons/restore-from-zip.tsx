import { MenuItem } from '@wordpress/components';
import { setActiveModal } from '../../lib/state/redux/slice-ui';
import type { PlaygroundDispatch } from '../../lib/state/redux/store';
import { useDispatch } from 'react-redux';
import { modalSlugs } from '../layout';
import { useI18n } from '../../lib/i18n';

type Props = { text?: string; onClose: () => void; disabled: boolean };
export function RestoreFromZipMenuItem({ text, onClose, disabled }: Props) {
	const { __ } = useI18n();
	const dispatch: PlaygroundDispatch = useDispatch();
	const defaultText = __('Restore from .zip');

	return (
		<MenuItem
			data-cy="restore-from-zip"
			aria-label={__('Import a .zip file into the current Playground')}
			onClick={() => {
				dispatch(setActiveModal(modalSlugs.IMPORT_FORM));
				if (typeof onClose === 'function') {
					onClose();
				}
			}}
			disabled={disabled}
		>
			{text || defaultText}
		</MenuItem>
	);
}
