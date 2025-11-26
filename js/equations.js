/**
 * Module contenant toutes les équations différentielles du système
 * Implémentation des équations définies dans la spécification
 */

/**
 * Classe contenant les paramètres du modèle
 */
export class Parameters {
    constructor() {
        // Paramètres pour l'adhésion démocratique (équation 3.1)
        this.beta1 = 0.5;  // Effet éducation
        this.beta2 = 0.3;  // Érosion par insécurité
        this.beta3 = 0.4;  // Effet institutionnel
        this.beta4 = 0.6;  // Effet peur

        // Paramètres pour la tolérance culturelle (équation 3.2)
        this.gamma1 = 0.3;  // Ouverture par éducation
        this.gamma2 = 0.4;  // Contact positif
        this.gamma3 = 0.5;  // Contact négatif
        this.gamma4 = 0.3;  // Repli identitaire

        // Paramètres pour la sécurité perçue (équation 3.3)
        this.delta1 = 0.4;  // Richesse relative
        this.delta2 = 0.3;  // Filet institutionnel
        this.delta3 = 0.2;  // Précarité ambiante
        this.delta4 = 0.3;  // Climat anxiogène
        this.delta5 = 0.2;  // Contagion médiatique

        // Paramètres pour la perméabilité (équation 3.4)
        this.eta1 = 0.3;  // Esprit critique
        this.eta2 = 0.4;  // Vulnérabilité
        this.eta3 = 0.3;  // Pression médiatique

        // Paramètres pour l'énergie civique (équation 3.5)
        this.lambda1 = 0.4;  // Disponibilité
        this.lambda2 = 0.3;  // Épuisement survie
        this.lambda3 = 0.3;  // Entraînement social
        this.lambda4 = 0.2;  // Découragement institutionnel

        // Paramètres macroscopiques pour qualité institutionnelle (équation 4.1)
        this.mu1 = 0.3;  // Engagement démocratique
        this.mu2 = 0.4;  // Capture autoritaire
        this.mu3 = 0.2;  // Corruption par inégalités

        // Paramètres pour polarisation (équation 4.2)
        this.nu1 = 0.5;  // Variance des opinions
        this.nu2 = 0.3;  // Fracture économique
        this.nu3 = 0.4;  // Médiation institutionnelle

        // Paramètres pour menace perçue (équation 4.3)
        this.rho1 = 0.5;  // Menaces réelles
        this.rho2 = 0.4;  // Amplification
        this.rho3 = 0.3;  // Xénophobie
        this.rho4 = 0.2;  // Résilience collective
    }
}

/**
 * Calcule la dérivée de l'adhésion démocratique (équation 3.1)
 * dα_i/dt = π_i·⟨α⟩ + β₁·e_i·(1-α_i) - β₂·(1-s_i)·α_i + β₃·Q - β₄·M·π_i
 */
export function computeDemocraticAdherence(agent, society, params) {
    const avgAlpha = agent.getNeighborhoodAverage('democraticAdherence');

    const socialInfluence = agent.permeability * avgAlpha;
    const educationEffect = params.beta1 * agent.education * (1 - agent.democraticAdherence);
    const insecurityErosion = -params.beta2 * (1 - agent.security) * agent.democraticAdherence;
    const institutionalEffect = params.beta3 * society.institutionalQuality;
    const fearEffect = -params.beta4 * society.perceivedThreat * agent.permeability;

    return socialInfluence + educationEffect + insecurityErosion + institutionalEffect + fearEffect;
}

/**
 * Calcule la dérivée de la tolérance culturelle (équation 3.2)
 * dτ^c_i/dt = γ₁·e_i·(1-τ^c_i) + γ₂·C_i^+·(1-τ^c_i) - γ₃·C_i^-·(1+τ^c_i) - γ₄·(1-s_i)·Φ·τ^c_i
 */
export function computeCulturalTolerance(agent, society, params) {
    const educationOpenness = params.gamma1 * agent.education * (1 - agent.toleranceCultural);
    const positiveContact = params.gamma2 * agent.positiveContacts * (1 - agent.toleranceCultural);
    const negativeContact = -params.gamma3 * agent.negativeContacts * (1 + agent.toleranceCultural);
    const identityRetreat = -params.gamma4 * (1 - agent.security) * society.polarization * agent.toleranceCultural;

    return educationOpenness + positiveContact + negativeContact + identityRetreat;
}

/**
 * Calcule la dérivée de la sécurité perçue (équation 3.3)
 * ds_i/dt = δ₁·(w_i/⟨w⟩) + δ₂·Q - δ₃·P - δ₄·M - δ₅·π_i·Φ
 */
