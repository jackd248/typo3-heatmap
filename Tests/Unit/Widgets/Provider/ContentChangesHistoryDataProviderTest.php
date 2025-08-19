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

namespace KonradMichalik\Typo3Heatmap\Tests\Unit\Widgets\Provider;

use Doctrine\DBAL\ParameterType;
use Doctrine\DBAL\Result;
use KonradMichalik\Typo3Heatmap\Widgets\Provider\ContentChangesHistoryDataProvider;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Expression\ExpressionBuilder;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Database\Query\Restriction\QueryRestrictionContainerInterface;

class ContentChangesHistoryDataProviderTest extends TestCase
{
    private ContentChangesHistoryDataProvider $subject;
    private ConnectionPool&MockObject $connectionPool;
    private UriBuilder&MockObject $uriBuilder;
    private QueryBuilder&MockObject $queryBuilder;
    private ExpressionBuilder&MockObject $expressionBuilder;
    private QueryRestrictionContainerInterface&MockObject $restrictions;
    private Result&MockObject $result;

    protected function setUp(): void
    {
        parent::setUp();

        $this->connectionPool = $this->createMock(ConnectionPool::class);
        $this->uriBuilder = $this->createMock(UriBuilder::class);
        $this->queryBuilder = $this->createMock(QueryBuilder::class);
        $this->expressionBuilder = $this->createMock(ExpressionBuilder::class);
        $this->restrictions = $this->createMock(QueryRestrictionContainerInterface::class);
        $this->result = $this->createMock(Result::class);

        $this->subject = new ContentChangesHistoryDataProvider($this->connectionPool, $this->uriBuilder);
    }

    public function testGetItemsReturnsExpectedData(): void
    {
        $rawData = [
            ['date' => '2023-12-01', 'count' => 8],
            ['date' => '2023-12-02', 'count' => 4],
        ];

        // Expected data after link enrichment (history channel)
        $expectedData = [
            ['date' => '2023-12-01', 'count' => 8, 'link' => '/typo3/module/system/BelogLog?constraint%5BtimeFrame%5D=30&constraint%5BmanualDateStart%5D=2023-12-01T00%3A00%3A00Z&constraint%5BmanualDateStop%5D=2023-12-01T23%3A59%3A59Z&constraint%5Bchannel%5D=history'],
            ['date' => '2023-12-02', 'count' => 4, 'link' => '/typo3/module/system/BelogLog?constraint%5BtimeFrame%5D=30&constraint%5BmanualDateStart%5D=2023-12-02T00%3A00%3A00Z&constraint%5BmanualDateStop%5D=2023-12-02T23%3A59%3A59Z&constraint%5Bchannel%5D=history'],
        ];

        $this->connectionPool
            ->expects(self::once())
            ->method('getQueryBuilderForTable')
            ->with('sys_history')
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
            ->with('DATE(FROM_UNIXTIME(tstamp)) AS date')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('addSelectLiteral')
            ->with('COUNT(*) AS count')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('from')
            ->with('sys_history')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('expr')
            ->willReturn($this->expressionBuilder);

        $this->expressionBuilder
            ->expects(self::once())
            ->method('neq')
            ->with('tablename', ':param1')
            ->willReturn("tablename != ''");

        $this->queryBuilder
            ->expects(self::once())
            ->method('createNamedParameter')
            ->with('', ParameterType::STRING)
            ->willReturn(':param1');

        $this->queryBuilder
            ->expects(self::once())
            ->method('where')
            ->with("tablename != ''")
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('groupBy')
            ->with('date')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('orderBy')
            ->with('date', 'DESC')
            ->willReturn($this->queryBuilder);

        $this->queryBuilder
            ->expects(self::once())
            ->method('executeQuery')
            ->willReturn($this->result);

        $this->result
            ->expects(self::once())
            ->method('fetchAllAssociative')
            ->willReturn($rawData);

        // Mock UriBuilder for link generation
        $this->uriBuilder
            ->expects(self::exactly(2))
            ->method('buildUriFromRoute')
            ->with('system_BelogLog')
            ->willReturn('/typo3/module/system/BelogLog');

        $actualData = $this->subject->getItems();

        self::assertSame($expectedData, $actualData);
    }

    public function testGetItemsReturnsEmptyArrayWhenNoData(): void
    {
        $this->connectionPool
            ->expects(self::once())
            ->method('getQueryBuilderForTable')
            ->with('sys_history')
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
            ->method('neq')
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
