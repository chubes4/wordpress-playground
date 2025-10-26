/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { useMediaQuery } from '@wordpress/compose';
import { Dropdown, Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import { SiteManagerIcon } from '@wp-playground/components';

/**
 * Internal dependencies
 */
import css from './style.module.css';
import AddressBar from '../address-bar';
import {
	useAppSelector,
	getActiveClientInfo,
	useActiveSite,
	useAppDispatch,
} from '../../lib/state/redux/store';
import { SyncLocalFilesButton } from '../sync-local-files-button';
import { Modal } from '../../components/modal';
import Button from '../button';
import { ActiveSiteSettingsForm } from '../site-manager/site-settings-form';
import { setSiteManagerOpen } from '../../lib/state/redux/slice-ui';
import { useI18n } from '../../lib/i18n';

interface BrowserChromeProps {
	children?: React.ReactNode;
	className?: string;
}

export default function BrowserChrome({
	children,
	className,
}: BrowserChromeProps) {
	const { __ } = useI18n();
	const clientInfo = useAppSelector(getActiveClientInfo);
	const activeSite = useActiveSite();
	const showAddressBar = !!clientInfo;
	const url = clientInfo?.url;
	const dispatch = useAppDispatch();
	const siteManagerIsOpen = useAppSelector(
		(state) => state.ui.siteManagerIsOpen
	);
	const addressBarClass = classNames(css.addressBarSlot, {
		[css.isHidden]: !showAddressBar,
	});
	const wrapperClass = classNames(
		css.wrapper,
		css.hasFullSizeWindow,
		className
	);
	const isMobileUi = useMediaQuery('(max-width: 875px)');
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const onToggle = () => setIsModalOpen(!isModalOpen);
	const closeModal = () => setIsModalOpen(false);

	return (
		<div className={wrapperClass} data-cy="simulated-browser">
			<div className={`${css.window} browser-chrome-window`}>
				<header
					className={classNames(css.toolbar, {
						[css.withSidebarOpen]: siteManagerIsOpen,
					})}
					aria-label={__('Playground toolbar')}
				>
					<div className={addressBarClass}>
						<AddressBar
							url={url}
							onUpdate={(newUrl) =>
								clientInfo?.client.goTo(newUrl)
							}
						/>
					</div>

					<div className={css.toolbarButtons}>
						<Button
							variant="browser-chrome"
							aria-label={
								siteManagerIsOpen
									? __('Close Site Manager')
									: __('Open Site Manager')
							}
							aria-pressed={siteManagerIsOpen}
							className={classNames(css.openSiteManagerButton, {
								[css.openSiteManagerButtonActive]:
									siteManagerIsOpen,
							})}
							onClick={() => {
								dispatch(
									setSiteManagerOpen(!siteManagerIsOpen)
								);
							}}
						>
							<SiteManagerIcon
								sidebarActive={siteManagerIsOpen}
							/>
						</Button>

						{isMobileUi ? (
							<>
								<Button
									variant="browser-chrome"
									aria-label={__('Edit Playground settings')}
									onClick={onToggle}
									aria-expanded={isModalOpen}
									style={{
										fill: '#FFF',
										alignItems: 'center',
										display: 'flex',
									}}
								>
									<Icon icon={cog} size={28} />
								</Button>
								{isModalOpen && (
									<Modal
										isFullScreen={true}
										title={__('Playground settings')}
										onRequestClose={closeModal}
									>
										<ActiveSiteSettingsForm
											onSubmit={closeModal}
										/>
									</Modal>
								)}
							</>
						) : (
							<Dropdown
								className="my-container-class-name"
								contentClassName="my-dropdown-content-classname"
								popoverProps={{ placement: 'bottom-start' }}
								renderToggle={({ isOpen, onToggle }) => (
									<Button
										variant="browser-chrome"
										aria-label={__(
											'Edit Playground settings'
										)}
										onClick={onToggle}
										aria-expanded={isOpen}
										style={{
											fill: '#FFF',
											alignItems: 'center',
											display: 'flex',
										}}
									>
										<Icon icon={cog} size={28} />
									</Button>
								)}
								renderContent={({ onClose }) => (
									<div
										style={{
											width: 400,
											maxWidth: '100vw',
											padding: 0,
										}}
									>
										<div className={css.headerSection}>
											<h2 style={{ margin: 0 }}>
												{__('Playground settings')}
											</h2>
										</div>
										<ActiveSiteSettingsForm
											onSubmit={onClose}
										/>
									</div>
								)}
							/>
						)}
						{activeSite?.metadata?.storage === 'local-fs' ? (
							<SyncLocalFilesButton />
						) : null}
					</div>
				</header>
				<div className={css.content}>{children}</div>
			</div>
		</div>
	);
}