export function computeSecurity(agent, society, params) {
    const avgWealth = society.getAverage('wealth');
    const relativeWealth = avgWealth > 0 ? agent.wealth / avgWealth : 1;

    const wealthEffect = params.delta1 * relativeWealth;
    const institutionalSafety = params.delta2 * society.institutionalQuality;
    const precarityEffect = -params.delta3 * society.precarity;
    const anxiousClimate = -params.delta4 * society.perceivedThreat;
    const mediaContagion = -params.delta5 * agent.permeability * society.polarization;

    return wealthEffect + institutionalSafety + precarityEffect + anxiousClimate + mediaContagion;
}

/**
 * Calcule la dérivée de la perméabilité (équation 3.4)
 * dπ_i/dt = -η₁·e_i·π_i + η₂·(1-s_i)·(1-π_i) + η₃·Φ·(1-π_i)
 */
export function computePermeability(agent, society, params) {
    const criticalThinking = -params.eta1 * agent.education * agent.permeability;
    const vulnerability = params.eta2 * (1 - agent.security) * (1 - agent.permeability);
    const mediaPressure = params.eta3 * society.polarization * (1 - agent.permeability);

    return criticalThinking + vulnerability + mediaPressure;
}

/**
 * Calcule la dérivée de l'énergie civique (équation 3.5)
 * dε_i/dt = λ₁·s_i·(1-ε_i) - λ₂·(1-s_i) + λ₃·⟨ε⟩ - λ₄·(1-Q)
 */
export function computeCivicEnergy(agent, society, params) {
    const avgEnergy = agent.getNeighborhoodAverage('civicEnergy');

    const availability = params.lambda1 * agent.security * (1 - agent.civicEnergy);
    const survivalExhaustion = -params.lambda2 * (1 - agent.security);
    const socialDrive = params.lambda3 * avgEnergy;
    const institutionalDiscouragement = -params.lambda4 * (1 - society.institutionalQuality);

    return availability + survivalExhaustion + socialDrive + institutionalDiscouragement;
}

/**
 * Calcule la dérivée de la qualité institutionnelle (équation 4.1)
 * dQ/dt = μ₁·⟨α⟩·⟨ε⟩ - μ₂·(1-⟨α⟩)·Φ - μ₃·G
 */
export function computeInstitutionalQuality(society, params) {
    const avgAlpha = society.getAverage('democraticAdherence');
    const avgEnergy = society.getAverage('civicEnergy');

    const democraticEngagement = params.mu1 * avgAlpha * avgEnergy;
    const authoritarianCapture = -params.mu2 * (1 - avgAlpha) * society.polarization;
    const corruptionByInequality = -params.mu3 * society.gini;

    return democraticEngagement + authoritarianCapture + corruptionByInequality;
}

/**
 * Calcule la dérivée de la polarisation (équation 4.2)
 * dΦ/dt = ν₁·σ(α) + ν₂·G - ν₃·⟨e⟩·Q
 */
export function computePolarization(society, params) {
    const opinionVariance = society.getStdDev('democraticAdherence');
    const avgEducation = society.getAverage('education');

    const opinionDivergence = params.nu1 * opinionVariance;
    const economicFracture = params.nu2 * society.gini;
    const institutionalMediation = -params.nu3 * avgEducation * society.institutionalQuality;

    return opinionDivergence + economicFracture + institutionalMediation;
}

/**
 * Calcule la dérivée de la menace perçue (équation 4.3)
 * dM/dt = ρ₁·M_ext + ρ₂·Φ·(1-Q) + ρ₃·D·(1-⟨τ^c⟩) - ρ₄·⟨s⟩
 */
export function computePerceivedThreat(society, params) {
    const avgTolerance = society.getAverage('toleranceCultural');
    const avgSecurity = society.getAverage('security');

    const realThreats = params.rho1 * society.externalThreat;
    const amplification = params.rho2 * society.polarization * (1 - society.institutionalQuality);
    const xenophobia = params.rho3 * society.diversity * (1 - avgTolerance);
    const collectiveResilience = -params.rho4 * avgSecurity;

    return realThreats + amplification + xenophobia + collectiveResilience;
}

/**
 * Calcule toutes les dérivées pour un agent donné
 */
export function computeAgentDerivatives(agent, society, params) {
    return {
        dAlpha: computeDemocraticAdherence(agent, society, params),
        dTauC: computeCulturalTolerance(agent, society, params),
        dSecurity: computeSecurity(agent, society, params),
        dPermeability: computePermeability(agent, society, params),
        dCivicEnergy: computeCivicEnergy(agent, society, params)
    };
}

/**
 * Calcule toutes les dérivées macroscopiques
 */
export function computeMacroDerivatives(society, params) {
    return {
        dQ: computeInstitutionalQuality(society, params),
        dPhi: computePolarization(society, params),
        dM: computePerceivedThreat(society, params)
    };
}
