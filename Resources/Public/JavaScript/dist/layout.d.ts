/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/layout
 * Version: 1.0.1 - Force single-row GitHub-style layout
 *
 * Layout calculator for responsive heatmap positioning
 */
import { HeatmapConfig } from './config.js';
import { HeatmapLayout } from './types.js';
export declare class HeatmapLayoutCalculator {
    private config;
    private containerWidth;
    private containerHeight;
    private originalWidth;
    private originalHeight;
    private aspectRatio;
    private isSquareWidget;
    private isSmallWidget;
    constructor(config: HeatmapConfig, containerWidth: number, containerHeight: number);
    calculate(): HeatmapLayout;
    private calculateSingleRowLayout;
    private calculateOffsets;
}
//# sourceMappingURL=layout.d.ts.map