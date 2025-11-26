/**
 * Module de visualisation en graphique araignée (radar chart)
 * Affiche les paramètres du modèle de façon visuelle
 */

export class RadarChart {
    /**
     * @param {HTMLCanvasElement} canvas - Canvas pour le radar chart
     * @param {Function} onParameterChange - Callback appelé quand un paramètre change
     */
    constructor(canvas, onParameterChange = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.radius = Math.min(canvas.width, canvas.height) / 2 - 60;

        // Zones de sensibilité {paramKey: {autocratic, democratic}}
        this.sensitivityZones = null;

        // Paramètres à visualiser
        this.parameters = [
            { key: 'beta1', label: 'β₁ éducation', max: 2, color: '#4CAF50' },
            { key: 'beta2', label: 'β₂ insécurité', max: 2, color: '#F44336' },
            { key: 'beta3', label: 'β₃ institutions', max: 2, color: '#2196F3' },
            { key: 'beta4', label: 'β₄ peur', max: 2, color: '#FF9800' },
            { key: 'mu1', label: 'μ₁ engagement', max: 1, color: '#9C27B0' },
            { key: 'mu2', label: 'μ₂ capture', max: 1, color: '#E91E63' },
            { key: 'mu3', label: 'μ₃ corruption', max: 1, color: '#607D8B' },
        ];

        this.numAxes = this.parameters.length;
        this.angleStep = (2 * Math.PI) / this.numAxes;

        // État d'interaction
        this.isDragging = false;
        this.currentParams = null;
        this.onParameterChange = onParameterChange;

        // Configurer les event listeners
        this.setupInteraction();
    }

