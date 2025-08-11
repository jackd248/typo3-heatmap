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

namespace KonradMichalik\Typo3HeatmapWidget\Tests\Unit\Widgets\Provider;

use Doctrine\DBAL\ParameterType;
use Doctrine\DBAL\Result;
use KonradMichalik\Typo3HeatmapWidget\Widgets\Provider\ContentChangesDataProvider;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Expression\ExpressionBuilder;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Database\Query\Restriction\QueryRestrictionContainerInterface;

class ContentChangesDataProviderTest extends TestCase
{
    private ContentChangesDataProvider $subject;
    private ConnectionPool&MockObject $connectionPool;
    private QueryBuilder&MockObject $queryBuilder;
    private ExpressionBuilder&MockObject $expressionBuilder;
    private QueryRestrictionContainerInterface&MockObject $restrictions;
    private Result&MockObject $result;

    protected function setUp(): void
    {
        parent::setUp();

        $this->connectionPool = $this->createMock(ConnectionPool::class);
        $this->queryBuilder = $this->createMock(QueryBuilder::class);
        $this->expressionBuilder = $this->createMock(ExpressionBuilder::class);
        $this->restrictions = $this->createMock(QueryRestrictionContainerInterface::class);
        $this->result = $this->createMock(Result::class);

        $this->subject = new ContentChangesDataProvider($this->connectionPool);
    }

    public function testGetItemsReturnsExpectedData(): void
    {
        $expectedData = [
            ['change_date' => '2023-12-01', 'changes_count' => 5],
            ['change_date' => '2023-12-02', 'changes_count' => 3],
        ];

        $this->connectionPool
            ->expects(self::once())
            ->method('getQueryBuilderForTable')
            ->with('sys_log')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('getRestrictions')
            ->willReturn($this->restrictions);

        $this->restrictions
            ->expects(self::once())
            ->method('removeAll');

        $this->queryBuilder
            ->expects(self::once())
            ->method('selectLiteral')
            ->with('DATE(FROM_UNIXTIME(tstamp)) AS change_date')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('addSelectLiteral')
            ->with('COUNT(*) AS changes_count')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('from')
            ->with('sys_log')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::exactly(2))
            ->method('expr')
            ->willReturn($this->expressionBuilder);

        $this->expressionBuilder
            ->expects(self::exactly(2))
            ->method('eq')
            ->willReturnCallback(function (string $field, string $value): string {
                if ($field === 'type') {
                    return "type = '1'";
                }
                if ($field === 'error') {
                    return "error = '0'";
                }
                return '';
            });

        $this->queryBuilder
            ->expects(self::exactly(2))
            ->method('createNamedParameter')
            ->willReturnCallback(function (int $value, int|ParameterType $type = null): string {
                // Handle both old int constants and new ParameterType enum
                $isIntegerType = $type === ParameterType::INTEGER || $type === \PDO::PARAM_INT;
                
                if ($value === 1 && $isIntegerType) {
                    return ':param1';
                }
                if ($value === 0 && $isIntegerType) {
                    return ':param2';
                }
                return '';
            });

        $this->queryBuilder
            ->expects(self::once())
            ->method('where')
            ->with("type = '1'", "error = '0'")
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('groupBy')
            ->with('change_date')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('orderBy')
            ->with('change_date', 'DESC')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('executeQuery')
            ->willReturn($this->result);

        $this->result
            ->expects(self::once())
            ->method('fetchAllAssociative')
            ->willReturn($expectedData);

        $actualData = $this->subject->getItems();

        self::assertSame($expectedData, $actualData);
    }

    public function testGetItemsReturnsEmptyArrayWhenNoData(): void
    {
        $this->connectionPool
            ->expects(self::once())
            ->method('getQueryBuilderForTable')
            ->with('sys_log')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('getRestrictions')
            ->willReturn($this->restrictions);

        $this->restrictions
            ->expects(self::once())
            ->method('removeAll');

        $this->queryBuilder
            ->method('selectLiteral')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->method('addSelectLiteral')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->method('from')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->method('expr')
            ->willReturn($this->expressionBuilder);

        $this->expressionBuilder
            ->method('eq')
            ->willReturn('');

        $this->queryBuilder
            ->method('createNamedParameter')
            ->willReturn('');

        $this->queryBuilder
            ->method('where')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->method('groupBy')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->method('orderBy')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('executeQuery')
            ->willReturn($this->result);

        $this->result
            ->expects(self::once())
            ->method('fetchAllAssociative')
            ->willReturn([]);

        $actualData = $this->subject->getItems();

        self::assertSame([], $actualData);
    }
}
