/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/color-scale
 *
 * Color scale calculator for heatmap visualization
 */
import { HeatmapConfig } from './config.js';
import { HeatmapData } from './types.js';
export declare class ColorScale {
    private config;
    private maxValue;
    private thresholds;
    constructor(config: HeatmapConfig, data: HeatmapData[]);
    private calculateScale;
    getColor(value: number): string;
    getThresholds(): number[];
    getMaxValue(): number;
    private getCountValue;
}
//# sourceMappingURL=color-scale.d.ts.map