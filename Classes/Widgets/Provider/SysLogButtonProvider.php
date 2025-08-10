<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS extension "typo3_heatmap_widget".
 *
 * Copyright (C) 2023-2025 Konrad Michalik <hej@konradmichalik.dev>
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

namespace KonradMichalik\Typo3HeatmapWidget\Widgets\Provider;

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Dashboard\Widgets\ButtonProviderInterface;
use TYPO3\CMS\Dashboard\Widgets\ElementAttributesInterface;

/**
 * Provide link for sys log button.
 * Check whether belog is enabled and add link to module.
 * No link is returned if not enabled.
 */
class SysLogButtonProvider implements ButtonProviderInterface, ElementAttributesInterface
{
    public function __construct(private readonly string $title, private readonly string $target = '') {}

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getLink(): string
    {
        return '';
    }

    public function getTarget(): string
    {
        return $this->target;
    }

    public function getElementAttributes(): array
    {
        if (!ExtensionManagementUtility::isLoaded('belog')) {
            return [];
        }
        return [
            'data-dispatch-action' => 'TYPO3.ModuleMenu.showModule',
            'data-dispatch-args-list' => 'system_BelogLog,&'
                . http_build_query(['constraint' => ['channel' => 'content']]),
        ];
    }
}
