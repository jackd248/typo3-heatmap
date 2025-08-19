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

use TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider;

return [
    'heatmap-widget-content' => [
        'provider' => SvgIconProvider::class,
        'source' => 'EXT:typo3_heatmap/Resources/Public/Icons/content-heatmap-widget.svg',
    ],
    'heatmap-widget-error' => [
        'provider' => SvgIconProvider::class,
        'source' => 'EXT:typo3_heatmap/Resources/Public/Icons/error-heatmap-widget.svg',
    ],
    'heatmap-widget-custom' => [
        'provider' => SvgIconProvider::class,
        'source' => 'EXT:typo3_heatmap/Resources/Public/Icons/custom-heatmap-widget.svg',
    ],
    'heatmap-widget-login' => [
        'provider' => SvgIconProvider::class,
        'source' => 'EXT:typo3_heatmap/Resources/Public/Icons/login-heatmap-widget.svg',
    ],
    'heatmap-widget-empty' => [
        'provider' => SvgIconProvider::class,
        'source' => 'EXT:typo3_heatmap/Resources/Public/Icons/empty.svg',
    ],
];
