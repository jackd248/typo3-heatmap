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

namespace KonradMichalik\Typo3Heatmap\Widgets;

use KonradMichalik\Typo3Heatmap\Configuration;
use KonradMichalik\Typo3Heatmap\Utility\ViewFactoryHelper;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Core\Site\Entity\SiteLanguage;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Dashboard\Widgets\AdditionalCssInterface;
use TYPO3\CMS\Dashboard\Widgets\ButtonProviderInterface;
use TYPO3\CMS\Dashboard\Widgets\JavaScriptInterface;
use TYPO3\CMS\Dashboard\Widgets\ListDataProviderInterface;
use TYPO3\CMS\Dashboard\Widgets\RequestAwareWidgetInterface;
use TYPO3\CMS\Dashboard\Widgets\WidgetConfigurationInterface;
use TYPO3\CMS\Dashboard\Widgets\WidgetInterface;

class Heatmap implements WidgetInterface, RequestAwareWidgetInterface, AdditionalCssInterface, JavaScriptInterface
{
    protected ServerRequestInterface $request;

    public function __construct(
        protected readonly WidgetConfigurationInterface $configuration,
        protected readonly ListDataProviderInterface $dataProvider,
        protected readonly ?ButtonProviderInterface $buttonProvider = null,
        protected array $options = []
    ) {}

    public function setRequest(ServerRequestInterface $request): void
    {
        $this->request = $request;
    }

    public function renderWidgetContent(): string
    {
        $language = $this->request->getAttribute('language', 'en-GB');
        return ViewFactoryHelper::renderView(
            'Heatmap.html',
            [
                'configuration' => $this->configuration,
                'records' => $this->dataProvider->getItems(),
                'button' => $this->buttonProvider,
                'options' => $this->getOptions(),
                'version' => GeneralUtility::makeInstance(Typo3Version::class)->getMajorVersion(),
                'locale' => $language instanceof SiteLanguage ? $language->getLocale() : $language,
            ]
        );
    }

    public function getOptions(): array
    {
        $defaultOptions = [
            'tooltipItemSingular' => 'LLL:EXT:typo3_heatmap/Resources/Private/Language/locallang.xlf:tooltip.content.singular',
            'tooltipItemPlural' => 'LLL:EXT:typo3_heatmap/Resources/Private/Language/locallang.xlf:tooltip.content.plural',
        ];
        return array_merge($defaultOptions, $this->options);
    }

    public function getCssFiles(): array
    {
        return ['EXT:' . Configuration::EXT_KEY . '/Resources/Public/Css/Styles.css'];
    }

    public function getJavaScriptModuleInstructions(): array
    {
        return [
            JavaScriptModuleInstruction::create('@KonradMichalik/Typo3Heatmap/heatmap.js'),
        ];
    }
}
