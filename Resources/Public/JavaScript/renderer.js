/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/renderer
 *
 * Main heatmap renderer class
 */

import { HeatmapConfig } from './config.js';
import { HeatmapLayout } from './layout.js';
import { ColorScale } from './color-scale.js';
import { HeatmapTooltip } from './tooltip.js';

export class HeatmapRenderer {
    constructor(container, data, options = {}) {
        this.container = container;
        this.data = data;
        this.config = new HeatmapConfig(options);
        this.layout = new HeatmapLayout(
            this.config,
            container.offsetWidth,
            container.offsetHeight || 200
        );
        this.colorScale = new ColorScale(this.config, data);

        this.render();
    }

    render() {
        this.createSVG();
        this.createMainGroup();
        this.tooltip = new HeatmapTooltip(this.config, this.layout);
        this.svg.appendChild(this.tooltip.group);

        this.processData();
        this.renderCells();
        this.renderLabels();
        this.renderLegend();
    }

    createSVG() {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.layout.containerWidth);
        // Add extra space to prevent label cutoff
        this.svg.setAttribute('height', Math.max(this.layout.totalHeight + 50, this.layout.containerHeight));
        this.container.appendChild(this.svg);
    }

    createMainGroup() {
        this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.mainGroup.setAttribute('transform',
            `translate(${this.layout.offsetX}, ${this.layout.offsetY})`
        );
        this.svg.appendChild(this.mainGroup);
    }

    processData() {
        this.calculateDateRange();

        // Create date map and generate all dates
        const dateMap = new Map(this.data.map(d => [d.change_date, d.changes_count]));
        this.allDates = [];

        for (let d = new Date(this.startDate); d <= this.endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            this.allDates.push({
                change_date: dateString,
                changes_count: dateMap.get(dateString) || 0,
                date: new Date(d)
            });
        }
    }

    calculateDateRange() {
        if (this.data.length === 0) {
            // No data - show last 30 days
            this.endDate = new Date();
            this.startDate = new Date();
            this.startDate.setDate(this.startDate.getDate() - 29);
            return;
        }

        // Find earliest and latest dates with data
        const dates = this.data.map(d => new Date(d.change_date)).sort((a, b) => a - b);
        const earliestDataDate = dates[0];
        const latestDataDate = dates[dates.length - 1];
        const today = new Date();

        switch (this.config.dateRangeMode) {
            case 'month':
                this.endDate = new Date(Math.min(latestDataDate, today));
                this.startDate = new Date(this.endDate);
                this.startDate.setDate(this.startDate.getDate() - 29);
                break;

            case 'year':
                this.endDate = new Date(Math.min(latestDataDate, today));
                this.startDate = new Date(this.endDate);
                this.startDate.setDate(this.startDate.getDate() - 364);
                break;

            case 'auto':
            default:
                this.endDate = new Date(Math.min(latestDataDate, today));

                // Calculate days since first data
                const daysSinceFirstData = Math.ceil((this.endDate - earliestDataDate) / (24 * 60 * 60 * 1000));

                if (daysSinceFirstData < 30) {
                    // Less than 30 days of data - show 30 days
                    this.startDate = new Date(this.endDate);
                    this.startDate.setDate(this.startDate.getDate() - 29);
                } else if (daysSinceFirstData < 365) {
                    // Less than a year - show from first data date
                    this.startDate = new Date(earliestDataDate);
                } else {
                    // More than a year - show last 365 days or from specified duration
                    const daysToShow = Math.min(this.config.duration, 365);
                    this.startDate = new Date(this.endDate);
                    this.startDate.setDate(this.startDate.getDate() - daysToShow + 1);
                }
                break;
        }

        // Ensure minimum 30 days
        const actualDays = Math.ceil((this.endDate - this.startDate) / (24 * 60 * 60 * 1000)) + 1;
        if (actualDays < 30) {
            this.startDate = new Date(this.endDate);
            this.startDate.setDate(this.startDate.getDate() - 29);
        }

        // Update duration based on actual calculated range
        const actualDuration = Math.ceil((this.endDate - this.startDate) / (24 * 60 * 60 * 1000)) + 1;
        this.config.duration = actualDuration;

        // Recalculate layout with new duration to ensure optimal space usage
        this.layout = new HeatmapLayout(
            this.config,
            this.layout.containerWidth,
            this.layout.containerHeight
        );
    }

    renderCells() {
        const yearMarkers = new Set();
        const monthMarkers = new Set();

        this.allDates.forEach((d, index) => {
            const dayOfWeek = d.date.getDay();
            const startDayOfWeek = this.startDate.getDay();
            const absoluteWeek = Math.floor(
                (d.date - this.startDate + (startDayOfWeek * 24 * 60 * 60 * 1000)) /
                (7 * 24 * 60 * 60 * 1000)
            );

            const currentRow = Math.floor(absoluteWeek / this.layout.weeksPerRow);
            const weekInRow = absoluteWeek % this.layout.weeksPerRow;

            this.renderCell(d, currentRow, weekInRow, dayOfWeek);
            this.renderDateLabels(d, currentRow, weekInRow, dayOfWeek, yearMarkers, monthMarkers);
        });
    }

    renderCell(d, currentRow, weekInRow, dayOfWeek) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const x = weekInRow * this.layout.cellSize;
        const y = currentRow * (this.layout.singleRowHeight + (this.layout.rowSpacing || 0)) +
                  dayOfWeek * this.layout.cellSize;

        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', this.layout.cellSize - this.config.cellSpacing);
        rect.setAttribute('height', this.layout.cellSize - this.config.cellSpacing);
        rect.setAttribute('rx', Math.min(3, this.layout.cellSize / 4));
        rect.setAttribute('ry', Math.min(3, this.layout.cellSize / 4));
        rect.setAttribute('fill', this.colorScale.getColor(d.changes_count));
        rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
        rect.setAttribute('stroke-width', '1');

        this.addCellInteractivity(rect, d, x, y);
        this.mainGroup.appendChild(rect);
    }

    addCellInteractivity(rect, d, x, y) {
        const tooltipContent = this.formatTooltipContent(d);

        rect.addEventListener('mouseover', () => {
            const rectX = parseFloat(rect.getAttribute('x')) + this.layout.offsetX;
            const rectY = parseFloat(rect.getAttribute('y')) + this.layout.offsetY;

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
        });

        rect.addEventListener('mouseout', () => {
            this.tooltip.hide();
            rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
            rect.setAttribute('stroke-width', '1');
            rect.style.filter = 'none';
        });
    }

    formatTooltipContent(d) {
        const date = d.date.toLocaleDateString(this.config.locale, {
            day: '2-digit',
            month: '2-digit'
        });

        const changes = d.changes_count === 0 ? '0' :
                       d.changes_count === 1 ? '1' :
                       `${d.changes_count}`;

        return `${date}: ${changes}`; // Kompakter: "04.08: 9" statt "04.08.2025: 9 Änderungen"
    }

    renderDateLabels(d, currentRow, weekInRow, dayOfWeek, yearMarkers, monthMarkers) {
        if (this.config.showYearLabels &&
            d.date.getMonth() === 0 &&
            d.date.getDate() === 1 &&
            !yearMarkers.has(d.date.getFullYear())) {

            this.renderYearLabel(d.date, weekInRow, currentRow);
            yearMarkers.add(d.date.getFullYear());
        }

        if (this.config.showMonthLabels &&
            d.date.getDate() === 1 &&
            !monthMarkers.has(`${d.date.getMonth()}-${currentRow}`) &&
            this.layout.cellSize >= 10) {

            this.renderMonthLabel(d.date, weekInRow, currentRow);
            monthMarkers.add(`${d.date.getMonth()}-${currentRow}`);
        }
    }

    renderYearLabel(date, weekInRow, currentRow) {
        const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yearText.setAttribute('x', weekInRow * this.layout.cellSize + this.layout.cellSize / 2);
        // Position year label below all rows with proper spacing
        yearText.setAttribute('y', this.layout.heatmapHeight + 20);
        yearText.setAttribute('fill', '#24292e');
        yearText.setAttribute('font-size', Math.max(12, Math.min(14, this.layout.cellSize * 0.7)) + 'px');
        yearText.setAttribute('font-weight', '600');
        yearText.setAttribute('text-anchor', 'middle');
        yearText.textContent = date.getFullYear();
        this.mainGroup.appendChild(yearText);
    }

    renderMonthLabel(date, weekInRow, currentRow) {
        const monthText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        monthText.setAttribute('x', weekInRow * this.layout.cellSize + this.layout.cellSize / 2);

        // Position month label above the heatmap with sufficient spacing
        let yPosition;
        if (this.layout.rows === 1) {
            // Single row: position above heatmap with more spacing to prevent cutoff
            yPosition = -5;
        } else {
            // Multi row: position above each row with adequate spacing
            yPosition = currentRow * (this.layout.singleRowHeight + (this.layout.rowSpacing || 0)) - 5;
        }

        monthText.setAttribute('y', yPosition);
        monthText.setAttribute('fill', '#586069');
        monthText.setAttribute('font-size', Math.max(10, Math.min(12, this.layout.cellSize * 0.6)) + 'px');
        monthText.setAttribute('text-anchor', 'middle');
        monthText.textContent = date.toLocaleDateString(this.config.locale, { month: 'short' });
        this.mainGroup.appendChild(monthText);
    }

    renderLabels() {
        if (!this.config.showYearLabels && !this.config.showMonthLabels) return;
        // Labels are rendered in renderDateLabels method
    }

    renderLegend() {
        if (!this.config.showLegend || this.layout.cellSize < 8) return;

        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const legendY = this.layout.heatmapHeight + 40;
        const legendX = Math.max(0, this.layout.heatmapWidth - 140);

        // "Less" label
        const lessLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lessLabel.setAttribute('x', legendX);
        lessLabel.setAttribute('y', legendY);
        lessLabel.setAttribute('fill', '#586069');
        lessLabel.setAttribute('font-size', '11px');
        lessLabel.textContent = 'Less';
        legendGroup.appendChild(lessLabel);

        // Legend squares
        for (let i = 0; i < 5; i++) {
            const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            square.setAttribute('x', legendX + 35 + (i * 12));
            square.setAttribute('y', legendY - 10);
            square.setAttribute('width', 10);
            square.setAttribute('height', 10);
            square.setAttribute('rx', 2);

            if (i === 0) {
                square.setAttribute('fill', '#ebedf0');
            } else {
                const { r, g, b } = this.config.color;
                square.setAttribute('fill', `rgba(${r}, ${g}, ${b}, ${0.2 * i})`);
            }
            legendGroup.appendChild(square);
        }

        // "More" label
        const moreLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        moreLabel.setAttribute('x', legendX + 100);
        moreLabel.setAttribute('y', legendY);
        moreLabel.setAttribute('fill', '#586069');
        moreLabel.setAttribute('font-size', '11px');
        moreLabel.textContent = 'More';
        legendGroup.appendChild(moreLabel);

        this.mainGroup.appendChild(legendGroup);
    }
}