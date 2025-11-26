# Méthode d'analyse de sensibilité paramétrique

## Objectif

Pour chaque paramètre p_j du modèle, déterminer les valeurs critiques qui délimitent les transitions de régime politique :
- **p_autocratique** : valeur où ψ_∞ = 0 (effondrement démocratique)
- **p_démocratique** : valeur où ψ_∞ = 0.3 (démocratie stable)

La zone **[p_autocratique, p_démocratique]** représente l'intervalle de transition où le système peut basculer d'un régime à l'autre.

## Paramètres analysés

| Paramètre | Description | Plage |
|-----------|-------------|-------|
| β₁ | Effet éducation | [0, 2] |
| β₂ | Érosion par insécurité | [0, 2] |
| β₃ | Effet institutionnel | [0, 2] |
| β₄ | Effet peur | [0, 2] |
| μ₁ | Engagement démocratique | [0, 1] |
| μ₂ | Capture autoritaire | [0, 1] |
| μ₃ | Corruption par inégalités | [0, 1] |

## Méthode de calcul

### 1. Principe général

Pour chaque paramètre p_j :

1. **Figer** tous les autres paramètres à leur valeur à t₀
2. **Réinitialiser** le système avec les conditions initiales standard
3. **Varier** p_j et simuler jusqu'à t_max
4. **Calculer** ψ_∞(p_j) = ⟨α⟩(t_max) · Q(t_max)
5. **Trouver** par recherche dichotomique :
   - p_autocratique tel que ψ_∞(p_autocratique) = 0
   - p_démocratique tel que ψ_∞(p_démocratique) = 0.3

### 2. Simulation jusqu'à l'état stationnaire

**Fonction** : `simulateToSteadyState(params, tMax, dt, numAgents)`

**Paramètres** :
- `params` : Objet contenant tous les paramètres du modèle
- `tMax = 100` : Temps de simulation maximal
- `dt = 0.02` : Pas de temps (plus grand pour la rapidité)
- `numAgents = 50` : Nombre d'agents (réduit pour la rapidité)

**Arrêt anticipé** :
La simulation s'arrête avant t_max si :
- Q ≤ 0.2 (effondrement institutionnel) OU
- ψ ≥ 0.8 (démocratie très stable)

Cela accélère les calculs de ~50-70%.

**Sortie** : ψ_∞ = paramètre d'ordre à l'état final

### 3. Recherche par dichotomie

**Fonction** : `findParameterForPsi(paramName, targetPsi, baseParams, pMin, pMax, tolerance)`

**Algorithme** :
```
1. Évaluer ψ_∞(pMin) et ψ_∞(pMax)
2. Si la cible n'est pas dans [ψ_∞(pMin), ψ_∞(pMax)], retourner la borne la plus proche
3. Sinon :
   a. mid = (pMin + pMax) / 2
   b. Calculer ψ_∞(mid)
   c. Si |ψ_∞(mid) - targetPsi| < tolerance : retourner mid
   d. Sinon, déterminer le sous-intervalle contenant la cible
   e. Recommencer avec le sous-intervalle
4. Maximum 30 itérations
```

**Tolérance** : 0.02 (compromis vitesse/précision)

## Problème actuel : Variance stochastique

### Nature du problème

Les simulations sont **stochastiques** :
- Initialisation aléatoire des agents (positions, attributs)
- Contacts interculturels probabilistes
- Voisinages basés sur positions aléatoires

**Conséquence** : Deux exécutions avec les mêmes paramètres donnent des résultats différents.

### Manifestation

En réexécutant l'analyse plusieurs fois, on obtient des zones [p_autocratique, p_démocratique] différentes :

**Exemple pour β₁ (éducation)** :
```
Exécution 1 : [0.42, 0.78]
Exécution 2 : [0.51, 0.69]
Exécution 3 : [0.38, 0.82]
```

La **variance** peut être de ±20% selon les paramètres.

### Causes

1. **Nombre d'agents réduit** (50 au lieu de 100)
   - Plus sensible aux fluctuations statistiques
   - Écart-type de ⟨α⟩ ∝ 1/√N

2. **Conditions initiales aléatoires**
   - Chaque simulation part d'un état différent
   - Certaines réalisations plus favorables que d'autres

3. **Dynamique non-linéaire**
   - Petites différences initiales amplifiées
   - Bifurcations sensibles aux fluctuations

