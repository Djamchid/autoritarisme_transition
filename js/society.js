/**
 * Classe représentant la société dans son ensemble
 * Contient les variables macroscopiques et les méthodes de calcul
 */
export class Society {
    /**
     * @param {Array<Agent>} agents - Liste des agents de la société
     */
    constructor(agents) {
        this.agents = agents;

        // Variables macroscopiques (champ)
        this.gini = 0.3;            // G - Inégalité (coefficient de Gini)
        this.precarity = 0.2;       // P - Précarité
        this.diversity = 0.5;       // D - Diversité culturelle
        this.institutionalQuality = 0.7;  // Q - Qualité institutionnelle
        this.polarization = 0.2;    // Φ - Polarisation
        this.perceivedThreat = 0.2; // M - Menace perçue

        // Variable exogène
        this.externalThreat = 0.2;  // M_ext - Menace externe

        // Historique pour les graphiques
        this.history = {
            time: [],
            orderParameter: [],
            avgAlpha: [],
            institutionalQuality: [],
            polarization: [],
            perceivedThreat: []
        };
    }

    /**
     * Calcule le coefficient de Gini à partir de la distribution des richesses
     * @returns {number} - Coefficient de Gini
     */
    calculateGini() {
        const n = this.agents.length;
        const wealths = this.agents.map(a => a.wealth).sort((a, b) => a - b);
        const totalWealth = wealths.reduce((sum, w) => sum + w, 0);

        if (totalWealth === 0) return 0;

        let giniSum = 0;
        for (let i = 0; i < n; i++) {
            giniSum += (2 * (i + 1) - n - 1) * wealths[i];
        }

        return giniSum / (n * totalWealth);
    }

    /**
     * Calcule la moyenne d'une propriété sur tous les agents
     * @param {string} property - Nom de la propriété
     * @returns {number} - Moyenne de la propriété
     */
    getAverage(property) {
        const sum = this.agents.reduce((acc, agent) => acc + agent[property], 0);
        return sum / this.agents.length;
    }

    /**
     * Calcule l'écart-type d'une propriété sur tous les agents
     * @param {string} property - Nom de la propriété
     * @returns {number} - Écart-type de la propriété
     */
    getStdDev(property) {
        const avg = this.getAverage(property);
        const squaredDiffs = this.agents.reduce((acc, agent) => {
            const diff = agent[property] - avg;
            return acc + diff * diff;
        }, 0);
        return Math.sqrt(squaredDiffs / this.agents.length);
    }

    /**
     * Calcule le paramètre d'ordre Ψ = ⟨α⟩ · Q
     * @returns {number} - Paramètre d'ordre
     */
    getOrderParameter() {
        const avgAlpha = this.getAverage('democraticAdherence');
        return avgAlpha * this.institutionalQuality;
    }

    /**
     * Met à jour les variables macroscopiques selon les dérivées calculées
     * @param {Object} derivatives - Objet contenant les dérivées macroscopiques
     * @param {number} dt - Pas de temps
     */
    update(derivatives, dt) {
        this.institutionalQuality += derivatives.dQ * dt;
        this.polarization += derivatives.dPhi * dt;
        this.perceivedThreat += derivatives.dM * dt;

        // Bornage des valeurs
        this.institutionalQuality = Math.max(0, Math.min(1, this.institutionalQuality));
        this.polarization = Math.max(0, Math.min(1, this.polarization));
        this.perceivedThreat = Math.max(0, Math.min(1, this.perceivedThreat));

        // Mise à jour du Gini et de la précarité
        this.gini = this.calculateGini();
        this.precarity = 1 - this.getAverage('security');
    }

    /**
     * Ajoute un point dans l'historique
     * @param {number} time - Temps actuel
     */
    addToHistory(time) {
        this.history.time.push(time);
        this.history.orderParameter.push(this.getOrderParameter());
        this.history.avgAlpha.push(this.getAverage('democraticAdherence'));
        this.history.institutionalQuality.push(this.institutionalQuality);
        this.history.polarization.push(this.polarization);
        this.history.perceivedThreat.push(this.perceivedThreat);

        // Limiter la taille de l'historique pour éviter les problèmes de mémoire
        const maxHistoryLength = 1000;
        if (this.history.time.length > maxHistoryLength) {
            for (let key in this.history) {
                this.history[key].shift();
            }
        }
    }

    /**
     * Réinitialise la société
     * @param {number} initQ - Qualité institutionnelle initiale
     * @param {number} initGini - Inégalité initiale
     * @param {number} extThreat - Menace externe
     */
    reset(initQ = 0.7, initGini = 0.3, extThreat = 0.2) {
        this.institutionalQuality = initQ;
        this.gini = initGini;
        this.externalThreat = extThreat;
        this.polarization = 0.2;
        this.perceivedThreat = 0.2;
        this.diversity = 0.5;

        // Réinitialiser l'historique
        this.history = {
            time: [],
            orderParameter: [],
            avgAlpha: [],
            institutionalQuality: [],
            polarization: [],
            perceivedThreat: []
        };

        // Réinitialiser les agents
        this.agents.forEach(agent => agent.reset());
    }
}
