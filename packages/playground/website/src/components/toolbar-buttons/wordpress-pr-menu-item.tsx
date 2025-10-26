import { MenuItem } from '@wordpress/components';
import { setActiveModal } from '../../lib/state/redux/slice-ui';
import type { PlaygroundDispatch } from '../../lib/state/redux/store';
import { useDispatch } from 'react-redux';
import { modalSlugs } from '../layout';
import { useI18n } from '../../lib/i18n';

interface Props {
	onClose: () => void;
	disabled?: boolean;
}
export function WordPressPRMenuItem({ onClose, disabled }: Props) {
	const { __ } = useI18n();
	const dispatch: PlaygroundDispatch = useDispatch();
	return (
		<MenuItem
			aria-label={__('Preview WordPress Core PR')}
			disabled={disabled}
			onClick={() => {
				dispatch(setActiveModal(modalSlugs.PREVIEW_PR_WP));
				onClose();
			}}
		>
			{__('WordPress Core PR')}
		</MenuItem>
	);
}
