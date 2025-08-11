/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/layout
 * Version: 1.0.1 - Force single-row GitHub-style layout
 *
 * Layout calculator for responsive heatmap positioning
 */
export class HeatmapLayoutCalculator {
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
    }
    calculate() {
        const weekCount = Math.ceil(this.config.duration / 7);
        // Always use single-row layout for GitHub-style heatmaps
        // GitHub heatmaps always display chronologically left-to-right, newest on right
        const layout = this.calculateSingleRowLayout(weekCount);
        this.calculateOffsets(layout);
        return layout;
    }
    calculateSingleRowLayout(weekCount) {
        const rows = 1;
        const weeksPerRow = weekCount;
        // For TYPO3 dashboard widgets, use minimal padding for maximum space utilization
        const effectivePadding = Math.min(this.config.containerPadding, 20);
        const availableWidth = this.containerWidth - (effectivePadding * 2);
        // Calculate label height more precisely
        let labelHeight = 0;
        if (this.config.showMonthLabels)
            labelHeight += 20; // Month labels above
        if (this.config.showYearLabels)
            labelHeight += 30; // Year labels below
        if (this.config.showLegend)
            labelHeight += 35; // Legend at bottom
        // Use much less padding for maximum height utilization
        const verticalPadding = 10; // Minimal padding
        const availableHeight = this.containerHeight - labelHeight - (verticalPadding * 2);
        const optimalCellSizeByHeight = Math.floor(availableHeight / 7); // 7 days per week
        // Calculate cell size based on both width and height constraints
        const optimalCellSizeByWidth = Math.floor(availableWidth / weekCount);
        // Try to use height-optimized cell size first
        let cellSize = optimalCellSizeByHeight;
        // Check if width allows this cell size - if not, we need to adjust
        const requiredWidth = weekCount * cellSize;
        if (requiredWidth > availableWidth) {
            // Width is limiting - use width-based size but prefer larger cells
            cellSize = optimalCellSizeByWidth;
            // If the difference is small, slightly reduce weeks to get bigger cells
            if (optimalCellSizeByHeight > optimalCellSizeByWidth &&
                optimalCellSizeByHeight - optimalCellSizeByWidth <= 10) {
                // Try with 90% of weeks to see if we can get bigger cells
                const reducedWeeks = Math.floor(weekCount * 0.9);
                const betterCellSize = Math.floor(availableWidth / reducedWeeks);
                if (betterCellSize >= optimalCellSizeByHeight * 0.9) {
                    console.log(`Layout Optimization: Reducing weeks from ${weekCount} to ${reducedWeeks} for better cell size ${betterCellSize}px`);
                    // This should trigger a duration recalculation, but for now use what we have
                }
            }
        }
        // Apply reasonable bounds - allow much larger cells for dashboard widgets
        cellSize = Math.max(this.config.minCellSize, Math.min(40, cellSize)); // Max 40px for full height utilization
        // Debug logging for height utilization
        console.log(`Layout Debug:`, {
            containerHeight: this.containerHeight,
            labelHeight,
            availableHeight,
            optimalCellSizeByHeight,
            optimalCellSizeByWidth,
            finalCellSize: cellSize,
            expectedHeatmapHeight: cellSize * 7,
            totalExpectedHeight: cellSize * 7 + labelHeight
        });
        // Ensure heatmap fits within available width
        let heatmapWidth = weekCount * cellSize;
        if (heatmapWidth > availableWidth) {
            // Force fit by reducing cell size slightly
            cellSize = Math.floor(availableWidth / weekCount);
            heatmapWidth = weekCount * cellSize;
        }
        const singleRowHeight = 7 * cellSize;
        const heatmapHeight = singleRowHeight;
        const totalHeight = heatmapHeight + labelHeight;
        return {
            containerWidth: this.containerWidth,
            containerHeight: this.containerHeight,
            cellSize,
            weekCount,
            rows,
            weeksPerRow,
            heatmapWidth,
            heatmapHeight,
            singleRowHeight,
            rowSpacing: 0,
            offsetX: 0, // Will be calculated in calculateOffsets
            offsetY: 0, // Will be calculated in calculateOffsets
            totalHeight,
            labelHeight,
            isSmallWidget: this.isSmallWidget
        };
    }
    calculateOffsets(layout) {
        // Calculate effective padding for small widgets
        const effectivePadding = this.isSmallWidget ? Math.max(this.config.containerPadding, 8) : this.config.containerPadding;
        // Calculate horizontal offset - simple centering without width recalculation
        const remainingWidth = this.containerWidth - layout.heatmapWidth;
        if (remainingWidth >= effectivePadding * 2) {
            // Enough space to center horizontally
            layout.offsetX = remainingWidth / 2;
        }
        else {
            // Use minimal padding
            layout.offsetX = effectivePadding;
        }
        // Ensure offset doesn't cause overflow (final safety check)
        layout.offsetX = Math.max(0, Math.min(layout.offsetX, this.containerWidth - layout.heatmapWidth));
        // Center vertically with sufficient space for labels
        const minTopSpace = this.isSmallWidget ? 20 : 30; // Less space for small widgets
        const availableVerticalSpace = this.containerHeight - layout.totalHeight;
        if (availableVerticalSpace > minTopSpace * 2) {
            // Enough space to center vertically
            layout.offsetY = Math.max(minTopSpace, availableVerticalSpace / 2);
        }
        else {
            // Not enough space - use minimal top spacing
            layout.offsetY = minTopSpace;
        }
        // Ensure vertical offset doesn't cause overflow
        layout.offsetY = Math.max(0, Math.min(layout.offsetY, this.containerHeight - layout.totalHeight));
    }
}
