/**
 * Moteur de simulation principal
 * Gère l'évolution temporelle du système et l'intégration numérique
 */

import { Agent } from './agent.js';
import { Society } from './society.js';
import { Parameters, computeAgentDerivatives, computeMacroDerivatives } from './equations.js';

export class Simulator {
    /**
     * @param {number} numAgents - Nombre d'agents dans la simulation
     */
    constructor(numAgents = 100) {
        this.numAgents = numAgents;
        this.agents = [];
        this.society = null;
        this.parameters = new Parameters();

        this.time = 0;
        this.dt = 0.01;  // Pas de temps
        this.running = false;

        this.initializeAgents();
        this.setupNeighborhoods();
        this.society = new Society(this.agents);
    }

    /**
     * Initialise les agents avec des positions aléatoires
     * Les positions sont dans [0, 0.5] x [0, 0.5] (zone divisée par 2)
     */
    initializeAgents() {
        this.agents = [];
        for (let i = 0; i < this.numAgents; i++) {
            const x = Math.random() * 0.5;  // Zone réduite de moitié
            const y = Math.random() * 0.5;
            this.agents.push(new Agent(i, x, y));
        }
    }

    /**
     * Configure le voisinage social de chaque agent
     * Utilise une approche basée sur la distance spatiale
     * Le rayon est adapté à la zone réduite (0.1 au lieu de 0.2)
     */
    setupNeighborhoods() {
        const neighborhoodRadius = 0.1;  // Rayon de voisinage réduit de moitié

        for (let agent of this.agents) {
            agent.neighbors = [];

            for (let other of this.agents) {
                if (agent.id === other.id) continue;

                const dx = agent.x - other.x;
                const dy = agent.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < neighborhoodRadius) {
                    agent.neighbors.push(other);
                }
            }

            // S'assurer que chaque agent a au moins quelques voisins
            if (agent.neighbors.length === 0) {
                // Trouver les k plus proches voisins
                const k = 5;
                const sorted = this.agents
                    .filter(a => a.id !== agent.id)
                    .map(other => {
                        const dx = agent.x - other.x;
                        const dy = agent.y - other.y;
                        return {
                            agent: other,
                            distance: Math.sqrt(dx * dx + dy * dy)
                        };
                    })
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, k);

                agent.neighbors = sorted.map(item => item.agent);
            }
        }
    }

    /**
     * Simule les contacts interculturels pour chaque agent
     * Pour simplification, on utilise une approche probabiliste
     */
    simulateInterculturalContacts() {
        for (let agent of this.agents) {
            // Contacts positifs/négatifs basés sur la diversité et la tolérance
            const contactProbability = this.society.diversity * 0.1;

            agent.positiveContacts = 0;
            agent.negativeContacts = 0;

            if (Math.random() < contactProbability) {
                // La qualité du contact dépend de la tolérance de l'agent
                if (agent.toleranceCultural > 0) {
                    agent.positiveContacts = Math.random() * 0.5;
                } else {
                    agent.negativeContacts = Math.random() * 0.5;
                }
            }
        }
    }

    /**
     * Effectue un pas de simulation (intégration d'Euler)
     */
    step() {
        // 1. Simuler les contacts interculturels
        this.simulateInterculturalContacts();

        // 2. Calculer toutes les dérivées pour chaque agent
        const agentDerivatives = this.agents.map(agent => {
            return computeAgentDerivatives(agent, this.society, this.parameters);
        });

        // 3. Calculer les dérivées macroscopiques
        const macroDerivatives = computeMacroDerivatives(this.society, this.parameters);

        // 4. Mettre à jour tous les agents
        for (let i = 0; i < this.agents.length; i++) {
            this.agents[i].update(agentDerivatives[i], this.dt);
        }

        // 5. Mettre à jour les variables macroscopiques
        this.society.update(macroDerivatives, this.dt);

        // 6. Incrémenter le temps
        this.time += this.dt;

        // 7. Ajouter à l'historique (tous les 10 pas pour économiser la mémoire)
        if (Math.floor(this.time / this.dt) % 10 === 0) {
            this.society.addToHistory(this.time);
        }
    }

    /**
     * Démarre la simulation
     */
    start() {
        this.running = true;
    }

    /**
     * Met en pause la simulation
     */
    pause() {
        this.running = false;
    }

    /**
     * Réinitialise la simulation
     * @param {number} numAgents - Nouveau nombre d'agents (optionnel)
     */
    reset(numAgents = null) {
        this.running = false;
        this.time = 0;

        if (numAgents !== null && numAgents !== this.numAgents) {
            this.numAgents = numAgents;
            this.initializeAgents();
            this.setupNeighborhoods();
            this.society = new Society(this.agents);
        } else {
            this.society.reset(
                this.society.institutionalQuality,
                this.society.gini,
                this.society.externalThreat
            );
        }
    }

    /**
     * Définit le pas de temps
     * @param {number} dt - Nouveau pas de temps
     */
    setTimeStep(dt) {
        this.dt = dt;
    }

    /**
     * Met à jour un paramètre du modèle
     * @param {string} param - Nom du paramètre
     * @param {number} value - Nouvelle valeur
     */
    setParameter(param, value) {
        if (param in this.parameters) {
            this.parameters[param] = value;
        }
    }

    /**
     * Met à jour une condition initiale de la société
     * @param {string} variable - Nom de la variable
     * @param {number} value - Nouvelle valeur
     */
    setInitialCondition(variable, value) {
        if (variable === 'institutionalQuality') {
            this.society.institutionalQuality = value;
        } else if (variable === 'gini') {
            this.society.gini = value;
        } else if (variable === 'externalThreat') {
            this.society.externalThreat = value;
        }
    }

    /**
     * Récupère l'état actuel du système
     * @returns {Object} - État du système
     */
    getState() {
        return {
            time: this.time,
            orderParameter: this.society.getOrderParameter(),
            avgAlpha: this.society.getAverage('democraticAdherence'),
            institutionalQuality: this.society.institutionalQuality,
            polarization: this.society.polarization,
            perceivedThreat: this.society.perceivedThreat,
            gini: this.society.gini,
            running: this.running
        };
    }
}
