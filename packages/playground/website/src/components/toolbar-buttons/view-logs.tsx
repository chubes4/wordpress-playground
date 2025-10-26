import { MenuItem } from '@wordpress/components';
import { details } from '@wordpress/icons';

import { useDispatch } from 'react-redux';
import type { PlaygroundDispatch } from '../../lib/state/redux/store';
import { setActiveModal } from '../../lib/state/redux/slice-ui';
import { modalSlugs } from '../layout';
import { useI18n } from '../../lib/i18n';

type Props = { onClose: () => void };
export function ViewLogs({ onClose }: Props) {
	const { __ } = useI18n();
	const dispatch: PlaygroundDispatch = useDispatch();
	return (
		<MenuItem
			icon={details}
			iconPosition="left"
			data-cy="view-logs"
			aria-label={__('View logs')}
			onClick={() => {
				dispatch(setActiveModal(modalSlugs.LOG));
				onClose();
			}}
		>
			{__('View logs')}
		</MenuItem>
	);
}
