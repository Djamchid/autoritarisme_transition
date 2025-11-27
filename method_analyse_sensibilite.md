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
5. **Classifier** le paramètre comme vertueux ou nocif
6. **Trouver** par recherche dichotomique les bornes correctes (voir section 1.1)

### 1.1. Classification des paramètres et recherche des bornes ⭐

**Point clé** : La définition des seuils dépend du **type** de paramètre.

#### Paramètres vertueux (↑ p → ↑ ψ)

Pour β₁ (éducation), β₃ (institutions), μ₁ (engagement) :

- **ψ(p) est croissante** : plus le paramètre augmente, plus ψ augmente
- **Zones** :
  - p < p_sortie : Zone autoritaire (ψ < 0)
  - p_sortie < p < p_entrée : Zone de transition
  - p > p_entrée : Zone démocratique (ψ > 0.3)

**Définition correcte des bornes** :
```
p_autocratique = max(p | ψ(p) ≤ 0)
  → Dernière valeur avant de sortir de l'autoritarisme

p_démocratique = min(p | ψ(p) ≥ 0.3)
  → Première valeur d'entrée en démocratie

Zone de transition = [p_autocratique, p_démocratique]
```

#### Paramètres nocifs (↑ p → ↓ ψ)

Pour β₂ (insécurité), β₄ (peur), μ₂ (capture), μ₃ (corruption) :

- **ψ(p) est décroissante** : plus le paramètre augmente, plus ψ diminue
- **Zones** :
  - p < p_sortie : Zone démocratique (ψ > 0.3)
  - p_sortie < p < p_entrée : Zone de transition
  - p > p_entrée : Zone autoritaire (ψ < 0)

**Définition correcte des bornes** :
```
p_autocratique = min(p | ψ(p) ≤ 0)
  → Première valeur d'entrée en autoritarisme

p_démocratique = max(p | ψ(p) ≥ 0.3)
  → Dernière valeur de démocratie

Zone de transition = [p_démocratique, p_autocratique]
```

**Erreur corrigée** : La version initiale cherchait simplement "une" valeur satisfaisant ψ = 0 ou ψ = 0.3, sans distinguer min/max selon le type de paramètre.

### 2. Simulation jusqu'à l'état stationnaire

**Fonction** : `simulateToSteadyState(params, tMax, dt, numAgents)`

**Paramètres** :
- `params` : Objet contenant tous les paramètres du modèle
- `tMax = 100` : Temps de simulation maximal
- `dt = 0.02` : Pas de temps (plus grand pour la rapidité)
- `numAgents = 75` : Nombre d'agents (compromis stabilité/vitesse)
- `numRealizations = 10` : Nombre de réalisations moyennées (réduit variance)

**Arrêt anticipé** :
La simulation s'arrête avant t_max si :
- Q ≤ 0.05 (effondrement institutionnel) OU
- ψ ≥ 0.95 (démocratie très stable)

Critères resserrés pour éviter arrêts prématurés et réduire variance.

**Sortie** : ψ_∞ = paramètre d'ordre à l'état final

### 3. Recherche par dichotomie avec extremum

**Fonction** : `findParameterForPsi(paramName, targetPsi, baseParams, pMin, pMax, tolerance, extremum)`

**Nouveau paramètre** : `extremum ∈ {'min', 'max'}`
- 'min' : cherche la plus petite valeur satisfaisant la condition
- 'max' : cherche la plus grande valeur satisfaisant la condition

**Algorithme amélioré** :
```
1. Évaluer ψ_∞(pMin) et ψ_∞(pMax)
2. Déterminer la monotonie : isIncreasing = (ψ_∞(pMax) > ψ_∞(pMin))
3. Si targetPsi hors de portée, retourner la borne appropriée selon extremum
4. Sinon, dichotomie adaptative :
   a. mid = (pMin + pMax) / 2
   b. Calculer ψ_∞(mid)
   c. Si |ψ_∞(mid) - targetPsi| < tolerance :
      - Mettre à jour bestCandidate selon extremum
   d. Naviguer selon monotonie :
      - Si isIncreasing et ψ_∞(mid) < targetPsi : low = mid
      - Si isIncreasing et ψ_∞(mid) > targetPsi : high = mid
      - Inverse si décroissante
   e. Itérer jusqu'à convergence
5. Retourner bestCandidate (min ou max selon extremum)
```

**Tolérance** : 0.02 (compromis vitesse/précision)

**Exemple** :
```javascript
// Pour β₁ (vertueux)
pAuto = findParameterForPsi('beta1', 0, params, 0, 2, 0.02, 'max')   // max(p | ψ ≤ 0)
pDemo = findParameterForPsi('beta1', 0.3, params, 0, 2, 0.02, 'min') // min(p | ψ ≥ 0.3)

// Pour β₂ (nocif)
pAuto = findParameterForPsi('beta2', 0, params, 0, 2, 0.02, 'min')   // min(p | ψ ≤ 0)
pDemo = findParameterForPsi('beta2', 0.3, params, 0, 2, 0.02, 'max') // max(p | ψ ≥ 0.3)
```

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
- N = 10 → variance divisée par ~3.2
- N = 20 → variance divisée par ~4.5

**Inconvénients** :
- Temps de calcul × N
- Pour 7 paramètres × 30 itérations dichotomie × 10 réalisations = 2100 simulations
- Durée estimée : 30-90 secondes (acceptable)

**Implémentation actuelle** : N = 10 réalisations, numAgents = 75

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
