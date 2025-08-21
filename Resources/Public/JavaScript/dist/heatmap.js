/**
 * Module: @KonradMichalik/Typo3Heatmap/heatmap
 * Version: 2.0.0 - TypeScript implementation
 *
 * Main heatmap widget for TYPO3 dashboard widgets
 */
import { HeatmapRenderer } from './renderer.js';
/**
 * Main heatmap widget class for dashboard widgets
 */
class Heatmap {
    constructor() {
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        document.addEventListener('widgetContentRendered', (event) => {
            this.initializeWidget(event.target);
        });
        // Initialize existing widgets on DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeExistingWidgets();
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
            this.showError(container, 'Failed to load heatmap data');
            // Reset initialization flag on error
            container.dataset.initialized = 'false';
        }
    }
    initializeExistingWidgets() {
        const heatmapWidgets = document.querySelectorAll('.typo3-heatmap-widget');
        heatmapWidgets.forEach(widget => {
            const widgetElement = widget;
            if (widgetElement.dataset.initialized === 'true')
                return;
            const container = widgetElement.querySelector('#heatmap-container');
            if (!container)
                return;
            try {
                const config = JSON.parse(widgetElement.dataset.widgetConfig || '{}');
                const data = config.data || [];
                const options = {
                    duration: config.duration || 365,
                    color: config.color || '255,135,0',
                    tooltipItemSingular: config.tooltipItemSingular || 'change',
                    tooltipItemPlural: config.tooltipItemPlural || 'changes',
                    dateRangeMode: config.dateRangeMode || 'auto',
                    locale: 'en-GB',
                    showLegend: true,
                    showYearLabels: true,
                    showMonthLabels: true,
                    minCellSize: 8,
                    maxCellSize: 20,
                    tooltipWidth: 120,
                    tooltipHeight: 26,
                    legendLess: 'Less',
                    legendMore: 'More',
                    weekStartsOnMonday: false
                };
                container.innerHTML = '';
                container._heatmapRenderer = new HeatmapRenderer(container, data, options);
                widgetElement.dataset.initialized = 'true';
            }
            catch (error) {
                this.showError(container, 'Failed to load widget data');
            }
        });
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
            weekStartsOnMonday: !!+(dataset.optionsWeekStartsOnMonday || '0')
        };
    }
    showError(container, message) {
        container.innerHTML = `<div style="color: #d73a49; padding: 20px; text-align: center;">${message}</div>`;
    }
}
export default new Heatmap();
