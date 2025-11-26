/**
 * Point d'entrée principal de l'application
 * Configure l'interface utilisateur et gère la boucle de simulation
 */

import { Simulator } from './simulator.js';
import { Visualizer } from './visualization.js';
import { RadarChart } from './radarchart.js';

// État global de l'application
let simulator;
let visualizer;
let radarChart;
let animationFrameId = null;

/**
 * Initialisation de l'application
 */
function init() {
    // Récupérer les éléments du DOM
    const agentCanvas = document.getElementById('agentCanvas');
    const timeSeriesCanvas = document.getElementById('timeSeriesCanvas');
    const radarCanvas = document.getElementById('radarCanvas');

    // Créer le simulateur et le visualiseur
    const numAgents = parseInt(document.getElementById('numAgents').value);
    simulator = new Simulator(numAgents);
    visualizer = new Visualizer(agentCanvas, timeSeriesCanvas);

    // Créer le radar chart avec callback pour les changements de paramètres
    radarChart = new RadarChart(radarCanvas, (paramKey, newValue) => {
        // Mettre à jour le simulateur
        simulator.setParameter(paramKey, newValue);

        // Mettre à jour l'affichage du slider correspondant
        const slider = document.getElementById(paramKey);
        const valueDisplay = document.getElementById(`${paramKey}Value`);
        if (slider) {
            slider.value = newValue;
            valueDisplay.textContent = newValue.toFixed(2);
        }

        // Redessiner le radar
        radarChart.draw(simulator.parameters);
    });

    // Configurer les contrôles
    setupControls();

    // Première visualisation
    render();
}

/**
 * Configure tous les contrôles de l'interface
 */
function setupControls() {
    // Boutons de contrôle
    document.getElementById('startBtn').addEventListener('click', startSimulation);
    document.getElementById('pauseBtn').addEventListener('click', pauseSimulation);
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);

    // Contrôles de simulation
    setupSlider('numAgents', (value) => {
        document.getElementById('numAgentsValue').textContent = value;
    });

    setupSlider('timeStep', (value) => {
        const dt = parseFloat(value);
        document.getElementById('timeStepValue').textContent = dt.toFixed(3);
        simulator.setTimeStep(dt);
    });

    // Paramètres individuels (betas)
    setupParameterSlider('beta1', 'β₁');
    setupParameterSlider('beta2', 'β₂');
    setupParameterSlider('beta3', 'β₃');
    setupParameterSlider('beta4', 'β₄');

    // Paramètres macroscopiques (mus)
    setupParameterSlider('mu1', 'μ₁');
    setupParameterSlider('mu2', 'μ₂');
    setupParameterSlider('mu3', 'μ₃');

    // Conditions initiales
    setupSlider('initQ', (value) => {
        const val = parseFloat(value);
        document.getElementById('initQValue').textContent = val.toFixed(2);
        simulator.setInitialCondition('institutionalQuality', val);
    });

    setupSlider('initGini', (value) => {
        const val = parseFloat(value);
        document.getElementById('initGiniValue').textContent = val.toFixed(2);
        simulator.setInitialCondition('gini', val);
    });

    setupSlider('externalThreat', (value) => {
        const val = parseFloat(value);
        document.getElementById('externalThreatValue').textContent = val.toFixed(2);
        simulator.setInitialCondition('externalThreat', val);
    });
}

/**
 * Configure un slider générique
 */
function setupSlider(id, callback) {
    const slider = document.getElementById(id);
    slider.addEventListener('input', (e) => {
        callback(e.target.value);
    });
}

/**
 * Configure un slider de paramètre du modèle
 */
function setupParameterSlider(param, greekLetter) {
    setupSlider(param, (value) => {
        const val = parseFloat(value);
        document.getElementById(`${param}Value`).textContent = val.toFixed(2);
        simulator.setParameter(param, val);
        // Mettre à jour le radar chart
        if (radarChart) {
            radarChart.draw(simulator.parameters);
        }
    });
}

/**
 * Démarre la simulation
 */
function startSimulation() {
    simulator.start();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    if (!animationFrameId) {
        animate();
    }
}

/**
 * Met en pause la simulation
 */
function pauseSimulation() {
    simulator.pause();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

/**
 * Réinitialise la simulation
 */
function resetSimulation() {
    // Arrêter l'animation
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Récupérer le nouveau nombre d'agents
    const numAgents = parseInt(document.getElementById('numAgents').value);

    // Réinitialiser le simulateur
    simulator.reset(numAgents);

    // Mettre à jour les conditions initiales
    const initQ = parseFloat(document.getElementById('initQ').value);
    const initGini = parseFloat(document.getElementById('initGini').value);
    const extThreat = parseFloat(document.getElementById('externalThreat').value);

    simulator.setInitialCondition('institutionalQuality', initQ);
    simulator.setInitialCondition('gini', initGini);
    simulator.setInitialCondition('externalThreat', extThreat);

    // Mettre à jour l'interface
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;

    // Rafraîchir l'affichage
    render();
}

/**
 * Boucle d'animation principale
 */
function animate() {
    if (simulator.running) {
        // Effectuer plusieurs pas de simulation par frame pour accélérer
        const stepsPerFrame = 5;
        for (let i = 0; i < stepsPerFrame; i++) {
            simulator.step();
        }

        // Mettre à jour l'affichage
        render();
    }

    animationFrameId = requestAnimationFrame(animate);
}

/**
 * Rendu de la visualisation
 */
function render() {
    // Dessiner les agents
    visualizer.drawAgents(simulator.agents);

    // Dessiner les séries temporelles
    visualizer.drawTimeSeries(simulator.society.history);

    // Dessiner le radar chart des paramètres
    radarChart.draw(simulator.parameters);

    // Mettre à jour les métriques
    const state = simulator.getState();
    visualizer.updateMetrics(state);
}

// Initialiser l'application au chargement de la page
window.addEventListener('DOMContentLoaded', init);
