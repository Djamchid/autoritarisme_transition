/**
 * Module d'analyse de sensibilité paramétrique
 * Permet de calculer les seuils autocratiques et démocratiques pour chaque paramètre
 */

import { Agent } from './agent.js';
import { Society } from './society.js';
import { Parameters, computeAgentDerivatives, computeMacroDerivatives } from './equations.js';

/**
 * Simule le système jusqu'à t_max et retourne psi_infini
 * Version stable avec moyennage sur plusieurs réalisations
 * @param {Object} params - Paramètres du modèle
 * @param {number} tMax - Temps de simulation maximal
 * @param {number} dt - Pas de temps
 * @param {number} numAgents - Nombre d'agents
 * @param {number} numRealizations - Nombre de réalisations pour moyenner
 * @returns {number} - Valeur moyenne de psi à t_max (psi_infini)
 */
export function simulateToSteadyState(params, tMax = 100, dt = 0.01, numAgents = 100, numRealizations = 10) {
    const psiValues = [];

    // Moyenner sur plusieurs réalisations pour réduire la variance
    for (let realization = 0; realization < numRealizations; realization++) {
        const psi = singleRealization(params, tMax, dt, numAgents);
        psiValues.push(psi);
    }

    const avgPsi = psiValues.reduce((sum, val) => sum + val, 0) / numRealizations;
    const variance = psiValues.reduce((sum, val) => sum + Math.pow(val - avgPsi, 2), 0) / numRealizations;
    const stdDev = Math.sqrt(variance);

    // Log détaillé si variance élevée
    if (stdDev > 0.05) {
        console.log(`⚠️ Variance élevée (σ=${stdDev.toFixed(3)}) - Moyenne: ${avgPsi.toFixed(3)} | Réalisations: [${psiValues.map(v => v.toFixed(3)).join(', ')}]`);
    }

    return avgPsi;
}

/**
 * Une seule réalisation de la simulation
 * @private
 */
function singleRealization(params, tMax, dt, numAgents) {
    // Créer une nouvelle simulation temporaire
    const agents = [];
    for (let i = 0; i < numAgents; i++) {
        const x = Math.random();
        const y = Math.random();
        agents.push(new Agent(i, x, y));
    }

    // Configuration du voisinage
    const neighborhoodRadius = 0.2;
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
        if (society.institutionalQuality <= 0.05 || psi >= 0.95) {
            // État stable atteint, pas besoin de continuer
            break;
        }
    }

    // Retourner psi_infini
    return society.getOrderParameter();
}

/**
 * Trouve la valeur du paramètre pour laquelle psi_infini atteint la cible
 * Utilise une recherche par dichotomie adaptée selon l'extremum recherché
 * @param {string} paramName - Nom du paramètre à varier
 * @param {number} targetPsi - Valeur cible de psi_infini
 * @param {Object} baseParams - Paramètres de base
 * @param {number} pMin - Valeur minimale du paramètre
 * @param {number} pMax - Valeur maximale du paramètre
 * @param {number} tolerance - Tolérance pour la convergence
 * @param {string} extremum - 'min' ou 'max' - type de borne recherchée
 * @returns {number} - Valeur du paramètre trouvée
 */
export function findParameterForPsi(paramName, targetPsi, baseParams, pMin, pMax, tolerance = 0.01, extremum = 'min') {
    const maxIterations = 30;
    let iteration = 0;

    // Copier les paramètres de base
    const params = Object.assign(Object.create(Object.getPrototypeOf(baseParams)), baseParams);

    // Évaluer aux bornes
    params[paramName] = pMin;
    const psiMin = simulateToSteadyState(params, 100, 0.02, 75);

    params[paramName] = pMax;
    const psiMax = simulateToSteadyState(params, 100, 0.02, 75);

    // Déterminer si ψ(p) est croissante ou décroissante
    const isIncreasing = psiMax > psiMin;

    console.log(`🔍 ${paramName} → ψ=${targetPsi} (${extremum}): ψ(${pMin})=${psiMin.toFixed(3)}, ψ(${pMax})=${psiMax.toFixed(3)}, ${isIncreasing ? '↑ croissant' : '↓ décroissant'}`);

    // Vérifier si targetPsi est atteignable
    const minPsiValue = Math.min(psiMin, psiMax);
    const maxPsiValue = Math.max(psiMin, psiMax);

    if (targetPsi < minPsiValue || targetPsi > maxPsiValue) {
        // Target hors de portée, retourner la borne appropriée
        const result = extremum === 'min' ? (isIncreasing ? pMin : pMax) : (isIncreasing ? pMax : pMin);
        console.log(`  ⚠️ Cible ${targetPsi} hors de portée [${minPsiValue.toFixed(3)}, ${maxPsiValue.toFixed(3)}] → retour borne ${result.toFixed(2)}`);
        return result;
    }

    // Dichotomie avec distinction min/max
    let low = pMin;
    let high = pMax;
    let bestCandidate = extremum === 'min' ? high : low;

    while (iteration < maxIterations && (high - low) > tolerance * 0.01) {
        const mid = (low + high) / 2;
        params[paramName] = mid;
        const psiMid = simulateToSteadyState(params, 100, 0.02, 75);

        // Vérifier si on satisfait la condition
        const satisfiesCondition = (targetPsi === 0)
            ? (psiMid <= 0 + tolerance)
            : (psiMid >= targetPsi - tolerance && psiMid <= targetPsi + tolerance);

        if (satisfiesCondition) {
            // Mettre à jour le meilleur candidat selon l'extremum recherché
            if (extremum === 'min' && mid < bestCandidate) {
                bestCandidate = mid;
            } else if (extremum === 'max' && mid > bestCandidate) {
                bestCandidate = mid;
            }
        }

        // Naviguer selon monotonie et cible
        if (isIncreasing) {
            if (psiMid < targetPsi) {
                low = mid;
            } else {
                high = mid;
            }
        } else {
            if (psiMid < targetPsi) {
                high = mid;
            } else {
                low = mid;
            }
        }

        iteration++;
    }

    // Affiner le résultat final
    const finalMid = (low + high) / 2;
    params[paramName] = finalMid;
    const psiFinal = simulateToSteadyState(params, 100, 0.02, 75);

    // Retourner le meilleur candidat ou le résultat de la dichotomie
    let result;
    if (Math.abs(psiFinal - targetPsi) < tolerance) {
        if (extremum === 'min') {
            result = Math.min(bestCandidate, finalMid);
        } else {
            result = Math.max(bestCandidate, finalMid);
        }
    } else {
        result = bestCandidate !== (extremum === 'min' ? high : low) ? bestCandidate : finalMid;
    }

    console.log(`  ✓ Trouvé: ${paramName}=${result.toFixed(3)} → ψ=${psiFinal.toFixed(3)} (après ${iteration} itérations)`);
    return result;
}

