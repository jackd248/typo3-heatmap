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

namespace KonradMichalik\Typo3HeatmapWidget\Tests\Unit\Widgets;

use KonradMichalik\Typo3HeatmapWidget\Configuration;
use KonradMichalik\Typo3HeatmapWidget\Widgets\Heatmap;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Dashboard\Widgets\ButtonProviderInterface;
use TYPO3\CMS\Dashboard\Widgets\ListDataProviderInterface;
use TYPO3\CMS\Dashboard\Widgets\WidgetConfigurationInterface;

class HeatmapTest extends TestCase
{
    private Heatmap $subject;
    private WidgetConfigurationInterface&MockObject $configuration;
    private ListDataProviderInterface&MockObject $dataProvider;
    private ButtonProviderInterface&MockObject $buttonProvider;

    protected function setUp(): void
    {
        parent::setUp();

        $this->configuration = $this->createMock(WidgetConfigurationInterface::class);
        $this->dataProvider = $this->createMock(ListDataProviderInterface::class);
        $this->buttonProvider = $this->createMock(ButtonProviderInterface::class);

        $this->subject = new Heatmap(
            $this->configuration,
            $this->dataProvider,
            $this->buttonProvider,
            ['test_option' => 'test_value']
        );
    }

    public function testRenderWidgetContentUsesDataProvider(): void
    {
        $testData = [
            ['change_date' => '2023-12-01', 'changes_count' => 5],
            ['change_date' => '2023-12-02', 'changes_count' => 3],
        ];

        // Test that the data provider is called when rendering
        $this->dataProvider
            ->expects(self::once())
            ->method('getItems')
            ->willReturn($testData);

        // We can't easily test the full rendering due to TYPO3 static dependencies,
        // but we can test that the method calls the data provider
        try {
            $this->subject->renderWidgetContent();
        } catch (\Error $e) {
            // Expected in unit tests due to TYPO3 dependencies not being available
            // The important part is that getItems() was called (verified by PHPUnit mock)
            self::assertStringContainsString('Cannot instantiate interface', $e->getMessage());
        }
    }

    public function testGetOptions(): void
    {
        $expectedOptions = ['test_option' => 'test_value'];
        $actualOptions = $this->subject->getOptions();

        self::assertSame($expectedOptions, $actualOptions);
    }

    public function testGetOptionsWithEmptyOptions(): void
    {
        $subject = new Heatmap(
            $this->configuration,
            $this->dataProvider,
            $this->buttonProvider,
            []
        );

        $actualOptions = $subject->getOptions();

        self::assertSame([], $actualOptions);
    }

    public function testGetCssFiles(): void
    {
        $expectedCssFiles = ['EXT:' . Configuration::EXT_KEY . '/Resources/Public/Css/Styles.css'];
        $actualCssFiles = $this->subject->getCssFiles();

        self::assertSame($expectedCssFiles, $actualCssFiles);
    }

    public function testGetJavaScriptModuleInstructions(): void
    {
        $actualInstructions = $this->subject->getJavaScriptModuleInstructions();

        self::assertCount(1, $actualInstructions);
        self::assertInstanceOf(JavaScriptModuleInstruction::class, $actualInstructions[0]);
    }

    public function testConstructorWithoutButtonProvider(): void
    {
        $subject = new Heatmap(
            $this->configuration,
            $this->dataProvider
        );

        self::assertInstanceOf(Heatmap::class, $subject);
        self::assertSame([], $subject->getOptions());
    }

    public function testConstructorWithCustomOptions(): void
    {
        $customOptions = [
            'color' => 'red',
            'duration' => 365,
        ];

        $subject = new Heatmap(
            $this->configuration,
            $this->dataProvider,
            null,
            $customOptions
        );

        self::assertSame($customOptions, $subject->getOptions());
    }
}
