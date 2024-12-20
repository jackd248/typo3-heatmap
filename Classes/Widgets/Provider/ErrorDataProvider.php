<?php

declare(strict_types=1);

namespace Kmi\Typo3HeatmapWidget\Widgets\Provider;

use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Dashboard\Widgets\ListDataProviderInterface;

class ErrorDataProvider implements ListDataProviderInterface
{
    /**
     * @throws \Doctrine\DBAL\Exception
     */
    public function getItems(): array
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_log');
        $queryBuilder->getRestrictions()->removeAll();

        $query = $queryBuilder
            ->selectLiteral('DATE(FROM_UNIXTIME(tstamp)) AS change_date')
            ->addSelectLiteral('COUNT(*) AS changes_count')
            ->from('sys_log')
            ->where(
                $queryBuilder->expr()->gte('error', $queryBuilder->createNamedParameter(1, \PDO::PARAM_INT))
            )
            ->groupBy('change_date')
            ->orderBy('change_date', 'DESC');

        return $query->executeQuery()->fetchAllAssociative();
    }
}
