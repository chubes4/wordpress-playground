import { useState } from 'react';
import Button from '../button';
import {
	getActiveClientInfo,
	useAppSelector,
} from '../../lib/state/redux/store';
import { useI18n } from '../../lib/i18n';

export function SyncLocalFilesButton() {
	const { client, url, opfsMountDescriptor } =
		useAppSelector(getActiveClientInfo) || {};
	const [isSyncing, setIsSyncing] = useState(false);
	const { __ } = useI18n();
	return (
		<Button
			variant="browser-chrome"
			onClick={async () => {
				setIsSyncing(true);
				try {
					const docroot = await client!.documentRoot;
					await client!.unmountOpfs(docroot);

					await client!.mountOpfs({
						device: opfsMountDescriptor!.device,
						mountpoint: docroot,
						initialSyncDirection: 'opfs-to-memfs',
					});
					// @TODO Report error to avoid confusion on silent failure.
				} finally {
					setIsSyncing(false);
				}
				await client!.goTo(url!);
			}}
		>
			{isSyncing ? __('Syncing...') : __('Sync local files')}
		</Button>
	);
}
