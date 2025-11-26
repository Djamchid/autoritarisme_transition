/**
 * Classe représentant un agent individuel dans la simulation
 * Chaque agent possède des variables d'état qui évoluent selon les équations différentielles
 */
export class Agent {
    /**
     * @param {number} id - Identifiant unique de l'agent
     * @param {number} x - Position x dans l'espace (pour visualisation)
     * @param {number} y - Position y dans l'espace (pour visualisation)
     */
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;

        // Variables d'état individuelles (initialisées aléatoirement dans [0, 1])
        this.wealth = Math.random();              // w_i - Richesse
        this.education = Math.random();           // e_i - Éducation
        this.security = Math.random();            // s_i - Sécurité perçue
        this.toleranceEconomic = Math.random() * 2 - 1;  // τ^w_i - Tolérance économique [-1, 1]
        this.tolerancePhysical = Math.random() * 2 - 1;  // τ^p_i - Tolérance physique [-1, 1]
        this.toleranceCultural = Math.random() * 2 - 1;  // τ^c_i - Tolérance culturelle [-1, 1]
        this.civicEnergy = Math.random();         // ε_i - Énergie civique
        this.permeability = Math.random();        // π_i - Perméabilité
        this.democraticAdherence = Math.random() * 2 - 1; // α_i - Adhésion démocratique [-1, 1]

        // Contacts interculturels (pour l'équation de tolérance)
        this.positiveContacts = 0;  // C_i^+
        this.negativeContacts = 0;  // C_i^-

        // Voisinage social (liste d'agents)
        this.neighbors = [];
    }

    /**
     * Calcule la moyenne d'une propriété sur le voisinage de l'agent
     * @param {string} property - Nom de la propriété à moyenner
     * @returns {number} - Moyenne de la propriété sur le voisinage
     */
    getNeighborhoodAverage(property) {
        if (this.neighbors.length === 0) return this[property];

        const sum = this.neighbors.reduce((acc, neighbor) => {
            return acc + neighbor[property];
        }, 0);

        return sum / this.neighbors.length;
    }

    /**
     * Clamp une valeur dans un intervalle donné
     * @param {number} value - Valeur à borner
     * @param {number} min - Borne inférieure
     * @param {number} max - Borne supérieure
     * @returns {number} - Valeur bornée
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Met à jour les variables de l'agent selon les dérivées calculées
     * @param {Object} derivatives - Objet contenant les dérivées de toutes les variables
     * @param {number} dt - Pas de temps
     */
    update(derivatives, dt) {
        // Mise à jour par intégration d'Euler
        this.democraticAdherence += derivatives.dAlpha * dt;
        this.toleranceCultural += derivatives.dTauC * dt;
        this.security += derivatives.dSecurity * dt;
        this.permeability += derivatives.dPermeability * dt;
        this.civicEnergy += derivatives.dCivicEnergy * dt;

        // Bornage des valeurs dans leurs domaines respectifs
        this.democraticAdherence = this.clamp(this.democraticAdherence, -1, 1);
        this.toleranceCultural = this.clamp(this.toleranceCultural, -1, 1);
        this.toleranceEconomic = this.clamp(this.toleranceEconomic, -1, 1);
        this.tolerancePhysical = this.clamp(this.tolerancePhysical, -1, 1);
        this.security = this.clamp(this.security, 0, 1);
        this.permeability = this.clamp(this.permeability, 0, 1);
        this.civicEnergy = this.clamp(this.civicEnergy, 0, 1);
        this.wealth = Math.max(0, this.wealth);
    }

    /**
     * Réinitialise l'agent avec des valeurs aléatoires
     */
    reset() {
        this.wealth = Math.random();
        this.education = Math.random();
        this.security = Math.random();
        this.toleranceEconomic = Math.random() * 2 - 1;
        this.tolerancePhysical = Math.random() * 2 - 1;
        this.toleranceCultural = Math.random() * 2 - 1;
        this.civicEnergy = Math.random();
        this.permeability = Math.random();
        this.democraticAdherence = Math.random() * 2 - 1;
        this.positiveContacts = 0;
        this.negativeContacts = 0;
    }
}
