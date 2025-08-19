/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/renderer
 * Version: 2.1.0 - TypeScript GitHub-style heatmap with fixed positioning
 *
 * Simple GitHub-style heatmap renderer
 */
import { HeatmapData } from './types.js';
export declare class HeatmapRenderer {
    private container;
    private data;
    private config;
    private layout;
    private colorScale;
    private svg?;
    private mainGroup?;
    private tooltip?;
    private allDates;
    private dateRange?;
    constructor(container: HTMLElement, data: HeatmapData[], options?: Record<string, any>);
    private processDataForLayout;
    private render;
    private createSVG;
    private processData;
    private calculateDateRange;
    private calculateOptimalDuration;
    private renderCells;
    private getWeekStart;
    private getDayOfWeekIndex;
    private renderCell;
    private addCellInteractivity;
    private formatTooltipContent;
    private renderLabels;
    private renderMonthLabels;
    private renderYearLabels;
    private renderLegend;
    private estimateTextWidth;
    private addLegendSquareTooltip;
    destroy(): void;
}
//# sourceMappingURL=renderer.d.ts.map