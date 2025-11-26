/**
 * Module de visualisation
 * Gère l'affichage graphique des agents et des séries temporelles
 */

export class Visualizer {
    /**
     * @param {HTMLCanvasElement} agentCanvas - Canvas pour afficher les agents
     * @param {HTMLCanvasElement} timeSeriesCanvas - Canvas pour les séries temporelles
     */
    constructor(agentCanvas, timeSeriesCanvas) {
        this.agentCanvas = agentCanvas;
        this.agentCtx = agentCanvas.getContext('2d');

        this.timeSeriesCanvas = timeSeriesCanvas;
        this.timeSeriesCtx = timeSeriesCanvas.getContext('2d');

        // Marges pour les graphiques
        this.margin = { top: 20, right: 20, bottom: 40, left: 60 };
    }

    /**
     * Convertit une valeur d'adhésion démocratique [-1, 1] en couleur
     * Rouge = autoritaire (-1), Vert = démocratique (+1)
     * @param {number} alpha - Adhésion démocratique
     * @returns {string} - Couleur au format RGB
     */
    alphaToColor(alpha) {
        // Normaliser alpha de [-1, 1] à [0, 1]
        const normalized = (alpha + 1) / 2;

        // Interpoler entre rouge (0) et vert (1)
        const red = Math.floor((1 - normalized) * 255);
        const green = Math.floor(normalized * 255);
        const blue = 50;

        return `rgb(${red}, ${green}, ${blue})`;
    }

    /**
     * Dessine tous les agents sur le canvas
     * @param {Array<Agent>} agents - Liste des agents
     */
    drawAgents(agents) {
        const ctx = this.agentCtx;
        const width = this.agentCanvas.width;
        const height = this.agentCanvas.height;

        // Effacer le canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Dessiner chaque agent comme un cercle coloré
        const radius = Math.max(2, Math.min(5, 300 / Math.sqrt(agents.length)));

        for (let agent of agents) {
            const x = agent.x * width;
            const y = agent.y * height;

            ctx.fillStyle = this.alphaToColor(agent.democraticAdherence);
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();

            // Optionnel: bordure pour améliorer la visibilité
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Légende
        this.drawColorLegend(ctx, width, height);
    }

    /**
     * Dessine une légende de couleur pour l'adhésion démocratique
     * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
     * @param {number} width - Largeur du canvas
     * @param {number} height - Hauteur du canvas
     */
    drawColorLegend(ctx, width, height) {
        const legendWidth = 200;
        const legendHeight = 20;
        const legendX = width - legendWidth - 20;
        const legendY = height - legendHeight - 20;

        // Dessiner le gradient
        const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
        gradient.addColorStop(0, this.alphaToColor(-1));
        gradient.addColorStop(0.5, this.alphaToColor(0));
        gradient.addColorStop(1, this.alphaToColor(1));

        ctx.fillStyle = gradient;
        ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

        // Bordure
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Autoritaire', legendX, legendY - 5);
        ctx.fillText('Démocratique', legendX + legendWidth, legendY - 5);
    }

    /**
     * Dessine les séries temporelles
     * @param {Object} history - Historique des variables macroscopiques
     */
    drawTimeSeries(history) {
        const ctx = this.timeSeriesCtx;
        const width = this.timeSeriesCanvas.width;
        const height = this.timeSeriesCanvas.height;

        // Effacer le canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        if (history.time.length < 2) return;

        // Calculer les dimensions du graphique
        const plotWidth = width - this.margin.left - this.margin.right;
        const plotHeight = height - this.margin.top - this.margin.bottom;

        // Trouver les bornes temporelles
        const minTime = Math.min(...history.time);
        const maxTime = Math.max(...history.time);

        // Fonctions de transformation
        const xScale = (t) => this.margin.left + ((t - minTime) / (maxTime - minTime)) * plotWidth;
        const yScale = (v) => this.margin.top + (1 - v) * plotHeight;

        // Dessiner les axes
        this.drawAxes(ctx, width, height, minTime, maxTime);

        // Dessiner les courbes
        const series = [
            { data: history.orderParameter, color: '#667eea', label: 'Ψ (paramètre d\'ordre)' },
            { data: history.institutionalQuality, color: '#2ecc71', label: 'Q (qualité inst.)' },
            { data: history.polarization, color: '#e74c3c', label: 'Φ (polarisation)' },
            { data: history.perceivedThreat, color: '#f39c12', label: 'M (menace)' }
        ];

        for (let s of series) {
            this.drawLine(ctx, history.time, s.data, s.color, xScale, yScale);
        }

        // Dessiner la légende
        this.drawLegend(ctx, series, width);
    }

    /**
     * Dessine les axes du graphique
     */
    drawAxes(ctx, width, height, minTime, maxTime) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        // Axe X
        ctx.beginPath();
        ctx.moveTo(this.margin.left, height - this.margin.bottom);
        ctx.lineTo(width - this.margin.right, height - this.margin.bottom);
        ctx.stroke();

        // Axe Y
        ctx.beginPath();
        ctx.moveTo(this.margin.left, this.margin.top);
        ctx.lineTo(this.margin.left, height - this.margin.bottom);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';

        // Label X
        ctx.textAlign = 'center';
        ctx.fillText('Temps (t)', width / 2, height - 5);

        // Label Y
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Valeur', 0, 0);
        ctx.restore();

        // Graduations Y
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = this.margin.top + (i / 5) * (height - this.margin.top - this.margin.bottom);
            const value = (1 - i / 5).toFixed(1);
            ctx.fillText(value, this.margin.left - 5, y + 4);

            // Ligne de grille
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.margin.left, y);
            ctx.lineTo(width - this.margin.right, y);
            ctx.stroke();
        }

        // Graduations X
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        const numTicks = 5;
        for (let i = 0; i <= numTicks; i++) {
            const x = this.margin.left + (i / numTicks) * (width - this.margin.left - this.margin.right);
            const time = minTime + (i / numTicks) * (maxTime - minTime);
            ctx.fillText(time.toFixed(1), x, height - this.margin.bottom + 15);
        }
    }

    /**
     * Dessine une ligne sur le graphique
     */
    drawLine(ctx, timeData, valueData, color, xScale, yScale) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < timeData.length; i++) {
            const x = xScale(timeData[i]);
            const y = yScale(Math.max(0, Math.min(1, valueData[i])));

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    /**
     * Dessine la légende des courbes
     */
    drawLegend(ctx, series, width) {
        const legendX = width - 180;
        const legendY = 30;
        const lineHeight = 20;

        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';

        for (let i = 0; i < series.length; i++) {
            const y = legendY + i * lineHeight;

            // Ligne de couleur
            ctx.strokeStyle = series[i].color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(legendX, y);
            ctx.lineTo(legendX + 20, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#000';
            ctx.fillText(series[i].label, legendX + 25, y + 4);
        }
    }

    /**
     * Met à jour l'affichage des métriques
     * @param {Object} state - État actuel du système
     */
    updateMetrics(state) {
        document.getElementById('orderParameter').textContent = state.orderParameter.toFixed(3);
        document.getElementById('avgAlpha').textContent = state.avgAlpha.toFixed(3);
        document.getElementById('instQuality').textContent = state.institutionalQuality.toFixed(3);
        document.getElementById('polarization').textContent = state.polarization.toFixed(3);
        document.getElementById('threat').textContent = state.perceivedThreat.toFixed(3);
        document.getElementById('time').textContent = state.time.toFixed(2);
    }
}
