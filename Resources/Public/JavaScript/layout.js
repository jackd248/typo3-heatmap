/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/layout
 *
 * Layout calculator for responsive heatmap positioning
 */

export class HeatmapLayout {
    constructor(config, containerWidth, containerHeight) {
        this.config = config;
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.aspectRatio = containerWidth / containerHeight;
        this.isSquareWidget = this.aspectRatio >= 0.7 && this.aspectRatio <= 1.3;

        this.calculate();
    }

    calculate() {
        const weekCount = Math.ceil(this.config.duration / 7);

        // Determine layout strategy
        if (this.isSquareWidget && this.containerHeight > 250 && weekCount > 26) {
            this.calculateMultiRowLayout(weekCount);
        } else {
            this.calculateSingleRowLayout(weekCount);
        }

        this.calculateOffsets();
    }

    calculateSingleRowLayout(weekCount) {
        this.rows = 1;
        this.weeksPerRow = weekCount;

        // For shorter periods, use more aggressive width utilization
        const availableWidth = this.containerWidth - (this.config.containerPadding * 2);

        // Calculate optimal cell size - prioritize width usage over max cell size for short periods
        let targetCellSize = Math.floor(availableWidth / weekCount);

        // For short periods (< 26 weeks), allow larger cells to fill space
        if (weekCount < 26 && targetCellSize > this.config.maxCellSize) {
            this.cellSize = Math.min(targetCellSize, 25); // Allow up to 25px for short periods
        } else {
            this.cellSize = Math.max(
                this.config.minCellSize,
                Math.min(this.config.maxCellSize, targetCellSize)
            );
        }

        this.heatmapWidth = weekCount * this.cellSize;
        this.singleRowHeight = 7 * this.cellSize;
        this.heatmapHeight = this.singleRowHeight;
        this.labelHeight = 55; // More space for both month and year labels
        this.totalHeight = this.heatmapHeight + this.labelHeight;
    }

    calculateMultiRowLayout(weekCount) {
        const idealRows = Math.min(4, Math.ceil(weekCount / Math.floor(this.containerWidth / 15)));
        this.rows = Math.max(2, idealRows);
        this.weeksPerRow = Math.ceil(weekCount / this.rows);

        const availableWidth = this.containerWidth - this.config.containerPadding;
        this.cellSize = Math.max(
            this.config.minCellSize,
            Math.min(this.config.maxCellSize, Math.floor(availableWidth / this.weeksPerRow))
        );

        this.heatmapWidth = this.weeksPerRow * this.cellSize;
        this.singleRowHeight = 7 * this.cellSize;
        this.rowSpacing = 30;
        this.heatmapHeight = this.singleRowHeight * this.rows + (this.rows - 1) * this.rowSpacing;
        this.labelHeight = 65; // More space for multi-row labels
        this.totalHeight = this.heatmapHeight + this.labelHeight;
    }

    calculateOffsets() {
        // For short periods, use minimal centering to maximize space usage
        this.offsetX = Math.max(
            this.config.containerPadding,
            (this.containerWidth - this.heatmapWidth) / 2
        );
        // Ensure sufficient space for month labels above (30px minimum to prevent cutoff)
        this.offsetY = Math.max(30, (this.containerHeight - this.totalHeight) / 2);
    }
}