import { MenuItem } from '@wordpress/components';

import { useDispatch } from 'react-redux';
import type { PlaygroundDispatch } from '../../lib/state/redux/store';
import { setActiveModal } from '../../lib/state/redux/slice-ui';
import { modalSlugs } from '../layout';
import { useI18n } from '../../lib/i18n';

type Props = { onClose: () => void; disabled?: boolean };
export function ReportError({ onClose, disabled }: Props) {
	const { __ } = useI18n();
	const dispatch: PlaygroundDispatch = useDispatch();
	return (
		<MenuItem
			data-cy="report-error"
			aria-label={__('Report an error in Playground')}
			disabled={disabled}
			onClick={() => {
				dispatch(setActiveModal(modalSlugs.ERROR_REPORT));
				onClose();
			}}
		>
			{__('Report error')}
		</MenuItem>
	);
}
