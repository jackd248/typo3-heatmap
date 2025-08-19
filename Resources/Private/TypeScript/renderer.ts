/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/renderer
 * Version: 2.1.0 - TypeScript GitHub-style heatmap with fixed positioning
 *
 * Simple GitHub-style heatmap renderer
 */

import {HeatmapConfig} from './config.js';
import {HeatmapLayoutCalculator} from './layout.js';
import {ColorScale} from './color-scale.js';
import {HeatmapTooltip} from './tooltip.js';
import {HeatmapData, HeatmapLayout, DateRange} from './types.js';

export class HeatmapRenderer {
    private container: HTMLElement;
    private data: HeatmapData[];
    private config: HeatmapConfig;
    private layout: HeatmapLayout;
    private colorScale: ColorScale;
    private svg?: SVGSVGElement;
    private mainGroup?: SVGGElement;
    private tooltip?: HeatmapTooltip;
    private allDates: HeatmapData[] = [];
    private dateRange?: DateRange;

    constructor(container: HTMLElement, data: HeatmapData[], options: Record<string, any> = {}) {
        this.container = container;
        this.data = data;
        this.config = new HeatmapConfig(options);
        this.colorScale = new ColorScale(this.config, data);

        // Process data first to calculate optimal duration
        this.processDataForLayout();

        // Calculate layout with optimal duration
        const layoutCalculator = new HeatmapLayoutCalculator(
            this.config,
            container.offsetWidth || 800,
            container.offsetHeight || 200
        );
        this.layout = layoutCalculator.calculate();

        this.render();
    }

