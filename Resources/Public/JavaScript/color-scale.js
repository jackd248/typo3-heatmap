/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/color-scale
 *
 * Color scale calculator for dynamic intensity mapping
 */

export class ColorScale {
    constructor(config, data) {
        this.config = config;
        this.calculateQuartiles(data);
    }

    calculateQuartiles(data) {
        const counts = data.map(d => d.changes_count).filter(c => c > 0);
        if (counts.length === 0) {
            this.quartiles = { q1: 1, q2: 2, q3: 3, max: 4 };
            return;
        }

        const maxCount = Math.max(...counts);
        this.quartiles = {
            q1: Math.max(1, Math.ceil(maxCount * 0.25)),
            q2: Math.max(2, Math.ceil(maxCount * 0.5)),
            q3: Math.max(3, Math.ceil(maxCount * 0.75)),
            max: maxCount
        };
    }

    getColor(count) {
        if (count === 0) return '#ebedf0';

        const { r, g, b } = this.config.color;
        let intensity;

        if (count >= this.quartiles.max) intensity = 1.0;
        else if (count >= this.quartiles.q3) intensity = 0.8;
        else if (count >= this.quartiles.q2) intensity = 0.6;
        else if (count >= this.quartiles.q1) intensity = 0.4;
        else intensity = 0.2;

        return `rgba(${r}, ${g}, ${b}, ${intensity})`;
    }
}