## Solutions proposées

### Solution 1 : Moyennage sur plusieurs réalisations ⭐

**Principe** : Répéter chaque simulation N fois et moyenner

```javascript
function simulateToSteadyStateStable(params, numRealizations = 10) {
    let sumPsi = 0;
    for (let i = 0; i < numRealizations; i++) {
        sumPsi += simulateToSteadyState(params);
    }
    return sumPsi / numRealizations;
}
```

**Avantages** :
- Réduit la variance : σ_moyenne = σ / √N
- N = 10 → variance divisée par ~3
- N = 20 → variance divisée par ~4.5

**Inconvénients** :
- Temps de calcul × N
- Pour 7 paramètres × 30 itérations dichotomie × 10 réalisations = 2100 simulations
- Durée estimée : 30-60 secondes (acceptable)

### Solution 2 : Seed pseudo-aléatoire fixe

**Principe** : Utiliser un générateur pseudo-aléatoire avec seed

```javascript
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}
```

**Avantages** :
- Résultats parfaitement reproductibles
- Pas de temps de calcul supplémentaire

**Inconvénients** :
- Ne réduit pas la variance, juste la fixe
- Résultats dépendent du seed choisi
- Peut masquer la variabilité réelle du système

### Solution 3 : Augmenter le nombre d'agents

**Principe** : Passer de 50 à 100+ agents

**Avantages** :
- Réduit les fluctuations statistiques
- Moyennes plus stables

**Inconvénients** :
- Temps de calcul × 2-4
- Peut devenir trop lent (> 2 minutes)

### Solution 4 : Conditions initiales déterministes

**Principe** : Initialiser les agents sur une grille régulière avec attributs fixés

**Avantages** :
- Supprime la variance liée aux conditions initiales
- Reproductible

**Inconvénients** :
- Perd le réalisme de l'hétérogénéité
- Biais vers des configurations particulières

## Recommandation : Solution 1 (Moyennage)

**Implémentation recommandée** :

```javascript
export function analyzeSensitivity(baseParams, progressCallback = null) {
    const NUM_REALIZATIONS = 10; // Ajustable selon le compromis vitesse/précision

    // Modifier simulateToSteadyState pour accepter un seed optionnel
    // et faire N réalisations avec seeds différents

    for (let param of parametersToAnalyze) {
        // Pour chaque recherche dichotomique, moyenner sur NUM_REALIZATIONS
        const pAutocratic = findParameterForPsiStable(
            param.key, 0, baseParams, param.min, param.max, NUM_REALIZATIONS
        );
        const pDemocratic = findParameterForPsiStable(
            param.key, 0.3, baseParams, param.min, param.max, NUM_REALIZATIONS
        );
    }
}
```

**Affichage de la variance** :

Calculer aussi l'écart-type des zones et l'afficher :
```
β₁ : [0.45 ± 0.08, 0.76 ± 0.12]
```

## Métriques de qualité

Pour évaluer la stabilité, calculer après N exécutions complètes :

1. **Coefficient de variation** : CV = σ / μ
   - CV < 0.1 : Excellente stabilité
   - CV < 0.2 : Bonne stabilité
   - CV > 0.3 : Variance excessive

2. **Largeur de l'intervalle de confiance** à 95% :
   - IC₉₅ = [μ - 1.96σ, μ + 1.96σ]

3. **Convergence** :
   - Vérifier que la moyenne se stabilise avec N

## Visualisation des résultats

Sur le radar, afficher :
- **Barre verte** : [p_autocratique_moyen, p_démocratique_moyen]
- **Zone claire** : Intervalle de confiance à 95%
- **Point rouge** : p_autocratique moyen
- **Point bleu** : p_démocratique moyen

## Prochaines étapes

1. ✅ Documenter la méthode actuelle
2. ⏳ Implémenter le moyennage sur réalisations multiples
3. ⏳ Ajouter un indicateur de progression détaillé
4. ⏳ Calculer et afficher les intervalles de confiance
5. ⏳ Permettre à l'utilisateur de choisir le nombre de réalisations
6. ⏳ Optimiser pour réduire le temps total (parallélisation ?)

## Références techniques

- **Variance des moyennes** : σ²_moyenne = σ² / N
- **Théorème central limite** : Distribution normale pour N ≥ 30
- **Dichotomie convergente** : log₂((pMax - pMin) / tolerance) itérations
