import { Icon } from '@wordpress/components';
import { ClockIcon, folder, layout } from '@wp-playground/components';
import css from './style.module.css';
import type { SiteStorageType } from '../../../lib/state/redux/slice-sites';
import { useI18n } from '../../../lib/i18n';

export function StorageType({ type }: { type: SiteStorageType }) {
	const { __ } = useI18n();
	switch (type) {
		case 'local-fs':
			return (
				<div className={css.storageType}>
					<Icon size={16} icon={folder} />
					<span>{__('Local')}</span>
				</div>
			);
		case 'opfs':
			return (
				<div className={css.storageType}>
					<Icon size={16} icon={layout} />
					<span>{__('Browser')}</span>
				</div>
			);
		case 'none':
			return (
				<div className={css.storageType}>
					<ClockIcon />
					<span>{__('Temporary')}</span>
				</div>
			);
	}
}
