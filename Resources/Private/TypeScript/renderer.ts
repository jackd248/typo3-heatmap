/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/renderer
 * Version: 2.1.0 - TypeScript GitHub-style heatmap with fixed positioning
 *
 * Simple GitHub-style heatmap renderer
 */

import { HeatmapConfig } from './config.js';
import { HeatmapLayoutCalculator } from './layout.js';
import { ColorScale } from './color-scale.js';
import { HeatmapTooltip } from './tooltip.js';
import { HeatmapData, HeatmapLayout, DateRange } from './types.js';

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

    // Create date map
    const dateMap = new Map(this.data.map(d => [d.change_date, d.changes_count]));
    this.allDates = [];
    
    for (let d = new Date(this.dateRange.start); d <= this.dateRange.end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      this.allDates.push({
        change_date: dateString,
        changes_count: dateMap.get(dateString) || 0,
        date: new Date(d)
      });
    }
  }

  private calculateDateRange(): void {
    const today = new Date();
    
    if (this.data.length === 0) {
      const end = new Date(today);
      const start = new Date(today);
      start.setDate(start.getDate() - 364);
      this.dateRange = { start, end };
      return;
    }

    const dates = this.data.map(d => new Date(d.change_date)).sort((a, b) => a.getTime() - b.getTime());
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
        end = new Date(Math.min(latestData.getTime(), today.getTime()));
        start = new Date(end);
        start.setDate(start.getDate() - 29);
        break;
      case 'year-auto':
        // Show current year based on available data
        end = new Date(Math.min(latestData.getTime(), today.getTime()));
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
        end = new Date(Math.min(latestData.getTime(), today.getTime()));
        
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

    this.dateRange = { start, end };
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
      if (!this.dateRange || !d.date) return;
      
      const dayOfWeek = this.getDayOfWeekIndex(d.date); // 0-6 based on week start configuration
      
      // Find the week start of the week containing this date
      const currentWeekStart = this.getWeekStart(d.date);
      
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

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = weekIndex * this.layout.cellSize;
    const y = dayOfWeek * this.layout.cellSize;

    rect.setAttribute('x', x.toString());
    rect.setAttribute('y', y.toString());
    rect.setAttribute('width', (this.layout.cellSize - 1).toString());
    rect.setAttribute('height', (this.layout.cellSize - 1).toString());
    rect.setAttribute('rx', '2');
    rect.setAttribute('ry', '2');
    rect.setAttribute('fill', this.colorScale.getColor(data.changes_count));
    rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
    rect.setAttribute('stroke-width', '1');

    this.addCellInteractivity(rect, data);
    this.mainGroup.appendChild(rect);
  }

  private addCellInteractivity(rect: SVGRectElement, data: HeatmapData): void {
    if (!this.tooltip) return;

    const tooltipContent = this.formatTooltipContent(data);

    rect.addEventListener('mouseover', () => {
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
    });

    rect.addEventListener('mouseout', () => {
      if (!this.tooltip) return;
      
      this.tooltip.hide();
      rect.setAttribute('stroke', 'rgba(27, 31, 35, 0.06)');
      rect.setAttribute('stroke-width', '1');
      rect.style.filter = 'none';
    });
  }

  private formatTooltipContent(data: HeatmapData): string {
    if (!data.date) return '';

    const date = data.date.toLocaleDateString(this.config.locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const count = data.changes_count;
    const word = this.config.locale.startsWith('de') 
      ? (count === 1 ? 'Änderung' : 'Änderungen')
      : (count === 1 ? 'change' : 'changes');

    return `${date}: ${count} ${word}`;
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
      text.textContent = monthData.date.toLocaleDateString(this.config.locale, { month: 'short' });
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
    const legendX = Math.max(0, this.layout.heatmapWidth - 140);

    // "Less" label
    const lessLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lessLabel.setAttribute('x', legendX.toString());
    lessLabel.setAttribute('y', legendY.toString());
    lessLabel.setAttribute('fill', '#586069');
    lessLabel.setAttribute('font-size', '11px');
    lessLabel.textContent = 'Less';
    legendGroup.appendChild(lessLabel);

    // Legend squares
    for (let i = 0; i < 5; i++) {
      const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square.setAttribute('x', (legendX + 35 + (i * 12)).toString());
      square.setAttribute('y', (legendY - 10).toString());
      square.setAttribute('width', '10');
      square.setAttribute('height', '10');
      square.setAttribute('rx', '2');

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
    moreLabel.setAttribute('x', (legendX + 100).toString());
    moreLabel.setAttribute('y', legendY.toString());
    moreLabel.setAttribute('fill', '#586069');
    moreLabel.setAttribute('font-size', '11px');
    moreLabel.textContent = 'More';
    legendGroup.appendChild(moreLabel);

    this.mainGroup.appendChild(legendGroup);
  }

  public destroy(): void {
    if (this.container && this.svg) {
      this.container.removeChild(this.svg);
    }
  }
}