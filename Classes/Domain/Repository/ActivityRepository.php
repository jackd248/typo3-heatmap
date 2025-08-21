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

namespace KonradMichalik\Typo3Heatmap\Domain\Repository;

use Doctrine\DBAL\Exception;
use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Core\Database\ConnectionPool;

readonly class ActivityRepository
{
    public function __construct(
        private ConnectionPool $connectionPool
    ) {}

    /**
     * Get user activity data from sys_history (content changes)
     * @throws Exception
     */
    public function getContentChangesForUser(int $userId, int $days = 365): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('sys_history');
        $queryBuilder->getRestrictions()->removeAll();

        $query = $queryBuilder
            ->selectLiteral('DATE(FROM_UNIXTIME(tstamp)) AS date')
            ->addSelectLiteral('COUNT(*) AS count')
            ->from('sys_history')
            ->where(
                $queryBuilder->expr()->eq('userid', $queryBuilder->createNamedParameter($userId, ParameterType::INTEGER)),
                $queryBuilder->expr()->neq('tablename', $queryBuilder->createNamedParameter('', ParameterType::STRING)),
                $queryBuilder->expr()->gte('tstamp', $queryBuilder->createNamedParameter(time() - ($days * 24 * 60 * 60), ParameterType::INTEGER))
            )
            ->groupBy('date')
            ->orderBy('date', 'DESC');

        return $query->executeQuery()->fetchAllAssociative();
    }

    /**
     * Get user login activity from sys_log
     * @throws Exception
     */
    public function getLoginActivityForUser(int $userId, int $days = 365): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('sys_log');
        $queryBuilder->getRestrictions()->removeAll();

        $query = $queryBuilder
            ->selectLiteral('DATE(FROM_UNIXTIME(tstamp)) AS date')
            ->addSelectLiteral('COUNT(*) AS count')
            ->from('sys_log')
            ->where(
                $queryBuilder->expr()->eq('userid', $queryBuilder->createNamedParameter($userId, ParameterType::INTEGER)),
                $queryBuilder->expr()->eq('type', $queryBuilder->createNamedParameter(255, ParameterType::INTEGER)),
                $queryBuilder->expr()->eq('action', $queryBuilder->createNamedParameter(1, ParameterType::INTEGER)),
                $queryBuilder->expr()->eq('error', $queryBuilder->createNamedParameter(0, ParameterType::INTEGER)),
                $queryBuilder->expr()->gte('tstamp', $queryBuilder->createNamedParameter(time() - ($days * 24 * 60 * 60), ParameterType::INTEGER))
            )
            ->groupBy('date')
            ->orderBy('date', 'DESC');

        return $query->executeQuery()->fetchAllAssociative();
    }
}
