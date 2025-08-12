/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/color-scale
 *
 * Color scale calculator for heatmap visualization
 */

import { HeatmapConfig } from './config.js';
import { HeatmapData } from './types.js';

export class ColorScale {
  private config: HeatmapConfig;
  private maxValue: number = 0;
  private thresholds: number[] = [];

  constructor(config: HeatmapConfig, data: HeatmapData[]) {
    this.config = config;
    this.calculateScale(data);
  }

  private calculateScale(data: HeatmapData[]): void {
    if (data.length === 0) {
      this.maxValue = 10;
      this.thresholds = [0, 1, 3, 6, 10];
      return;
    }

    // Find maximum value and calculate better distribution - support legacy field names
    const values = data.map(d => this.getCountValue(d)).filter(v => v > 0).sort((a, b) => a - b);
    this.maxValue = Math.max(...data.map(d => this.getCountValue(d)));

    // Better thresholds for low-value ranges (0-8 typical case)
    if (this.maxValue <= 8) {
      // For very low values, use each step to maximize visual differentiation
      this.thresholds = [0, 1, 2, 4, 6];
    } else if (this.maxValue <= 15) {
      // For medium-low values, use smaller steps
      this.thresholds = [0, 2, 4, 7, 11];
    } else if (this.maxValue <= 30) {
      // For medium values
      this.thresholds = [0, 1, 6, 15, 25];
    } else {
      // For high values, use quartile-based distribution
      const step = Math.ceil(this.maxValue / 5);
      this.thresholds = [0, step, step * 2, step * 3, step * 4];
    }

    console.log(`Color Scale Debug:`, {
      maxValue: this.maxValue,
      dataRange: values.length > 0 ? `${Math.min(...values)}-${Math.max(...values)}` : 'no data',
      thresholds: this.thresholds,
      sampleValues: values.slice(0, 10)
    });
  }

  public getColor(value: number): string {
    const { r, g, b } = this.config.color;

    // Empty state - use CSS custom property that adapts to dark/light mode
    if (value === 0) {
      return 'var(--typo3-heatmap-empty-color, rgba(235, 237, 240, 0.3))';
    }

    // Find threshold level (1-4)
    let level = 1;
    for (let i = 1; i < this.thresholds.length; i++) {
      if (value >= this.thresholds[i]) {
        level = i;
      }
    }

    // Better opacity distribution for low values
    // Use more aggressive scaling for better visual differentiation
    let opacity: number;
    switch (level) {
      case 1: opacity = 0.4; break; // More visible than empty
      case 2: opacity = 0.6; break; // More distinct from level 1
      case 3: opacity = 0.8; break; // Clear middle tone
      case 4: opacity = 1.0; break; // Maximum intensity
      default: opacity = 1.0; break; // Maximum intensity
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  public getThresholds(): number[] {
    return [...this.thresholds];
  }

  public getMaxValue(): number {
    return this.maxValue;
  }

  private getCountValue(data: HeatmapData): number {
    // Support new format first, fall back to legacy
    return data.count ?? data.changes_count ?? 0;
  }
}
