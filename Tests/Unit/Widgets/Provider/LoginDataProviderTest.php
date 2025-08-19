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

use Doctrine\DBAL\Result;
use KonradMichalik\Typo3Heatmap\Widgets\Provider\LoginDataProvider;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Expression\ExpressionBuilder;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Database\Query\Restriction\QueryRestrictionContainerInterface;

class LoginDataProviderTest extends TestCase
{
    private LoginDataProvider $subject;
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

        $this->subject = new LoginDataProvider($this->connectionPool, $this->uriBuilder);

        $this->connectionPool->method('getQueryBuilderForTable')->willReturn($this->queryBuilder);
        $this->queryBuilder->method('getRestrictions')->willReturn($this->restrictions);
        $this->queryBuilder->method('selectLiteral')->willReturn($this->queryBuilder);
        $this->queryBuilder->method('addSelectLiteral')->willReturn($this->queryBuilder);
        $this->queryBuilder->method('from')->willReturn($this->queryBuilder);
        $this->queryBuilder->method('where')->willReturn($this->queryBuilder);
        $this->queryBuilder->method('groupBy')->willReturn($this->queryBuilder);
        $this->queryBuilder->method('orderBy')->willReturn($this->queryBuilder);
        $this->queryBuilder->method('executeQuery')->willReturn($this->result);
        $this->queryBuilder->method('expr')->willReturn($this->expressionBuilder);
        $this->queryBuilder->method('createNamedParameter')->willReturnCallback(
            static fn(mixed $value, mixed $type = null): string => (string)$value
        );

        $this->expressionBuilder->method('eq')->willReturnArgument(0);
        $this->restrictions->method('removeAll')->willReturn($this->restrictions);
    }

    public function testGetItemsWithValidData(): void
    {
        $testData = [
            ['date' => '2023-12-01', 'count' => 5],
            ['date' => '2023-12-02', 'count' => 3],
        ];

        $this->result->method('fetchAllAssociative')->willReturn($testData);
        $this->uriBuilder->method('buildUriFromRoute')->willReturn('https://example.com/typo3/module/system/log');

        $result = $this->subject->getItems();

        self::assertCount(2, $result);

        // Check that links were enriched
        foreach ($result as $item) {
            self::assertArrayHasKey('link', $item);
            self::assertStringContainsString('constraint%5Bchannel%5D=user', $item['link']);
        }
    }

    public function testGetItemsWithEmptyData(): void
    {
        $this->result->method('fetchAllAssociative')->willReturn([]);

        $result = $this->subject->getItems();

        self::assertCount(0, $result);
    }

    public function testQueryBuilderConfiguration(): void
    {
        $this->result->method('fetchAllAssociative')->willReturn([]);
        $this->uriBuilder->method('buildUriFromRoute')->willReturn('https://example.com/typo3/module/system/log');

        $this->queryBuilder->expects(self::once())
            ->method('selectLiteral')
            ->with('DATE(FROM_UNIXTIME(tstamp)) AS date');

        $this->queryBuilder->expects(self::once())
            ->method('addSelectLiteral')
            ->with('COUNT(*) AS count');

        $this->queryBuilder->expects(self::once())
            ->method('from')
            ->with('sys_log');

        // Verify login-specific query parameters
        $this->expressionBuilder->expects(self::exactly(3))
            ->method('eq');

        $this->queryBuilder->expects(self::once())
            ->method('groupBy')
            ->with('date');

        $this->queryBuilder->expects(self::once())
            ->method('orderBy')
            ->with('date', 'DESC');

        $this->subject->getItems();
    }
}
