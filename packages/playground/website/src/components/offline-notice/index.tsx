import { Notice } from '@wordpress/components';
import css from './style.module.css';
import { useI18n } from '../../lib/i18n';

export function OfflineNotice() {
	const { __ } = useI18n();
	return (
		<Notice
			status="warning"
			isDismissible={false}
			className={css.offlineNotice}
		>
			{__('Some features may not available because you are offline.')}
		</Notice>
	);
}
