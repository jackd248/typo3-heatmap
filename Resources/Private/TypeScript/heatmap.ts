/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/heatmap
 * Version: 2.0.0 - TypeScript implementation
 *
 * Modular, configurable GitHub-style heatmap widget for TYPO3
 */

import { HeatmapRenderer } from './renderer.js';
import { HeatmapData, HeatmapOptions } from './types.js';

/**
 * Main heatmap widget class
 */
class Heatmap {
  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    document.addEventListener('widgetContentRendered', (event) => {
      this.initializeWidget(event.target as HTMLElement);
    });
  }

  private initializeWidget(target: HTMLElement): void {
    const container = target.querySelector('#heatmap-container') as HTMLElement;
    if (!container) return;

    // Prevent duplicate initialization
    if (container.dataset.initialized === 'true') return;
    container.dataset.initialized = 'true';

    try {
      const data: HeatmapData[] = JSON.parse(container.dataset.values || '[]');
      const options = this.parseOptions(container.dataset);

      // Clear any existing content
      container.innerHTML = '';

      // Store renderer instance for potential cleanup
      const renderer = new HeatmapRenderer(container, data, options);
      (container as any)._heatmapRenderer = renderer;
    } catch (error) {
      console.error('Error initializing heatmap:', error);
      this.showError(container, 'Failed to load heatmap data');
      // Reset initialization flag on error
      container.dataset.initialized = 'false';
    }
  }

  private parseOptions(dataset: DOMStringMap): HeatmapOptions {
    return {
      duration: parseInt(dataset.optionsDuration || '365'),
      dateRangeMode: (dataset.optionsDateRangeMode as 'year' | 'year-auto' | 'month' | 'auto') || 'auto',
      color: dataset.optionsColor || '255, 135, 0',
      locale: dataset.optionsLocale || 'de-DE',
      showLegend: dataset.optionsShowLegend !== 'false',
      showYearLabels: dataset.optionsShowYearLabels !== 'false',
      showMonthLabels: dataset.optionsShowMonthLabels !== 'false',
      minCellSize: parseInt(dataset.optionsMinCellSize || '8'),
      maxCellSize: parseInt(dataset.optionsMaxCellSize || '20'),
      tooltipWidth: parseInt(dataset.optionsTooltipWidth || '120'),
      tooltipHeight: parseInt(dataset.optionsTooltipHeight || '26'),
      weekStartsOnMonday: dataset.optionsWeekStartsOnMonday === 'true'
    };
  }

  private showError(container: HTMLElement, message: string): void {
    container.innerHTML = `<div style="color: #d73a49; padding: 20px; text-align: center;">${message}</div>`;
  }
}

export default new Heatmap();