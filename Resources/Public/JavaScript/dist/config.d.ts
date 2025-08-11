/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/config
 *
 * Configuration class for heatmap settings
 */
import { HeatmapOptions, ColorRGB } from './types.js';
export declare class HeatmapConfig {
    duration: number;
    dateRangeMode: 'year' | 'year-auto' | 'month' | 'auto';
    color: ColorRGB;
    locale: string;
    showLegend: boolean;
    showYearLabels: boolean;
    showMonthLabels: boolean;
    minCellSize: number;
    maxCellSize: number;
    cellSpacing: number;
    containerPadding: number;
    tooltipWidth: number;
    tooltipHeight: number;
    weekStartsOnMonday: boolean;
    constructor(options?: HeatmapOptions);
}
//# sourceMappingURL=config.d.ts.map