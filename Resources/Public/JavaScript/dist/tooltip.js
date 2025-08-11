/**
 * Module: @KonradMichalik/Typo3HeatmapWidget/tooltip
 *
 * SVG tooltip component for heatmap cells
 */
export class HeatmapTooltip {
    constructor(config, layout) {
        this.isVisible = false;
        this.config = config;
        this.layout = layout;
        this.createElements();
    }
    createElements() {
        // Create group container
        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.group.style.display = 'none';
        this.group.style.pointerEvents = 'none';
        // Create background rectangle
        this.background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.background.setAttribute('fill', '#24292e');
        this.background.setAttribute('rx', '3');
        this.background.setAttribute('ry', '3');
        this.background.setAttribute('stroke', 'rgba(255,255,255,0.2)');
        this.background.setAttribute('stroke-width', '1');
        // Create text element
        this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.text.setAttribute('fill', '#ffffff');
        this.text.setAttribute('font-size', '12px');
        this.text.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif');
        this.text.setAttribute('text-anchor', 'middle');
        this.text.setAttribute('dominant-baseline', 'middle');
        this.group.appendChild(this.background);
        this.group.appendChild(this.text);
    }
    show(x, y, content, containerWidth, containerHeight) {
        this.text.textContent = content;
        // Calculate text dimensions
        const textBBox = this.text.getBBox();
        const padding = 8;
        const tooltipWidth = textBBox.width + padding * 2;
        const tooltipHeight = textBBox.height + padding * 2;
        // Position tooltip to avoid overflow
        let tooltipX = x - tooltipWidth / 2;
        let tooltipY = y - tooltipHeight - 8; // 8px above cell
        // Adjust horizontal position to stay within container
        if (tooltipX < 0) {
            tooltipX = 0;
        }
        else if (tooltipX + tooltipWidth > containerWidth) {
            tooltipX = containerWidth - tooltipWidth;
        }
        // Adjust vertical position if needed
        if (tooltipY < 0) {
            tooltipY = y + this.layout.cellSize + 8; // Below cell instead
        }
        // Set background size and position
        this.background.setAttribute('x', tooltipX.toString());
        this.background.setAttribute('y', tooltipY.toString());
        this.background.setAttribute('width', tooltipWidth.toString());
        this.background.setAttribute('height', tooltipHeight.toString());
        // Set text position
        this.text.setAttribute('x', (tooltipX + tooltipWidth / 2).toString());
        this.text.setAttribute('y', (tooltipY + tooltipHeight / 2).toString());
        // Show tooltip
        this.group.style.display = 'block';
        this.isVisible = true;
    }
    hide() {
        this.group.style.display = 'none';
        this.isVisible = false;
    }
    isShowing() {
        return this.isVisible;
    }
}
