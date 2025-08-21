/**
 * Module: @KonradMichalik/Typo3Heatmap/tooltip
 *
 * SVG tooltip component for heatmap cells
 */
import { HeatmapConfig } from './config.js';
import { HeatmapLayout } from './types.js';
export declare class HeatmapTooltip {
    group: SVGGElement;
    private config;
    private layout;
    private background;
    private text;
    private isVisible;
    constructor(config: HeatmapConfig, layout: HeatmapLayout);
    private createElements;
    show(x: number, y: number, content: string, containerWidth: number, containerHeight: number): void;
    hide(): void;
    isShowing(): boolean;
}
//# sourceMappingURL=tooltip.d.ts.map