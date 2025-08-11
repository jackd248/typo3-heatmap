<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS extension "typo3_heatmap_widget".
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

namespace KonradMichalik\Typo3HeatmapWidget\Widgets\Provider;

use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Dashboard\Widgets\ListDataProviderInterface;

class ErrorDataProvider implements ListDataProviderInterface
{
    public function __construct(private readonly \TYPO3\CMS\Core\Database\ConnectionPool $connectionPool) {}
    /**
     * @throws \Doctrine\DBAL\Exception
     */
    public function getItems(): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('sys_log');
        $queryBuilder->getRestrictions()->removeAll();

        $query = $queryBuilder
            ->selectLiteral('DATE(FROM_UNIXTIME(tstamp)) AS change_date')
            ->addSelectLiteral('COUNT(*) AS changes_count')
            ->from('sys_log')
            ->where(
                $queryBuilder->expr()->gte('error', $queryBuilder->createNamedParameter(1, ParameterType::INTEGER))
            )
            ->groupBy('change_date')
            ->orderBy('change_date', 'DESC');

        return $query->executeQuery()->fetchAllAssociative();
    }
}
