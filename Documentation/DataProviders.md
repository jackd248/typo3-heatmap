# Custom Data Providers

Create a custom data providers for the Heatmap Widget to visualize your own data sources.

> [!tip]
> The heatmap widget can e.g. be used to visualize visitor analytics like [Matomo](https://matomo.org/) page views or any other data source that provides date-based counts.

- [Data Format](#data-format)
- [Implementation](#implementation)
  - [1. Data Provider Class](#1-data-provider-class)
  - [2. Services Configuration](#2-services-configuration)
- [Summary](#summary)

## Data Format

```php
[
    [
        'date' => '2025-01-15',    // YYYY-MM-DD format
        'count' => 23,             // Integer value
        'link' => 'https://...'    // Optional: clickable URL
    ],
    // ...
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | `string` | ✅ | Date in YYYY-MM-DD format |
| `count` | `int` | ✅ | Non-negative integer value |
| `link` | `string` | ❌ | Optional URL for clickable cells |

## Implementation

### Data Provider Class

```php
<?php
namespace YourVendor\YourExtension\Widgets\Provider;

use TYPO3\CMS\Dashboard\Widgets\ListDataProviderInterface;

class CustomDataProvider implements ListDataProviderInterface
{
    public function getItems(): array
    {
        // Your data fetching logic
        return [
            ['date' => '2025-01-15', 'count' => 23, 'link' => 'https://...'],
            // ...
        ];
    }
}
```

### Services Configuration

```yaml
services:
  custom-heatmap-widget:
    class: 'KonradMichalik\Typo3HeatmapWidget\Widgets\Heatmap'
    arguments:
      $dataProvider: '@YourVendor\YourExtension\Widgets\Provider\CustomDataProvider'
      $options:
        color: '46, 125, 50'           # Custom green color
        dateRangeMode: 'auto'          # auto, year, year-auto, month
        showLegend: true
        showYearLabels: true
        showMonthLabels: true
        weekStartsOnMonday: false      # Sunday week start (GitHub style)
    tags:
      - name: dashboard.widget
        identifier: 'custom-heatmap'
        title: 'Custom Data Heatmap'
        iconIdentifier: 'heatmap-widget-custom'
        height: 'medium'
        width: 'medium'
```

> [!note]
> The widget is fairly responsive, but not all sizes are compatible with the heat map display.

## Summary

1. Implement `ListDataProviderInterface` with `getItems()` method
2. Return array with `date`, `count`, and optional `link` fields
3. Register provider and configure widget options in `Services.yaml`

The base `Heatmap` class handles all visualization automatically - no custom widget class needed!