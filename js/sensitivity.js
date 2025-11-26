/**
 * Module d'analyse de sensibilité paramétrique
 * Permet de calculer les seuils autocratiques et démocratiques pour chaque paramètre
 */

import { Agent } from './agent.js';
import { Society } from './society.js';
import { Parameters, computeAgentDerivatives, computeMacroDerivatives } from './equations.js';

/**
 * Simule le système jusqu'à t_max et retourne psi_infini
 * @param {Object} params - Paramètres du modèle
 * @param {number} tMax - Temps de simulation maximal
 * @param {number} dt - Pas de temps
 * @param {number} numAgents - Nombre d'agents
 * @returns {number} - Valeur de psi à t_max (psi_infini)
 */
export function simulateToSteadyState(params, tMax = 100, dt = 0.01, numAgents = 100) {
    // Créer une nouvelle simulation temporaire
    const agents = [];
    for (let i = 0; i < numAgents; i++) {
        const x = Math.random() * 0.5;  // Zone réduite de moitié
        const y = Math.random() * 0.5;
        agents.push(new Agent(i, x, y));
    }

    // Configuration du voisinage
    const neighborhoodRadius = 0.1;  // Réduit de moitié aussi
    for (let agent of agents) {
        agent.neighbors = [];
        for (let other of agents) {
            if (agent.id === other.id) continue;
            const dx = agent.x - other.x;
            const dy = agent.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < neighborhoodRadius) {
                agent.neighbors.push(other);
            }
        }
        // S'assurer qu'il y a au moins 5 voisins
        if (agent.neighbors.length === 0) {
            const k = 5;
            const sorted = agents
                .filter(a => a.id !== agent.id)
                .map(other => {
                    const dx = agent.x - other.x;
                    const dy = agent.y - other.y;
                    return { agent: other, distance: Math.sqrt(dx * dx + dy * dy) };
                })
                .sort((a, b) => a.distance - b.distance)
                .slice(0, k);
            agent.neighbors = sorted.map(item => item.agent);
        }
    }

    const society = new Society(agents);

    // Simulation jusqu'à tMax avec arrêt anticipé
    let time = 0;
    const numSteps = Math.floor(tMax / dt);

    for (let step = 0; step < numSteps; step++) {
        // Simuler les contacts interculturels
        for (let agent of agents) {
            const contactProbability = society.diversity * 0.1;
            agent.positiveContacts = 0;
            agent.negativeContacts = 0;
            if (Math.random() < contactProbability) {
                if (agent.toleranceCultural > 0) {
                    agent.positiveContacts = Math.random() * 0.5;
                } else {
                    agent.negativeContacts = Math.random() * 0.5;
                }
            }
        }

        // Calculer les dérivées
        const agentDerivatives = agents.map(agent =>
            computeAgentDerivatives(agent, society, params)
        );
        const macroDerivatives = computeMacroDerivatives(society, params);

        // Mettre à jour
        for (let i = 0; i < agents.length; i++) {
            agents[i].update(agentDerivatives[i], dt);
        }
        society.update(macroDerivatives, dt);

        time += dt;

        // Conditions d'arrêt anticipé (état stable atteint)
        const psi = society.getOrderParameter();
        if (society.institutionalQuality <= 0.2 || psi >= 0.8) {
            // État stable atteint, pas besoin de continuer
            break;
        }
    }

    // Retourner psi_infini
    return society.getOrderParameter();
}

/**
 * Trouve la valeur du paramètre pour laquelle psi_infini atteint la cible
 * Utilise une recherche par dichotomie
 * @param {string} paramName - Nom du paramètre à varier
 * @param {number} targetPsi - Valeur cible de psi_infini
 * @param {Object} baseParams - Paramètres de base
 * @param {number} pMin - Valeur minimale du paramètre
 * @param {number} pMax - Valeur maximale du paramètre
 * @param {number} tolerance - Tolérance pour la convergence
 * @returns {number} - Valeur du paramètre trouvée
 */
