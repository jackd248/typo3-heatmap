/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 */

export class HeatmapConfig {
    constructor(options = {}) {
        this.duration = options.duration || 365;
        this.dateRangeMode = options.dateRangeMode || 'auto'; // 'month', 'year', 'auto'
        this.color = this.parseColor(options.color || '255, 135, 0');
        this.cellSpacing = options.cellSpacing || 2;
        this.minCellSize = options.minCellSize || 8;
        this.maxCellSize = options.maxCellSize || 20;
        this.containerPadding = options.containerPadding || 5; // Reduced from 10
        this.tooltipWidth = options.tooltipWidth || 120; // Reduced from 140
        this.tooltipHeight = options.tooltipHeight || 26; // Reduced from 28
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