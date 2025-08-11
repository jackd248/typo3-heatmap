/**
 * Type definitions for TYPO3 Heatmap Widget
 */
export interface HeatmapData {
    date: string;
    count: number;
    link?: string;
    dateObject?: Date;
    change_date?: string;
    changes_count?: number;
}
export interface HeatmapOptions {
    duration?: number;
    dateRangeMode?: 'year' | 'year-auto' | 'month' | 'auto';
    color?: string;
    locale?: string;
    showLegend?: boolean;
    showYearLabels?: boolean;
    showMonthLabels?: boolean;
    minCellSize?: number;
    maxCellSize?: number;
    tooltipWidth?: number;
    tooltipHeight?: number;
    tooltipItemSingular?: string;
    tooltipItemPlural?: string;
    weekStartsOnMonday?: boolean;
    legendLess?: string;
    legendMore?: string;
}
export interface HeatmapLayout {
    containerWidth: number;
    containerHeight: number;
    cellSize: number;
    weekCount: number;
    rows: number;
    weeksPerRow: number;
    heatmapWidth: number;
    heatmapHeight: number;
    singleRowHeight: number;
    rowSpacing?: number;
    offsetX: number;
    offsetY: number;
    totalHeight: number;
    labelHeight: number;
    isSmallWidget: boolean;
}
export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}
export interface DateRange {
    start: Date;
    end: Date;
}
//# sourceMappingURL=types.d.ts.map