/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 *
 * Date Range Modes:
 * - 'year': Show exactly 365 days from today backwards
 * - 'year-auto': Show current year based on available data
 * - 'month': Show exactly 30 days
 * - 'auto': Optimal space utilization based on container dimensions and data
 */

export class HeatmapConfig {
    constructor(options = {}) {
        this.duration = options.duration || 365;
        this.dateRangeMode = options.dateRangeMode || 'auto'; // 'year', 'year-auto', 'month', 'auto'
        this.color = this.parseColor(options.color || '255, 135, 0');
        this.cellSpacing = options.cellSpacing || 2;
        this.minCellSize = options.minCellSize || 8;
        this.maxCellSize = options.maxCellSize || 20;
        this.containerPadding = options.containerPadding || 5; // Reduced from 10
        this.tooltipWidth = options.tooltipWidth || 160; // Increased for full date text
        this.tooltipHeight = options.tooltipHeight || 30; // Increased for better readability
        this.showLegend = options.showLegend !== false;
        this.showYearLabels = options.showYearLabels !== false;
        this.showMonthLabels = options.showMonthLabels !== false;
        this.locale = options.locale || 'de-DE';
    }

    parseColor(colorStr) {
        const [r, g, b] = colorStr.split(',').map(num => parseInt(num.trim()));
        return { r, g, b };
    }
}
