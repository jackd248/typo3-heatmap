<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS extension "typo3_heatmap".
 *
 * Copyright (C) 2025 Konrad Michalik <hej@konradmichalik.dev>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

namespace KonradMichalik\Typo3Heatmap\EventListener;

use KonradMichalik\Typo3Heatmap\Configuration;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Template\Components\ButtonBar;
use TYPO3\CMS\Backend\Template\Components\ModifyButtonBarEvent;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;

readonly class ModifyButtonBarEventListener
{
    public function __construct(
        private IconFactory $iconFactory
    ) {}

    public function __invoke(ModifyButtonBarEvent $event): void
    {
        /** @var ServerRequestInterface $request */
        $request = $GLOBALS['TYPO3_REQUEST'];

        $buttons = $event->getButtons();
        $buttonBar = $event->getButtonBar();

        if (!$this->isBackendUserEditForm($request)) {
            return;
        }

        $userId = $this->getUserIdFromRequest($request);
        if ($userId === 0) {
            return;
        }

        $userActivityButton = $buttonBar->makeLinkButton()
            ->setHref('#')
            ->setTitle($this->getLanguageService()->sL('LLL:EXT:' . Configuration::EXT_KEY . '/Resources/Private/Language/locallang.xlf:modal.user_activity.button'))
            ->setIcon($this->iconFactory->getIcon('actions-heatmap', 'small'))
            ->setClasses('user-activity-modal-btn')
            ->setDataAttributes([
                'user-id' => (string)$userId,
                'action' => 'open-user-activity-modal',
            ]);

        $buttons[ButtonBar::BUTTON_POSITION_RIGHT][2][] = $userActivityButton;

        $pageRenderer = GeneralUtility::makeInstance(PageRenderer::class);
        $pageRenderer->loadJavaScriptModule('@KonradMichalik/Typo3Heatmap/user-activity-modal.js');
        $pageRenderer->addInlineLanguageLabelFile('EXT:' . Configuration::EXT_KEY . '/Resources/Private/Language/locallang.xlf');
        $pageRenderer->addCssFile('EXT:' . Configuration::EXT_KEY . '/Resources/Public/Css/Styles.css');

        $event->setButtons($buttons);
    }

    private function isBackendUserEditForm(ServerRequestInterface $request): bool
    {
        $routeIdentifier = $request->getAttribute('route')?->getOption('_identifier'); // @phpstan-ignore-line phpstanTypo3.requestAttributeValidation
        if ($routeIdentifier !== 'record_edit') {
            return false;
        }

        $queryParams = $request->getQueryParams();
        $edit = $queryParams['edit'] ?? [];

        return isset($edit['be_users']);
    }

    private function getUserIdFromRequest(ServerRequestInterface $request): int
    {
        $queryParams = $request->getQueryParams();
        $edit = $queryParams['edit'] ?? [];

        if (!isset($edit['be_users'])) {
            return 0;
        }

        $beUsersEdit = $edit['be_users'];

        foreach ($beUsersEdit as $userId => $action) {
            if ($userId !== 'NEW' && is_numeric($userId)) {
                return (int)$userId;
            }
        }

        return 0;
    }

    private function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
