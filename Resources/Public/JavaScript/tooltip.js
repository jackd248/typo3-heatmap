/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/tooltip
 *
 * Tooltip management system
 */

export class HeatmapTooltip {
    constructor(config, layout) {
        this.config = config;
        this.layout = layout;
        this.createTooltip();
    }

    createTooltip() {
        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.group.setAttribute('visibility', 'hidden');
        this.group.style.pointerEvents = 'none';
        this.group.style.zIndex = '1000';

        this.background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.background.setAttribute('width', this.config.tooltipWidth);
        this.background.setAttribute('height', this.config.tooltipHeight);
        this.background.setAttribute('fill', 'rgba(0, 0, 0, 0.9)');
        this.background.setAttribute('rx', 6);
        this.background.setAttribute('ry', 6);
        this.background.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
        this.background.setAttribute('stroke-width', '1');

        this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.text.setAttribute('fill', '#fff');
        this.text.setAttribute('font-size', '11px');
        this.text.setAttribute('font-weight', '500');
        this.text.setAttribute('text-anchor', 'middle');
        this.text.setAttribute('alignment-baseline', 'middle');

        this.group.appendChild(this.background);
        this.group.appendChild(this.text);
    }

    show(x, y, content, containerWidth, containerHeight) {
        // Measure text to adjust tooltip width dynamically
        this.text.textContent = content;
        const textLength = content.length;
        const dynamicWidth = Math.min(Math.max(textLength * 6.5, this.config.tooltipWidth), 160);

        // Smart positioning with dynamic width
        let tooltipX = x;
        let tooltipY = y - this.config.tooltipHeight - 10;

        // Horizontal overflow protection
        if (tooltipX + dynamicWidth / 2 > containerWidth - 5) {
            tooltipX = containerWidth - dynamicWidth / 2 - 5;
        }
        if (tooltipX - dynamicWidth / 2 < 5) {
            tooltipX = dynamicWidth / 2 + 5;
        }

        // Vertical overflow protection
        if (tooltipY < 5) {
            tooltipY = y + 25; // Show below if no space above
        }

        this.group.setAttribute('visibility', 'visible');
        this.background.setAttribute('width', dynamicWidth);
        this.background.setAttribute('x', tooltipX - dynamicWidth / 2);
        this.background.setAttribute('y', tooltipY);

        this.text.setAttribute('x', tooltipX);
        this.text.setAttribute('y', tooltipY + this.config.tooltipHeight / 2);
    }

    hide() {
        this.group.setAttribute('visibility', 'hidden');
    }
}