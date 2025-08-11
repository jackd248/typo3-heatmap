/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 */
export class HeatmapConfig {
    constructor(options = {}) {
        // Duration and date range
        this.duration = options.duration ?? 365;
        this.dateRangeMode = options.dateRangeMode ?? 'auto';
        // Color configuration
        const colorString = options.color ?? '255, 135, 0';
        const colorParts = colorString.split(',').map(c => parseInt(c.trim()));
        this.color = {
            r: colorParts[0] ?? 255,
            g: colorParts[1] ?? 135,
            b: colorParts[2] ?? 0
        };
        // Localization
        this.locale = options.locale ?? 'en-GB';
        // Display options
        this.showLegend = options.showLegend ?? true;
        this.showYearLabels = options.showYearLabels ?? true;
        this.showMonthLabels = options.showMonthLabels ?? true;
        // Layout dimensions
        this.minCellSize = options.minCellSize ?? 8;
        this.maxCellSize = options.maxCellSize ?? 20;
        this.cellSpacing = 1;
        this.containerPadding = 20;
        // Tooltip configuration
        this.tooltipWidth = options.tooltipWidth ?? 120;
        this.tooltipHeight = options.tooltipHeight ?? 26;
        this.tooltipItemSingular = options.tooltipItemSingular ?? 'change';
        this.tooltipItemPlural = options.tooltipItemPlural ?? 'changes';
        // Week configuration
        this.weekStartsOnMonday = options.weekStartsOnMonday ?? false; // Default: Sunday (GitHub style)
        // Legend labels
        this.legendLess = options.legendLess ?? 'Less';
        this.legendMore = options.legendMore ?? 'More';
    }
}