export function findParameterForPsi(paramName, targetPsi, baseParams, pMin, pMax, tolerance = 0.01) {
    const maxIterations = 30;
    let iteration = 0;

    // Copier les paramètres de base
    const params = Object.assign(Object.create(Object.getPrototypeOf(baseParams)), baseParams);

    // Vérifier les bornes
    params[paramName] = pMin;
    const psiMin = simulateToSteadyState(params, 100, 0.02, 50);

    params[paramName] = pMax;
    const psiMax = simulateToSteadyState(params, 100, 0.02, 50);

    // Si la cible n'est pas dans l'intervalle, retourner la borne la plus proche
    if ((targetPsi < psiMin && targetPsi < psiMax) || (targetPsi > psiMin && targetPsi > psiMax)) {
        return Math.abs(targetPsi - psiMin) < Math.abs(targetPsi - psiMax) ? pMin : pMax;
    }

    // Dichotomie
    let low = pMin;
    let high = pMax;

    while (iteration < maxIterations && (high - low) > tolerance * 0.01) {
        const mid = (low + high) / 2;
        params[paramName] = mid;
        const psiMid = simulateToSteadyState(params, 100, 0.02, 50);

        const error = psiMid - targetPsi;

        if (Math.abs(error) < tolerance) {
            return mid;
        }

        // Déterminer dans quelle moitié se trouve la solution
        params[paramName] = low;
        const psiLow = simulateToSteadyState(params, 100, 0.02, 50);

        if ((psiLow < targetPsi && psiMid > targetPsi) || (psiLow > targetPsi && psiMid < targetPsi)) {
            high = mid;
        } else {
            low = mid;
        }

        iteration++;
    }

    return (low + high) / 2;
}

/**
 * Analyse la sensibilité de tous les paramètres
 * @param {Object} baseParams - Paramètres de base
 * @param {Function} progressCallback - Callback pour rapporter la progression
 * @returns {Object} - Résultats de l'analyse {paramName: {autocratic, democratic}}
 */
export function analyzeSensitivity(baseParams, progressCallback = null) {
    const results = {};

    // Liste des paramètres à analyser avec leurs plages
    const parametersToAnalyze = [
        { key: 'beta1', min: 0, max: 2 },
        { key: 'beta2', min: 0, max: 2 },
        { key: 'beta3', min: 0, max: 2 },
        { key: 'beta4', min: 0, max: 2 },
        { key: 'mu1', min: 0, max: 1 },
        { key: 'mu2', min: 0, max: 1 },
        { key: 'mu3', min: 0, max: 1 },
    ];

    const total = parametersToAnalyze.length;

    for (let i = 0; i < parametersToAnalyze.length; i++) {
        const param = parametersToAnalyze[i];

        if (progressCallback) {
            progressCallback(param.key, i + 1, total);
        }

        // Trouver p_autocratique (psi = 0)
        const pAutocratic = findParameterForPsi(
            param.key,
            0,
            baseParams,
            param.min,
            param.max,
            0.02
        );

        // Trouver p_démocratique (psi = 0.3)
        const pDemocratic = findParameterForPsi(
            param.key,
            0.3,
            baseParams,
            param.min,
            param.max,
            0.02
        );

        results[param.key] = {
            autocratic: pAutocratic,
            democratic: pDemocratic,
            min: Math.min(pAutocratic, pDemocratic),
            max: Math.max(pAutocratic, pDemocratic)
        };
    }

    return results;
}

/**
 * Calcule un échantillon de la courbe psi(p) pour un paramètre donné
 * @param {string} paramName - Nom du paramètre
 * @param {Object} baseParams - Paramètres de base
 * @param {number} pMin - Valeur minimale
 * @param {number} pMax - Valeur maximale
 * @param {number} numPoints - Nombre de points à échantillonner
 * @returns {Array} - Tableau de {p, psi}
 */
export function samplePsiCurve(paramName, baseParams, pMin, pMax, numPoints = 10) {
    const curve = [];
    const params = Object.assign(Object.create(Object.getPrototypeOf(baseParams)), baseParams);

    for (let i = 0; i < numPoints; i++) {
        const p = pMin + (pMax - pMin) * i / (numPoints - 1);
        params[paramName] = p;
        const psi = simulateToSteadyState(params, 100, 0.02, 50);
        curve.push({ p, psi });
    }

    return curve;
}
