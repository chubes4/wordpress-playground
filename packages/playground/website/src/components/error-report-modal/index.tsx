import React, { useEffect, useState } from 'react';
import { logger } from '@php-wasm/logger';
import { TextareaControl, TextControl } from '@wordpress/components';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';
import { useDispatch } from 'react-redux';
import type {
	PlaygroundDispatch,
	PlaygroundReduxState,
} from '../../lib/state/redux/store';
import { useAppSelector } from '../../lib/state/redux/store';
import { setActiveModal } from '../../lib/state/redux/slice-ui';
import { Modal } from '../../components/modal';
import ModalButtons from '../modal/modal-buttons';
import { useI18n } from '../../lib/i18n';

export function ErrorReportModal(props: { blueprint: BlueprintV1Declaration }) {
	const { __ } = useI18n();
	const activeModal = useAppSelector(
		(state: PlaygroundReduxState) => state.ui.activeModal
	);
	const dispatch: PlaygroundDispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [text, setText] = useState('');
	const [logs, setLogs] = useState('');
	const [url, setUrl] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState('');

	useEffect(() => {
		resetForm();
		setLogs(logger.getLogs().join('\n'));
		setUrl(window.location.href);
	}, [activeModal, logs, setLogs]);

	function resetForm() {
		setText('');
		setLogs('');
		setUrl('');
	}

	function resetSubmission() {
		setSubmitted(false);
		setSubmitError('');
	}

	function onClose() {
		dispatch(setActiveModal(null));
		resetForm();
		resetSubmission();
	}

	function getContext() {
		return {
			...props.blueprint.preferredVersions,
			userAgent: navigator.userAgent,
			...((window.performance as any)?.memory ?? {}),
			window: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		};
	}

	async function onSubmit() {
		setLoading(true);
		const formdata = new FormData();
		formdata.append('description', text);
		if (logs) {
			formdata.append('logs', logs);
		}
		if (url) {
			formdata.append('url', url);
		}
		formdata.append('context', JSON.stringify(getContext()));
		formdata.append('blueprint', JSON.stringify(props.blueprint));
		try {
			const response = await fetch(
				'https://playground.wordpress.net/logger.php',
				{
					method: 'POST',
					body: formdata,
				}
			);
			setSubmitted(true);

			const body = await response.json();
			if (!body.ok) {
				throw new Error(body.error);
			}

			setSubmitError('');
			resetForm();
		} catch (e) {
			setSubmitError((e as Error).message);
		} finally {
			setLoading(false);
		}
	}

	function getTitle() {
		if (!submitted) {
			return __('Report error');
		} else if (submitError) {
			return __('Failed to report the error');
		} else {
			return __('Thank you for reporting the error');
		}
	}

	function getContent() {
		if (!submitted) {
			return (
				<>
					{__(
						'Playground crashed because of an error. You can help resolve the issue by sharing the error details with us.'
					)}
				</>
			);
		} else if (submitError) {
			return (
				<>
					{__(
						'We were unable to submit the error report. Please try again or open an '
					)}
					<a
						href="https://github.com/WordPress/wordpress-playground/issues/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('issue on GitHub.')}
					</a>
				</>
			);
		} else {
			return (
				<>
					{__('Your report has been submitted to the ')}
					<a
						href="https://wordpress.slack.com/archives/C06Q5DCKZ3L"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('Making WordPress #playground-logs Slack channel')}
					</a>
					{__(' and will be reviewed by the team.')}
				</>
			);
		}
	}

	/**
	 * Show the form if the error has not been submitted or if there was an error
	 * submitting it.
	 *
	 * @return {boolean}
	 */
	function showForm() {
		return !submitted || submitError;
	}

	return (
		<Modal title={getTitle()} onRequestClose={onClose} small>
			<p>{getContent()}</p>
			{showForm() && (
				<>
					<TextareaControl
						label={__('How can we recreate this error?')}
						help={__(
							'Describe what caused the error and how can we recreate it.'
						)}
						value={text}
						onChange={setText}
						required={true}
					/>
					<TextareaControl
						label={__('Logs')}
						value={logs}
						onChange={setLogs}
					/>

					<TextControl
						label={__('Url')}
						value={url}
						onChange={setUrl}
					/>

					<ModalButtons
						areBusy={loading}
						areDisabled={loading || !text}
						onCancel={onClose}
						onSubmit={onSubmit}
						submitText="Report error"
					/>
				</>
			)}
		</Modal>
	);
}
