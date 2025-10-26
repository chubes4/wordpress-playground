import { Button, Flex } from '@wordpress/components';
import React from 'react';
import { useI18n } from '../../lib/i18n';
import css from './style.module.css';

interface ModalButtonsProps {
	submitText?: string;
	areDisabled?: boolean;
	areBusy?: boolean;
	onCancel?: () => void;
	onSubmit?: (e: any) => void;
	style?: React.CSSProperties;
}
export default function ModalButtons({
	submitText,
	areDisabled = false,
	areBusy,
	onCancel,
	onSubmit,
	style,
}: ModalButtonsProps) {
	const { __ } = useI18n();
	const defaultSubmitText = __('Submit');

	return (
		<Flex justify="end" className={css.modalButtons} style={style}>
			<Button
				type="button"
				isBusy={areBusy}
				disabled={areDisabled}
				variant="link"
				onClick={onCancel}
			>
				{__('Cancel')}
			</Button>
			<Button
				type="submit"
				isBusy={areBusy}
				disabled={areDisabled}
				variant="primary"
				onClick={onSubmit}
			>
				{submitText || defaultSubmitText}
			</Button>
		</Flex>
	);
}
