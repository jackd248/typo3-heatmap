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

        // Store original dimensions for debugging
        this.originalWidth = containerWidth;
        this.originalHeight = containerHeight;

        // Ensure minimum container size for proper calculation, but be less aggressive for small widgets
        this.containerWidth = Math.max(this.containerWidth, 280);
        this.containerHeight = Math.max(this.containerHeight, 140);

        this.aspectRatio = this.containerWidth / this.containerHeight;
        this.isSquareWidget = this.aspectRatio >= 0.7 && this.aspectRatio <= 1.3;

        // For very small widgets, prefer single-row layout
        this.isSmallWidget = this.originalWidth < 400 || this.originalHeight < 250;

        this.calculate();
    }

    calculate() {
        const weekCount = Math.ceil(this.config.duration / 7);

        // Determine layout strategy - avoid multi-row for small widgets
        if (!this.isSmallWidget && this.isSquareWidget && this.containerHeight > 200 && weekCount > 20) {
            this.calculateMultiRowLayout(weekCount);
        } else {
            this.calculateSingleRowLayout(weekCount);
        }

        this.calculateOffsets();
    }

    calculateSingleRowLayout(weekCount) {
        this.rows = 1;
        this.weeksPerRow = weekCount;

        // Calculate available width - use effective padding
        const effectivePadding = this.isSmallWidget ? Math.max(this.config.containerPadding, 8) : this.config.containerPadding;
        const availableWidth = this.containerWidth - (effectivePadding * 2);

        // Calculate optimal cell size that fits exactly within available width
        let targetCellSize = Math.floor(availableWidth / weekCount);

        // Apply constraints based on widget size - be more restrictive to prevent overflow
        if (this.isSmallWidget || this.containerWidth < 450) {
            // For small containers, be very conservative
            this.cellSize = Math.max(
                this.config.minCellSize,
                Math.min(12, targetCellSize) // Max 12px for small widgets to prevent overflow
            );
        } else if (weekCount < 26 && targetCellSize > this.config.maxCellSize) {
            this.cellSize = Math.min(targetCellSize, 25); // Allow up to 25px for short periods
        } else {
            this.cellSize = Math.max(
                this.config.minCellSize,
                Math.min(this.config.maxCellSize, targetCellSize)
            );
        }

        // Ensure heatmap width never exceeds available width
        this.heatmapWidth = weekCount * this.cellSize;
        if (this.heatmapWidth > availableWidth) {
            // Force fit by reducing cell size
            this.cellSize = Math.floor(availableWidth / weekCount);
            this.heatmapWidth = weekCount * this.cellSize;
        }

        this.singleRowHeight = 7 * this.cellSize;
        this.heatmapHeight = this.singleRowHeight;
        this.labelHeight = this.isSmallWidget ? 45 : 55; // Less space for small widgets
        this.totalHeight = this.heatmapHeight + this.labelHeight;
    }

    calculateMultiRowLayout(weekCount) {
        // Calculate optimal rows and weeks per row based on container dimensions
        const effectivePadding = this.isSmallWidget ? Math.max(this.config.containerPadding, 8) : this.config.containerPadding;
        const availableWidth = this.containerWidth - (effectivePadding * 2);
        const availableHeight = this.containerHeight - 100; // Reserve space for labels and legend

        // Calculate how many weeks fit optimally in one row
        const optimalWeeksPerRow = Math.floor(availableWidth / this.config.maxCellSize);

        // Calculate optimal number of rows based on week count and container height
        const maxPossibleRows = Math.min(4, Math.floor(availableHeight / (7 * this.config.minCellSize + 25)));
        const idealRows = Math.min(maxPossibleRows, Math.ceil(weekCount / optimalWeeksPerRow));

        this.rows = Math.max(2, idealRows);
        this.weeksPerRow = Math.ceil(weekCount / this.rows);

        // Calculate cell size to maximize space usage - use exact fit
        const maxCellSizeByWidth = Math.floor(availableWidth / this.weeksPerRow);
        const maxCellSizeByHeight = Math.floor((availableHeight - (this.rows - 1) * 25) / (this.rows * 7));

        this.cellSize = Math.max(
            this.config.minCellSize,
            Math.min(this.config.maxCellSize, Math.min(maxCellSizeByWidth, maxCellSizeByHeight))
        );

        // Final width calculation - this is the definitive width
        this.heatmapWidth = this.weeksPerRow * this.cellSize;
        this.singleRowHeight = 7 * this.cellSize;
        this.rowSpacing = 25; // Reduced spacing for better utilization
        this.heatmapHeight = this.singleRowHeight * this.rows + (this.rows - 1) * this.rowSpacing;
        this.labelHeight = 60; // Optimized for multi-row
        this.totalHeight = this.heatmapHeight + this.labelHeight;
    }

    calculateOffsets() {
        // Calculate effective padding for small widgets
        const effectivePadding = this.isSmallWidget ? Math.max(this.config.containerPadding, 8) : this.config.containerPadding;
        
        // Calculate horizontal offset - simple centering without width recalculation
        const remainingWidth = this.containerWidth - this.heatmapWidth;
        
        if (remainingWidth >= effectivePadding * 2) {
            // Enough space to center horizontally
            this.offsetX = remainingWidth / 2;
        } else {
            // Use minimal padding
            this.offsetX = effectivePadding;
        }

        // Ensure offset doesn't cause overflow (final safety check)
        this.offsetX = Math.max(0, Math.min(this.offsetX, this.containerWidth - this.heatmapWidth));

        // Center vertically with sufficient space for labels
        const minTopSpace = this.isSmallWidget ? 20 : 30; // Less space for small widgets
        const availableVerticalSpace = this.containerHeight - this.totalHeight;

        if (availableVerticalSpace > minTopSpace * 2) {
            // Enough space to center vertically
            this.offsetY = Math.max(minTopSpace, availableVerticalSpace / 2);
        } else {
            // Not enough space - use minimal top spacing
            this.offsetY = minTopSpace;
        }

        // Ensure vertical offset doesn't cause overflow
        this.offsetY = Math.max(0, Math.min(this.offsetY, this.containerHeight - this.totalHeight));
    }
}
