/**
 * Module: @kmi/typo3contentheatmap/heatmap
 */
class Heatmap {

    constructor() {
        document.addEventListener('widgetContentRendered', function(event) {
            const container = event.target.querySelector('#heatmap-container');
            const data = JSON.parse(container.dataset.values);

            // @ToDo: Implement configuration options
            const config = {
                duration: 365,
                baseColor: '#ff8700',
            };

            const containerWidth = container.offsetWidth;
            const cellSize = containerWidth / (Math.floor(config.duration / 7) + 1);
            const height = 7 * cellSize + 40;

            const colorScale = count => {
                if (count === 0) return 'rgba(255,255,255,0)';
                const intensity = Math.min(count / 100, 1);
                const [r, g, b] = [255, 135, 0];
                return `rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.9})`;
            };

            const latestDate = new Date(data.reduce((latest, entry) => {
                return new Date(entry.change_date) > new Date(latest) ? entry.change_date : latest;
            }, '1970-01-01'));

            const startDate = new Date(latestDate);
            startDate.setDate(startDate.getDate() - config.duration + 1);
            const endDate = latestDate;

            const dateMap = new Map(data.map(d => [d.change_date, d.changes_count]));
            const allDates = [];

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateString = d.toISOString().split('T')[0];
                allDates.push({
                    change_date: dateString,
                    changes_count: dateMap.get(dateString) || 0
                });
            }

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', containerWidth);
            svg.setAttribute('height', height);
            svg.style.position = 'relative';
            svg.style.zIndex = '1';
            container.appendChild(svg);

            const tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            tooltipGroup.setAttribute('visibility', 'hidden');
            tooltipGroup.style.pointerEvents = 'none';
            tooltipGroup.style.zIndex = '100';

            const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            tooltip.setAttribute('id', 'tooltip');
            tooltip.setAttribute('width', 200);
            tooltip.setAttribute('height', 40);
            tooltip.setAttribute('fill', '#333');
            tooltip.setAttribute('rx', 5);
            tooltip.setAttribute('ry', 5);
            tooltipGroup.appendChild(tooltip);

            const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tooltipText.setAttribute('id', 'tooltip-text');
            tooltipText.setAttribute('fill', '#fff');
            tooltipText.setAttribute('font-size', '12px');
            tooltipText.setAttribute('text-anchor', 'middle');
            tooltipText.setAttribute('alignment-baseline', 'middle');
            tooltipGroup.appendChild(tooltipText);

            const totalWeeks = Math.ceil(config.duration / 7);

            const yearMarkers = new Set();
            const monthMarkers = new Set();

            allDates.forEach(d => {
                const date = new Date(d.change_date);
                const dayOfWeek = date.getDay();
                const startDayOfWeek = startDate.getDay();
                const weekOfYear = Math.floor((date - startDate + (startDayOfWeek * 24 * 60 * 60 * 1000)) / (7 * 24 * 60 * 60 * 1000));
                console.log(date);
                console.log(startDate);
                console.log(weekOfYear);

                // Rechteck für jeden Tag zeichnen
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', weekOfYear * cellSize);
                rect.setAttribute('y', dayOfWeek * cellSize);
                rect.setAttribute('width', cellSize - 1);
                rect.setAttribute('height', cellSize - 1);
                rect.setAttribute('fill', colorScale(d.changes_count));

                const weekDay = date.toLocaleString('default', { weekday: 'short' });
                const formattedDate = date.toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
                const title = `${weekDay}, ${formattedDate}: ${d.changes_count}`;
                rect.setAttribute('title', title);
                rect.style.zIndex = '1';

                // Jahreswechsel markieren
                if (date.getMonth() === 0 && date.getDate() === 1 && !yearMarkers.has(date.getFullYear())) {
                    yearMarkers.add(date.getFullYear());
                    const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    yearText.setAttribute('x', weekOfYear * cellSize + cellSize / 2);
                    yearText.setAttribute('y', 7 * cellSize + 15);
                    yearText.setAttribute('fill', '#000');
                    yearText.setAttribute('font-size', '12px');
                    yearText.setAttribute('text-anchor', 'middle');
                    yearText.textContent = date.getFullYear();
                    svg.appendChild(yearText);
                }

                if (date.getDate() === 1 && !monthMarkers.has(date.getMonth())) {
                    monthMarkers.add(date.getMonth());
                    const monthText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    monthText.setAttribute('x', weekOfYear * cellSize + cellSize / 2);
                    monthText.setAttribute('y', 7 * cellSize + 30); // Position unterhalb der Jahreszahl
                    monthText.setAttribute('fill', '#555');
                    monthText.setAttribute('font-size', '10px');
                    monthText.setAttribute('text-anchor', 'middle');
                    monthText.textContent = date.toLocaleString('default', { month: 'short' });
                    svg.appendChild(monthText);
                }

                rect.addEventListener('mouseover', event => {
                    const tooltipX = Math.max(10, Math.min(parseFloat(rect.getAttribute('x')) + cellSize / 2, containerWidth - 210));
                    const tooltipY = Math.max(10, parseFloat(rect.getAttribute('y')) - 50);

                    tooltipGroup.setAttribute('visibility', 'visible');
                    tooltip.setAttribute('x', tooltipX - 100);
                    tooltip.setAttribute('y', tooltipY);

                    tooltipText.textContent = title;
                    rect.setAttribute('title', title);
                    tooltipText.setAttribute('x', tooltipX);
                    tooltipText.setAttribute('y', tooltipY + 20);
                });

                rect.addEventListener('mouseout', () => {
                    tooltipGroup.setAttribute('visibility', 'hidden');
                });

                svg.appendChild(rect);
            });
            svg.appendChild(tooltipGroup);
        });
    }
}

export default new Heatmap();
