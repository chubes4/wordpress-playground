import React from 'react';
import { useDispatch } from 'react-redux';
import { usePlaygroundClient } from '../../lib/use-playground-client';
import ImportForm from '../import-form/index';
import { Modal } from '../../components/modal';
import { setActiveModal } from '../../lib/state/redux/slice-ui';
import type { PlaygroundDispatch } from '../../lib/state/redux/store';
import { useI18n } from '../../lib/i18n';

export const ImportFormModal = () => {
	const { __ } = useI18n();
	const playground = usePlaygroundClient();
	const dispatch: PlaygroundDispatch = useDispatch();

	const closeModal = () => {
		dispatch(setActiveModal(null));
	};
	function handleImported() {
		// eslint-disable-next-line no-alert
		alert(
			__(
				'File imported! This Playground instance has been updated. Refreshing now.'
			)
		);
		closeModal();
		playground!.goTo('/');
	}

	return (
		<Modal
			title={__('Import Playground')}
			contentLabel={__(
				'This is a dialog window which overlays the main content of the page. The modal begins with a heading 2 called "Import Playground". Pressing the Close Import Window will close the modal and bring you back to where you were on the page.'
			)}
			onRequestClose={closeModal}
		>
			<ImportForm
				playground={playground!}
				onClose={closeModal}
				onImported={handleImported}
			/>
		</Modal>
	);
};
