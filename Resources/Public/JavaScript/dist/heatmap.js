/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/heatmap
 * Version: 2.0.0 - TypeScript implementation
 *
 * Modular, configurable GitHub-style heatmap widget for TYPO3
 */
import { HeatmapRenderer } from './renderer.js';
/**
 * Main heatmap widget class
 */
class Heatmap {
    constructor() {
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        document.addEventListener('widgetContentRendered', (event) => {
            this.initializeWidget(event.target);
        });
    }
    initializeWidget(target) {
        const container = target.querySelector('#heatmap-container');
        if (!container)
            return;
        // Prevent duplicate initialization
        if (container.dataset.initialized === 'true')
            return;
        container.dataset.initialized = 'true';
        try {
            const data = JSON.parse(container.dataset.values || '[]');
            const options = this.parseOptions(container.dataset);
            // Clear any existing content
            container.innerHTML = '';
            // Store renderer instance for potential cleanup
            container._heatmapRenderer = new HeatmapRenderer(container, data, options);
        }
        catch (error) {
            console.error('Error initializing heatmap:', error);
            this.showError(container, 'Failed to load heatmap data');
            // Reset initialization flag on error
            container.dataset.initialized = 'false';
        }
    }
    parseOptions(dataset) {
        return {
            duration: parseInt(dataset.optionsDuration || '365'),
            dateRangeMode: dataset.optionsDateRangeMode || 'auto',
            color: dataset.optionsColor || '255, 135, 0',
            locale: dataset.optionsLocale || 'en-GB',
            showLegend: dataset.optionsShowLegend !== 'false',
            showYearLabels: dataset.optionsShowYearLabels !== 'false',
            showMonthLabels: dataset.optionsShowMonthLabels !== 'false',
            minCellSize: parseInt(dataset.optionsMinCellSize || '8'),
            maxCellSize: parseInt(dataset.optionsMaxCellSize || '20'),
            tooltipWidth: parseInt(dataset.optionsTooltipWidth || '120'),
            tooltipHeight: parseInt(dataset.optionsTooltipHeight || '26'),
            tooltipItemSingular: dataset.optionsTooltipItemSingular || 'change',
            tooltipItemPlural: dataset.optionsTooltipItemPlural || 'changes',
            legendLess: dataset.optionsLegendLess || 'Less',
            legendMore: dataset.optionsLegendMore || 'More',
            weekStartsOnMonday: dataset.optionsWeekStartsOnMonday === 'true'
        };
    }
    showError(container, message) {
        container.innerHTML = `<div style="color: #d73a49; padding: 20px; text-align: center;">${message}</div>`;
    }
}
export default new Heatmap();