/**
 * Analyse la sensibilité de tous les paramètres
 * @param {Object} baseParams - Paramètres de base
 * @param {Function} progressCallback - Callback pour rapporter la progression
 * @returns {Object} - Résultats de l'analyse {paramName: {autocratic, democratic}}
 */
export function analyzeSensitivity(baseParams, progressCallback = null) {
    const results = {};

    // Liste des paramètres à analyser avec leurs plages et classification
    // virtuous: true si ↑ paramètre → ↑ ψ, false si ↑ paramètre → ↓ ψ
    const parametersToAnalyze = [
        { key: 'beta1', min: 0, max: 2, virtuous: true },   // Éducation (vertueux)
        { key: 'beta2', min: 0, max: 2, virtuous: false },  // Insécurité (nocif)
        { key: 'beta3', min: 0, max: 2, virtuous: true },   // Institutions (vertueux)
        { key: 'beta4', min: 0, max: 2, virtuous: false },  // Peur (nocif)
        { key: 'mu1', min: 0, max: 1, virtuous: true },     // Engagement (vertueux)
        { key: 'mu2', min: 0, max: 1, virtuous: false },    // Capture (nocif)
        { key: 'mu3', min: 0, max: 1, virtuous: false },    // Corruption (nocif)
    ];

    const total = parametersToAnalyze.length;

    console.log('\n📊 DÉBUT ANALYSE DE SENSIBILITÉ\n');

    for (let i = 0; i < parametersToAnalyze.length; i++) {
        const param = parametersToAnalyze[i];

        console.log(`\n━━━ ${param.key} (${param.virtuous ? 'vertueux' : 'nocif'}) [${param.min}, ${param.max}] ━━━`);

        if (progressCallback) {
            progressCallback(param.key, i + 1, total);
        }

        let pAutocratic, pDemocratic;

        if (param.virtuous) {
            // Paramètre vertueux : ψ croît avec p
            // p_autocratique = max(p | ψ ≤ 0) → dernière valeur avant de sortir de l'autoritarisme
            // p_démocratique = min(p | ψ ≥ 0.3) → première valeur d'entrée en démocratie
            pAutocratic = findParameterForPsi(param.key, 0, baseParams, param.min, param.max, 0.02, 'max');
            pDemocratic = findParameterForPsi(param.key, 0.3, baseParams, param.min, param.max, 0.02, 'min');
        } else {
            // Paramètre nocif : ψ décroît avec p
            // p_autocratique = min(p | ψ ≤ 0) → première valeur d'entrée en autoritarisme
            // p_démocratique = max(p | ψ ≥ 0.3) → dernière valeur de démocratie
            pAutocratic = findParameterForPsi(param.key, 0, baseParams, param.min, param.max, 0.02, 'min');
            pDemocratic = findParameterForPsi(param.key, 0.3, baseParams, param.min, param.max, 0.02, 'max');
        }

        const zoneWidth = Math.abs(pDemocratic - pAutocratic);
        console.log(`📍 RÉSULTAT ${param.key}: Zone [${pAutocratic.toFixed(3)}, ${pDemocratic.toFixed(3)}] largeur=${zoneWidth.toFixed(3)}`);

        results[param.key] = {
            autocratic: pAutocratic,
            democratic: pDemocratic,
            min: Math.min(pAutocratic, pDemocratic),
            max: Math.max(pAutocratic, pDemocratic),
            virtuous: param.virtuous
        };
    }

    console.log('\n✅ ANALYSE TERMINÉE\n');
    console.table(Object.entries(results).map(([key, val]) => ({
        Paramètre: key,
        Type: val.virtuous ? 'vertueux' : 'nocif',
        'p_auto': val.autocratic.toFixed(3),
        'p_demo': val.democratic.toFixed(3),
        'Largeur zone': (Math.abs(val.democratic - val.autocratic)).toFixed(3)
    })));

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
