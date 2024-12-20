<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider;

return [
    'heatmap-widget' => [
        'provider' => SvgIconProvider::class,
        'source' => 'EXT:typo3_content_heatmap/Resources/Public/Icons/content-heatmap-widget.svg',
    ],
];
