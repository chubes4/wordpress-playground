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
export function GithubExportMenuItem({ onClose, disabled }: Props) {
	const { __ } = useI18n();
	const dispatch: PlaygroundDispatch = useDispatch();
	return (
		<MenuItem
			aria-label={__(
				'Export WordPress theme, plugin, or wp-content directory to a GitHub repository as a Pull Request.'
			)}
			disabled={disabled}
			onClick={() => {
				dispatch(setActiveModal(modalSlugs.GITHUB_EXPORT));
				onClose();
			}}
		>
			{__('Export to GitHub')}
		</MenuItem>
	);
}