    private processDataForLayout(): void {
        this.calculateDateRange();
        if (this.dateRange) {
            // Update config duration based on actual date range for optimal layout
            const actualDuration = Math.ceil((this.dateRange.end.getTime() - this.dateRange.start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
            this.config.duration = actualDuration;
        }
    }

    private render(): void {
        this.createSVG();
        this.processData();
        this.renderCells();
        this.renderLabels();
        this.renderLegend();
    }

    private createSVG(): void {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.layout.containerWidth.toString());
        this.svg.setAttribute('height', this.layout.containerHeight.toString());
        this.svg.style.display = 'block';

        this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.mainGroup.setAttribute('transform', `translate(${this.layout.offsetX}, ${this.layout.offsetY})`);
        this.svg.appendChild(this.mainGroup);

        this.tooltip = new HeatmapTooltip(this.config, this.layout);
        this.svg.appendChild(this.tooltip.group);

        this.container.appendChild(this.svg);
    }

    private processData(): void {
        this.calculateDateRange();

        if (!this.dateRange) {
            throw new Error('Date range calculation failed');
        }

        // Create date map with link support - support legacy field names
        const dateMap = new Map(this.data.map(d => {
            const dateStr = d.date || d.change_date || '';
            const count = d.count ?? d.changes_count ?? 0;
            const link = d.link;
            return [dateStr, {count, link}];
        }));

        this.allDates = [];

        for (let d = new Date(this.dateRange.start); d <= this.dateRange.end; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const dayData = dateMap.get(dateString);

            this.allDates.push({
                date: dateString,
                count: dayData?.count || 0,
                link: dayData?.link,
                dateObject: new Date(d),
                // Legacy support
                change_date: dateString,
                changes_count: dayData?.count || 0
            });
        }
    }

    private calculateDateRange(): void {
        const today = new Date();

        if (this.data.length === 0) {
            const end = new Date(today);
            const start = new Date(today);
            start.setDate(start.getDate() - 364);
            this.dateRange = {start, end};
            return;
        }

        // Support legacy field names
        const dates = this.data.map(d => new Date(d.date || d.change_date || '')).sort((a, b) => a.getTime() - b.getTime());
        const earliestData = dates[0];
        const latestData = dates[dates.length - 1];

        let start: Date, end: Date;

        switch (this.config.dateRangeMode) {
            case 'year':
                end = new Date(today);
                start = new Date(today);
                start.setDate(start.getDate() - 364);
                break;
            case 'month':
                end = new Date(today); // Always show until today
                start = new Date(end);
                start.setDate(start.getDate() - 29);
                break;
            case 'year-auto':
                // Show current year based on available data
                end = new Date(today); // Always show until today
                const yearStart = new Date(end.getFullYear(), 0, 1);
                start = new Date(Math.max(earliestData.getTime(), yearStart.getTime()));

                // Ensure at least 30 days for meaningful display
                const yearDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
                if (yearDays < 30) {
                    start = new Date(end);
                    start.setDate(start.getDate() - 29);
                }
                break;
            default: // 'auto'
                end = new Date(today); // Always show until today

                // Calculate optimal duration based on container dimensions for best space utilization
                const optimalDuration = this.calculateOptimalDuration();

                // Calculate days since first data
                const daysSinceFirstData = Math.ceil((end.getTime() - earliestData.getTime()) / (24 * 60 * 60 * 1000));

                if (daysSinceFirstData < 30) {
                    // Less than 30 days of data - show minimum 30 days
                    start = new Date(end);
                    start.setDate(start.getDate() - 29);
                } else if (daysSinceFirstData <= optimalDuration) {
                    // Show all available data if it fits optimally
                    start = new Date(earliestData);
                } else {
                    // Show optimal duration from end date - this may cut off older entries for better visualization
                    start = new Date(end);
                    start.setDate(start.getDate() - optimalDuration + 1);
                }
        }

        this.dateRange = {start, end};

        // Debug output
        console.log('Date Range Calculation:', {
            mode: this.config.dateRangeMode,
            today: today.toISOString().split('T')[0],
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            earliestData: earliestData.toISOString().split('T')[0],
            latestData: latestData.toISOString().split('T')[0],
            totalDays: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1
        });
    }

    private calculateOptimalDuration(): number {
        // Calculate optimal duration based on container size for best space utilization
        const containerWidth = this.container.offsetWidth || 800;
        const containerHeight = this.container.offsetHeight || 200;

        // Calculate available space more precisely
        const availableWidth = containerWidth - 40; // Reserve for padding
        const availableHeight = containerHeight - 85 - 20; // Reserve for labels (85px) + padding (20px)

        // Target larger cell size for better visibility
        const targetCellSize = Math.max(20, Math.min(30, Math.floor(availableHeight / 7))); // Prefer 20-30px cells

        // Calculate how many weeks fit with this target cell size
        const optimalWeeks = Math.floor(availableWidth / targetCellSize);
        const optimalDays = Math.min(optimalWeeks * 7, 365); // Max 1 year

        // Ensure minimum 30 days
        const finalDays = Math.max(30, optimalDays);

        console.log(`Duration Calculation:`, {
            containerWidth,
            containerHeight,
            availableWidth,
            availableHeight,
            targetCellSize,
            optimalWeeks,
            optimalDays,
            finalDays
        });

        return finalDays;
    }

    private renderCells(): void {
        if (!this.dateRange) return;

        // Calculate week boundaries based on configuration
        const weekStartOffset = this.config.weekStartsOnMonday ? 1 : 0; // Monday = 1, Sunday = 0

        // Calculate week start boundaries for proper alignment
        const startWeekStart = this.getWeekStart(this.dateRange.start);
        const endWeekStart = this.getWeekStart(this.dateRange.end);

        // Calculate total weeks based on week start boundaries
        const totalWeeks = Math.round((endWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

        this.allDates.forEach((d) => {
            if (!this.dateRange || !d.dateObject) return;

            const dayOfWeek = this.getDayOfWeekIndex(d.dateObject); // 0-6 based on week start configuration

            // Find the week start of the week containing this date
            const currentWeekStart = this.getWeekStart(d.dateObject);

            // Calculate how many weeks this date's week start is from the START date's week start
            const weeksFromStart = Math.round((currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

            // Skip dates that are outside our calculated range
            if (weeksFromStart < 0 || weeksFromStart >= totalWeeks) {
                return; // Skip rendering this date
            }

            this.renderCell(d, weeksFromStart, dayOfWeek);
        });
    }

    private getWeekStart(date: Date): Date {
        const weekStart = new Date(date);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        if (this.config.weekStartsOnMonday) {
            // Monday-based weeks: Monday = 0, Sunday = 6
            const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday becomes 6, others shift down
            weekStart.setDate(weekStart.getDate() - mondayOffset);
        } else {
            // Sunday-based weeks (GitHub style): Sunday = 0
            weekStart.setDate(weekStart.getDate() - dayOfWeek);
        }

        return weekStart;
    }

    private getDayOfWeekIndex(date: Date): number {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        if (this.config.weekStartsOnMonday) {
            // Monday-based: Monday = 0, Tuesday = 1, ..., Sunday = 6
            return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        } else {
            // Sunday-based (GitHub style): Sunday = 0, Monday = 1, ..., Saturday = 6
            return dayOfWeek;
        }
    }

    private renderCell(data: HeatmapData, weekIndex: number, dayOfWeek: number): void {
        if (!this.mainGroup) return;

        const count = data.count ?? data.changes_count ?? 0;

        // Create container for potential click handling
        const cellGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const x = weekIndex * this.layout.cellSize;
        const y = dayOfWeek * this.layout.cellSize;

        rect.setAttribute('x', x.toString());
        rect.setAttribute('y', y.toString());
        rect.setAttribute('width', (this.layout.cellSize - 1).toString());
        rect.setAttribute('height', (this.layout.cellSize - 1).toString());
        rect.setAttribute('rx', '2');
        rect.setAttribute('ry', '2');
        rect.setAttribute('fill', this.colorScale.getColor(count));
        rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
        rect.setAttribute('stroke-width', '1');

        // Add cursor pointer if link exists
        if (data.link) {
            rect.style.cursor = 'pointer';
            cellGroup.style.cursor = 'pointer';
        }

        cellGroup.appendChild(rect);
        this.addCellInteractivity(cellGroup, rect, data);
        this.mainGroup.appendChild(cellGroup);
    }

    private addCellInteractivity(cellGroup: SVGGElement, rect: SVGRectElement, data: HeatmapData): void {
        if (!this.tooltip) return;

        const tooltipContent = this.formatTooltipContent(data);

        // Mouse events
        const showTooltip = () => {
            if (!this.tooltip) return;

            const rectX = parseFloat(rect.getAttribute('x') || '0') + this.layout.offsetX;
            const rectY = parseFloat(rect.getAttribute('y') || '0') + this.layout.offsetY;

            this.tooltip.show(
                rectX + this.layout.cellSize / 2,
                rectY,
                tooltipContent,
                this.layout.containerWidth,
                this.layout.containerHeight
            );

            rect.setAttribute('stroke', '#1f2328');
            rect.setAttribute('stroke-width', '2');
            rect.style.filter = 'brightness(1.1)';
        };

        const hideTooltip = () => {
            if (!this.tooltip) return;

            this.tooltip.hide();
            rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
            rect.setAttribute('stroke-width', '1');
            rect.style.filter = 'none';
        };

        cellGroup.addEventListener('mouseover', showTooltip);
        cellGroup.addEventListener('mouseout', hideTooltip);

        // Click handler for links
        if (data.link) {
            cellGroup.addEventListener('click', (event) => {
                event.preventDefault();

                // Open the link directly (now using regular URLs)
                if (data.link) {
                    window.open(data.link, '_blank', 'noopener,noreferrer');
                }
            });
        }
    }

    private formatTooltipContent(data: HeatmapData): string {
        if (!data.dateObject) return '';

        const date = data.dateObject.toLocaleDateString(this.config.locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const count = data.count ?? data.changes_count ?? 0;
        const word = count === 1 ? this.config.tooltipItemSingular : this.config.tooltipItemPlural;

        let tooltip = `${date}: ${count} ${word}`;

        // Add click hint if link exists
        if (data.link) {
            tooltip += `\n↗`;
        }

        return tooltip;
    }

    private renderLabels(): void {
        this.renderMonthLabels();
        this.renderYearLabels();
    }

    private renderMonthLabels(): void {
        if (!this.config.showMonthLabels || !this.dateRange || !this.mainGroup) return;

        const months: Array<{ date: Date; weekIndex: number; month: number; year: number }> = [];

        // Calculate week start boundaries for consistent positioning
        const startWeekStart = this.getWeekStart(this.dateRange.start);

        for (let d = new Date(this.dateRange.start); d <= this.dateRange.end; d.setDate(d.getDate() + 1)) {
            if (d.getDate() === 1) {
                const currentWeekStart = this.getWeekStart(d);
                const weekIndex = Math.round((currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

                if (!months.find(m => m.month === d.getMonth() && m.year === d.getFullYear())) {
                    months.push({
                        date: new Date(d),
                        weekIndex,
                        month: d.getMonth(),
                        year: d.getFullYear()
                    });
                }
            }
        }

        months.forEach(monthData => {
            if (!this.mainGroup) return;

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', (monthData.weekIndex * this.layout.cellSize + this.layout.cellSize / 2).toString());
            text.setAttribute('y', '-5');
            text.setAttribute('fill', '#586069');
            text.setAttribute('font-size', '10px');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = monthData.date.toLocaleDateString(this.config.locale, {month: 'short'});
            this.mainGroup.appendChild(text);
        });
    }

    private renderYearLabels(): void {
        if (!this.config.showYearLabels || !this.dateRange || !this.mainGroup) return;

        const years: Array<{ date: Date; weekIndex: number; year: number }> = [];

        // Calculate week start boundaries for consistent positioning
        const startWeekStart = this.getWeekStart(this.dateRange.start);

        // First, look for New Year's Days (January 1st) within the date range
        for (let d = new Date(this.dateRange.start); d <= this.dateRange.end; d.setDate(d.getDate() + 1)) {
            if (d.getMonth() === 0 && d.getDate() === 1) {
                const currentWeekStart = this.getWeekStart(d);
                const weekIndex = Math.round((currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

                if (!years.find(y => y.year === d.getFullYear())) {
                    years.push({
                        date: new Date(d),
                        weekIndex,
                        year: d.getFullYear()
                    });
                }
            }
        }

        // If no year transitions found, add year labels for each unique year in the range
        if (years.length === 0) {
            const startYear = this.dateRange.start.getFullYear();
            const endYear = this.dateRange.end.getFullYear();

            for (let year = startYear; year <= endYear; year++) {
                // Find the first occurrence of this year in our date range
                let yearStartInRange: Date | null = null;

                if (year === startYear) {
                    // Use the actual start date for the first year
                    yearStartInRange = new Date(this.dateRange.start);
                } else {
                    // Use January 1st for subsequent years
                    const jan1 = new Date(year, 0, 1);
                    if (jan1 >= this.dateRange.start && jan1 <= this.dateRange.end) {
                        yearStartInRange = jan1;
                    }
                }

                if (yearStartInRange) {
                    const currentWeekStart = this.getWeekStart(yearStartInRange);
                    const weekIndex = Math.round((currentWeekStart.getTime() - startWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

                    years.push({
                        date: new Date(yearStartInRange),
                        weekIndex,
                        year
                    });
                }
            }
        }

        // If we still have no years, add the current year at a reasonable position
        if (years.length === 0) {
            const currentYear = this.dateRange.end.getFullYear();
            const totalWeeks = Math.ceil((this.dateRange.end.getTime() - this.dateRange.start.getTime()) / (7 * 24 * 60 * 60 * 1000));
            const centerWeek = Math.floor(totalWeeks / 2);

            years.push({
                date: new Date(this.dateRange.end),
                weekIndex: centerWeek,
                year: currentYear
            });
        }

        years.forEach(yearData => {
            if (!this.mainGroup) return;

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', (yearData.weekIndex * this.layout.cellSize + this.layout.cellSize / 2).toString());
            text.setAttribute('y', (this.layout.heatmapHeight + 20).toString());
            text.setAttribute('fill', '#24292e');
            text.setAttribute('font-size', Math.max(12, Math.min(14, this.layout.cellSize * 0.7)).toString() + 'px');
            text.setAttribute('font-weight', '600');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = yearData.year.toString();
            this.mainGroup.appendChild(text);
        });
    }

    private renderLegend(): void {
        if (!this.config.showLegend || this.layout.cellSize < 8 || !this.mainGroup) return;

        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const legendY = this.layout.heatmapHeight + 40;

        // Calculate label widths for dynamic spacing
        const lessTextWidth = this.estimateTextWidth(this.config.legendLess, 11);
        const moreTextWidth = this.estimateTextWidth(this.config.legendMore, 11);
        const squaresWidth = 5 * 12 - 2; // 5 squares * 12px spacing - 2px adjustment
        const minSpacing = 8; // Minimum spacing between elements

        // Calculate total legend width
        const totalLegendWidth = lessTextWidth + minSpacing + squaresWidth + minSpacing + moreTextWidth;
        const legendX = Math.max(0, this.layout.heatmapWidth - totalLegendWidth);

        // "Less" label - positioned at start
        const lessLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lessLabel.setAttribute('x', legendX.toString());
        lessLabel.setAttribute('y', legendY.toString());
        lessLabel.setAttribute('fill', '#586069');
        lessLabel.setAttribute('font-size', '11px');
        lessLabel.textContent = this.config.legendLess;
        legendGroup.appendChild(lessLabel);

        // Legend squares - positioned after less label + spacing
        const squaresStartX = legendX + lessTextWidth + minSpacing;
        const thresholds = this.colorScale.getThresholds();

        for (let i = 0; i < 5; i++) {
            const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            square.setAttribute('x', (squaresStartX + (i * 12)).toString());
            square.setAttribute('y', (legendY - 10).toString());
            square.setAttribute('width', '10');
            square.setAttribute('height', '10');
            square.setAttribute('rx', '2');

            if (i === 0) {
                square.setAttribute('fill', 'var(--typo3-heatmap-empty-color, rgba(235, 237, 240, 0.3))');
            } else {
                const {r, g, b} = this.config.color;
                const opacities = [0, 0.4, 0.6, 0.8, 1.0]; // Match ColorScale opacity values
                square.setAttribute('fill', `rgba(${r}, ${g}, ${b}, ${opacities[i]})`);
            }

            // Add hover tooltip with value range
            this.addLegendSquareTooltip(square, i, thresholds);

            legendGroup.appendChild(square);
        }

        // "More" label - positioned after squares + spacing
        const moreLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        moreLabel.setAttribute('x', (squaresStartX + squaresWidth + minSpacing).toString());
        moreLabel.setAttribute('y', legendY.toString());
        moreLabel.setAttribute('fill', '#586069');
        moreLabel.setAttribute('font-size', '11px');
        moreLabel.textContent = this.config.legendMore;
        legendGroup.appendChild(moreLabel);

        this.mainGroup.appendChild(legendGroup);
    }

    private estimateTextWidth(text: string, fontSize: number): number {
        // Rough estimation: average character width is about 0.6 * fontSize
        // This works well for typical fonts used in SVG
        return text.length * fontSize * 0.6;
    }

    private addLegendSquareTooltip(square: SVGRectElement, level: number, thresholds: number[]): void {
        if (!this.tooltip) return;

        let tooltipText: string;

        if (level === 0) {
            // Empty/no data
            tooltipText = '0';
        } else if (level === 4) {
            // Highest level - show threshold and above
            tooltipText = `${thresholds[level]}+`;
        } else {
            // Show range between thresholds
            const minValue = thresholds[level];
            const maxValue = thresholds[level + 1] - 1;
            tooltipText = minValue === maxValue ? `${minValue}` : `${minValue}-${maxValue}`;
        }

        const showTooltip = (event: MouseEvent) => {
            if (!this.tooltip) return;

            const squareX = parseFloat(square.getAttribute('x') || '0') + this.layout.offsetX;
            const squareY = parseFloat(square.getAttribute('y') || '0') + this.layout.offsetY;

            this.tooltip.show(
                squareX + 5, // Center on square horizontally
                squareY, // Position at square level vertically
                tooltipText,
                this.layout.containerWidth,
                this.layout.containerHeight
            );
        };

        const hideTooltip = () => {
            if (!this.tooltip) return;
            this.tooltip.hide();
        };

        square.addEventListener('mouseover', showTooltip);
        square.addEventListener('mouseout', hideTooltip);
    }

    public destroy(): void {
        if (this.container && this.svg) {
            this.container.removeChild(this.svg);
        }
    }
}