    /**
     * Configure l'interaction utilisateur (clic et drag)
     */
    setupInteraction() {
        this.canvas.style.cursor = 'pointer';

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

        // Support tactile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseDown(touch);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseMove(touch);
        });
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());
    }

    /**
     * Gère le clic de souris
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.isDragging = true;
        this.updateParameterFromPosition(x, y);
    }

    /**
     * Gère le mouvement de la souris
     */
    handleMouseMove(e) {
        if (!this.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.updateParameterFromPosition(x, y);
    }

    /**
     * Gère le relâchement de la souris
     */
    handleMouseUp() {
        this.isDragging = false;
    }

    /**
     * Met à jour un paramètre en fonction de la position de la souris
     */
    updateParameterFromPosition(x, y) {
        if (!this.currentParams) return;

        // Calculer la distance et l'angle depuis le centre
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);

        // Ajuster l'angle pour correspondre à notre système (commence en haut)
        angle += Math.PI / 2;
        if (angle < 0) angle += 2 * Math.PI;

        // Trouver l'axe le plus proche
        const axisIndex = Math.round(angle / this.angleStep) % this.numAxes;
        const param = this.parameters[axisIndex];

        // Calculer la nouvelle valeur (normalisée entre 0 et max)
        const normalizedDistance = Math.min(distance / this.radius, 1);
        const newValue = normalizedDistance * param.max;

        // Arrondir pour avoir des valeurs propres
        const step = param.max >= 2 ? 0.1 : 0.05;
        const roundedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(0, Math.min(param.max, roundedValue));

        // Appeler le callback si la valeur a changé
        if (this.onParameterChange && this.currentParams[param.key] !== clampedValue) {
            this.onParameterChange(param.key, clampedValue);
        }
    }

    /**
     * Définit les zones de sensibilité à afficher
     * @param {Object} zones - Zones de sensibilité {paramKey: {autocratic, democratic}}
     */
    setSensitivityZones(zones) {
        this.sensitivityZones = zones;
    }

    /**
     * Dessine le radar chart avec les valeurs des paramètres
     * @param {Object} params - Objet contenant les valeurs des paramètres
     */
    draw(params) {
        this.currentParams = params;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Effacer le canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Dessiner les cercles concentriques (grille)
        this.drawGrid();

        // Dessiner les axes
        this.drawAxes();

        // Dessiner les zones de sensibilité si disponibles
        if (this.sensitivityZones) {
            this.drawSensitivityZones();
        }

        // Dessiner les données
        this.drawData(params);

        // Dessiner les labels
        this.drawLabels();
    }

    /**
     * Dessine la grille (cercles concentriques)
     */
    drawGrid() {
        const ctx = this.ctx;
        const levels = 5;

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        for (let i = 1; i <= levels; i++) {
            const r = (this.radius / levels) * i;

            ctx.beginPath();
            for (let j = 0; j <= this.numAxes; j++) {
                const angle = j * this.angleStep - Math.PI / 2;
                const x = this.centerX + r * Math.cos(angle);
                const y = this.centerY + r * Math.sin(angle);

                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();

            // Labels de niveau (0.2, 0.4, 0.6, 0.8, 1.0)
            if (i === levels) {
                ctx.fillStyle = '#999';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Max', this.centerX, this.centerY - r - 5);
            }
        }
    }

    /**
     * Dessine les axes radiaux
     */
    drawAxes() {
        const ctx = this.ctx;

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;

        for (let i = 0; i < this.numAxes; i++) {
            const angle = i * this.angleStep - Math.PI / 2;
            const x = this.centerX + this.radius * Math.cos(angle);
            const y = this.centerY + this.radius * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    /**
     * Dessine les données sous forme de polygone coloré
     * @param {Object} params - Valeurs des paramètres
     */
    drawData(params) {
        const ctx = this.ctx;

        ctx.beginPath();

        for (let i = 0; i < this.numAxes; i++) {
            const param = this.parameters[i];
            const value = params[param.key] || 0;
            const normalizedValue = value / param.max;
            const r = this.radius * normalizedValue;

            const angle = i * this.angleStep - Math.PI / 2;
            const x = this.centerX + r * Math.cos(angle);
            const y = this.centerY + r * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();

        // Remplissage semi-transparent
        ctx.fillStyle = this.isDragging ? 'rgba(102, 126, 234, 0.5)' : 'rgba(102, 126, 234, 0.3)';
        ctx.fill();

        // Bordure
        ctx.strokeStyle = this.isDragging ? 'rgba(102, 126, 234, 1)' : 'rgba(102, 126, 234, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Points sur chaque axe
        for (let i = 0; i < this.numAxes; i++) {
            const param = this.parameters[i];
            const value = params[param.key] || 0;
            const normalizedValue = value / param.max;
            const r = this.radius * normalizedValue;

            const angle = i * this.angleStep - Math.PI / 2;
            const x = this.centerX + r * Math.cos(angle);
            const y = this.centerY + r * Math.sin(angle);

            // Points plus gros pendant le drag
            const pointRadius = this.isDragging ? 6 : 4;

            ctx.beginPath();
            ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = param.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    /**
     * Dessine les zones de sensibilité [p_autocratique, p_démocratique]
     */
    drawSensitivityZones() {
        const ctx = this.ctx;

        for (let i = 0; i < this.numAxes; i++) {
            const param = this.parameters[i];
            const zone = this.sensitivityZones[param.key];

            if (!zone) continue;

            // Calculer les positions radiales
            const rMin = this.radius * (zone.min / param.max);
            const rMax = this.radius * (zone.max / param.max);

            const angle = i * this.angleStep - Math.PI / 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            // Dessiner une barre colorée sur l'axe
            const x1 = this.centerX + rMin * cos;
            const y1 = this.centerY + rMin * sin;
            const x2 = this.centerX + rMax * cos;
            const y2 = this.centerY + rMax * sin;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';  // Vert semi-transparent
            ctx.lineWidth = 8;
            ctx.stroke();

            // Marquer les seuils
            const xAuto = this.centerX + (this.radius * zone.autocratic / param.max) * cos;
            const yAuto = this.centerY + (this.radius * zone.autocratic / param.max) * sin;
            const xDemo = this.centerX + (this.radius * zone.democratic / param.max) * cos;
            const yDemo = this.centerY + (this.radius * zone.democratic / param.max) * sin;

            // Point autocratique (rouge)
            ctx.beginPath();
            ctx.arc(xAuto, yAuto, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#F44336';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Point démocratique (bleu)
            ctx.beginPath();
            ctx.arc(xDemo, yDemo, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#2196F3';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Légende
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#F44336';
        ctx.fillText('● ψ=0 (autocratique)', 10, this.canvas.height - 30);
        ctx.fillStyle = '#2196F3';
        ctx.fillText('● ψ=0.3 (démocratique)', 10, this.canvas.height - 15);
        ctx.fillStyle = 'rgba(76, 175, 80, 0.5)';
        ctx.fillText('▬ Zone de transition', 10, this.canvas.height - 45);
    }

    /**
     * Dessine les labels des axes
     */
    drawLabels() {
        const ctx = this.ctx;
        const labelOffset = 35;

        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < this.numAxes; i++) {
            const param = this.parameters[i];
            const angle = i * this.angleStep - Math.PI / 2;
            const x = this.centerX + (this.radius + labelOffset) * Math.cos(angle);
            const y = this.centerY + (this.radius + labelOffset) * Math.sin(angle);

            // Fond pour le label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const textWidth = ctx.measureText(param.label).width;
            ctx.fillRect(x - textWidth / 2 - 5, y - 10, textWidth + 10, 20);

            // Texte du label avec couleur
            ctx.fillStyle = param.color;
            ctx.fillText(param.label, x, y);
        }

        // Indication d'interactivité
        ctx.font = 'italic 10px sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('Cliquez et glissez pour ajuster', this.centerX, this.canvas.height - 10);
    }

    /**
     * Redimensionne le canvas
     * @param {number} width - Nouvelle largeur
     * @param {number} height - Nouvelle hauteur
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.radius = Math.min(width, height) / 2 - 60;
    }

    /**
     * Double la taille du radar
     */
    doubleSize() {
        const currentWidth = this.canvas.width;
        const currentHeight = this.canvas.height;
        this.resize(currentWidth * 2, currentHeight * 2);
    }
}
