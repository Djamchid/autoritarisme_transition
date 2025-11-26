/**
 * Module de visualisation en graphique araignée (radar chart)
 * Affiche les paramètres du modèle de façon visuelle
 */

export class RadarChart {
    /**
     * @param {HTMLCanvasElement} canvas - Canvas pour le radar chart
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.radius = Math.min(canvas.width, canvas.height) / 2 - 60;

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
    }

    /**
     * Dessine le radar chart avec les valeurs des paramètres
     * @param {Object} params - Objet contenant les valeurs des paramètres
     */
    draw(params) {
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
        ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        ctx.fill();

        // Bordure
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
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

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = param.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
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
}
