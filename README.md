# Simulation: Transition Démocratique vers l'Autoritarisme

Simulation interactive basée sur des équations différentielles modélisant l'évolution d'une société vers l'autoritarisme.

## Description

Ce projet implémente un système multi-agents où chaque agent possède des caractéristiques individuelles (richesse, éducation, adhésion démocratique, etc.) qui évoluent selon des équations différentielles couplées. Le système permet d'étudier les transitions de phase entre démocratie et autoritarisme.

## Interface et contrôles

### Barre de contrôle fixe
Une barre de contrôle en haut de l'écran reste visible lors du défilement et contient:
- **Boutons de simulation** : Démarrer, Pause, Réinitialiser
- **Nombre d'agents** : 50-500 (défaut: 100)
- **Pas de temps (dt)** : 0.001-0.1 (défaut: 0.01)

### Graphique radar interactif
Un graphique en araignée permet de **visualiser ET d'ajuster** les 7 paramètres principaux en temps réel:
- Cliquez et glissez sur le radar pour modifier un paramètre
- Les sliders en dessous se synchronisent automatiquement
- Feedback visuel pendant l'interaction (points agrandis, couleurs intensifiées)

### Zone de contrôle
Les contrôles détaillés restent fixes lors du défilement de la page principale, permettant un accès permanent aux paramètres.

## Variables du modèle

### Variables individuelles (par agent)

Chaque agent `i` possède 9 variables d'état:

| Variable | Symbole | Domaine | Description |
|----------|---------|---------|-------------|
| Richesse | w_i | [0, +∞) | Richesse économique relative |
| Éducation | e_i | [0, 1] | Niveau d'éducation |
| Sécurité perçue | s_i | [0, 1] | Sentiment de sécurité |
| Tolérance économique | τ^w_i | [-1, 1] | Tolérance aux inégalités |
| Tolérance physique | τ^p_i | [-1, 1] | Tolérance à la diversité |
| Tolérance culturelle | τ^c_i | [-1, 1] | Ouverture culturelle |
| Énergie civique | ε_i | [0, 1] | Capacité d'engagement civique |
| Perméabilité | π_i | [0, 1] | Sensibilité aux influences |
| **Adhésion démocratique** | **α_i** | **[-1, 1]** | **Variable centrale du modèle** |

### Variables macroscopiques (société)

| Variable | Symbole | Description | Calcul |
|----------|---------|-------------|--------|
| Inégalité | G | Coefficient de Gini | Calculé depuis les richesses |
| Précarité | P | Taux d'insécurité | P = 1 - ⟨s⟩ |
| Diversité | D | Hétérogénéité culturelle | Constante (0.5) |
| **Qualité institutionnelle** | **Q** | **Solidité démocratique** | **Équation différentielle** |
| **Polarisation** | **Φ** | **Fragmentation sociale** | **Équation différentielle** |
| **Menace perçue** | **M** | **Niveau de peur collective** | **Équation différentielle** |
| Menace externe | M_ext | Menaces objectives | Paramètre externe |

### Paramètre d'ordre

Le système possède un **paramètre d'ordre** qui caractérise l'état du régime:

**Ψ = ⟨α⟩ · Q**

Où:
- ⟨α⟩ est l'adhésion démocratique moyenne
- Q est la qualité institutionnelle

**Interprétation:**
- **Ψ > 0.3** : Régime démocratique stable
- **Ψ ∈ [0, 0.3]** : Régime fragile, risque de transition
- **Ψ < 0** : Régime autoritaire établi

## Conditions initiales

### Conditions initiales individuelles

Chaque agent est initialisé avec des valeurs **tirées aléatoirement** selon les distributions suivantes:

| Variable | Symbole | Distribution initiale | Implémentation |
|----------|---------|----------------------|----------------|
| Richesse | w_i_0 | U(0, 1) | `Math.random()` |
| Éducation | e_i_0 | U(0, 1) | `Math.random()` |
| Sécurité perçue | s_i_0 | U(0, 1) | `Math.random()` |
| Tolérance économique | τ^w_i_0 | U(-1, 1) | `Math.random() * 2 - 1` |
| Tolérance physique | τ^p_i_0 | U(-1, 1) | `Math.random() * 2 - 1` |
| Tolérance culturelle | τ^c_i_0 | U(-1, 1) | `Math.random() * 2 - 1` |
| Énergie civique | ε_i_0 | U(0, 1) | `Math.random()` |
| Perméabilité | π_i_0 | U(0, 1) | `Math.random()` |
| Adhésion démocratique | α_i_0 | U(-1, 1) | `Math.random() * 2 - 1` |

**Note:** U(a, b) désigne une distribution uniforme sur l'intervalle [a, b].

### Conditions initiales macroscopiques

Les variables macroscopiques sont initialisées avec des valeurs fixes représentant un **régime démocratique relativement stable**:

| Variable | Symbole | Valeur initiale | Justification |
|----------|---------|----------------|---------------|
| **Qualité institutionnelle** | **Q_0** | **0.7** | Institutions démocratiques solides |
| Inégalité (Gini) | G_0 | 0.3 | Inégalités modérées |
| Polarisation | Φ_0 | 0.2 | Société relativement cohésive |
| Menace perçue | M_0 | 0.2 | Climat de faible anxiété |
| Diversité culturelle | D | 0.5 | Constante (hétérogénéité moyenne) |
| Menace externe | M_ext | 0.2 | Contexte géopolitique stable |
| Précarité | P_0 | 0.2 | Calculée depuis ⟨s⟩ |

**Paramètre d'ordre initial:**
```
Ψ_0 = ⟨α_0⟩ · Q_0 ≈ 0 · 0.7 = 0
```

Les agents étant tirés uniformément dans [-1, 1], l'adhésion moyenne initiale ⟨α_0⟩ ≈ 0, plaçant le système dans une **zone de transition fragile**.

### Personnalisation des conditions initiales

Le code permet de modifier les conditions initiales macroscopiques via `society.reset()`:

```javascript
society.reset(
    initQ = 0.7,      // Qualité institutionnelle
    initGini = 0.3,   // Inégalité
    extThreat = 0.2   // Menace externe
);
```

## Équations du modèle

### Équations individuelles

#### 1. Adhésion démocratique (variable centrale)

```
dα_i/dt = π_i·⟨α⟩_N + β₁·e_i·(1-α_i) - β₂·(1-s_i)·α_i + β₃·Q - β₄·M·π_i
```

**Composantes:**
- **Influence sociale** `π_i·⟨α⟩_N` : Contagion par le voisinage
- **Effet éducation** `β₁·e_i·(1-α_i)` : L'éducation renforce la démocratie
- **Érosion par insécurité** `-β₂·(1-s_i)·α_i` : L'insécurité érode l'adhésion
- **Effet institutionnel** `β₃·Q` : Les institutions soutiennent
- **Effet peur** `-β₄·M·π_i` : La menace pousse vers l'autoritarisme

**Paramètres ajustables:**
- β₁ = 0.5 (éducation)
- β₂ = 0.3 (insécurité)
- β₃ = 0.4 (institutions)
- β₄ = 0.6 (peur)

#### 2. Tolérance culturelle

```
dτ^c_i/dt = γ₁·e_i·(1-τ^c_i) + γ₂·C_i^+·(1-τ^c_i) - γ₃·C_i^-·(1+τ^c_i) - γ₄·(1-s_i)·Φ·τ^c_i
```

**Composantes:**
- **Ouverture par éducation** `γ₁·e_i·(1-τ^c_i)` : L'éducation ouvre l'esprit
- **Contacts positifs** `γ₂·C_i^+·(1-τ^c_i)` : Expériences interculturelles positives
- **Contacts négatifs** `-γ₃·C_i^-·(1+τ^c_i)` : Expériences négatives
- **Repli identitaire** `-γ₄·(1-s_i)·Φ·τ^c_i` : Insécurité + polarisation → fermeture

**Paramètres:**
- γ₁ = 0.3, γ₂ = 0.4, γ₃ = 0.5, γ₄ = 0.3

#### 3. Sécurité perçue

```
ds_i/dt = δ₁·(w_i/⟨w⟩) + δ₂·Q - δ₃·P - δ₄·M - δ₅·π_i·Φ
```

**Composantes:**
- **Richesse relative** `δ₁·(w_i/⟨w⟩)` : Position économique
- **Filet institutionnel** `δ₂·Q` : Protection par les institutions
- **Précarité ambiante** `-δ₃·P` : Climat d'insécurité
- **Climat anxiogène** `-δ₄·M` : Menace perçue
- **Contagion médiatique** `-δ₅·π_i·Φ` : Peur amplifiée par les médias

**Paramètres:**
- δ₁ = 0.4, δ₂ = 0.3, δ₃ = 0.2, δ₄ = 0.3, δ₅ = 0.2

#### 4. Perméabilité aux influences

```
dπ_i/dt = -η₁·e_i·π_i + η₂·(1-s_i)·(1-π_i) + η₃·Φ·(1-π_i)
```

**Composantes:**
- **Esprit critique** `-η₁·e_i·π_i` : L'éducation réduit la perméabilité
- **Vulnérabilité** `η₂·(1-s_i)·(1-π_i)` : L'insécurité rend vulnérable
- **Pression médiatique** `η₃·Φ·(1-π_i)` : La polarisation rend perméable

**Paramètres:**
- η₁ = 0.3, η₂ = 0.4, η₃ = 0.3

#### 5. Énergie civique

```
dε_i/dt = λ₁·s_i·(1-ε_i) - λ₂·(1-s_i) + λ₃·⟨ε⟩_N - λ₄·(1-Q)
```

**Composantes:**
- **Disponibilité** `λ₁·s_i·(1-ε_i)` : La sécurité libère de l'énergie
- **Épuisement survie** `-λ₂·(1-s_i)` : L'insécurité épuise
- **Entraînement social** `λ₃·⟨ε⟩_N` : Contagion de l'engagement
- **Découragement institutionnel** `-λ₄·(1-Q)` : Institutions faibles démotivent

**Paramètres:**
- λ₁ = 0.4, λ₂ = 0.3, λ₃ = 0.3, λ₄ = 0.2

### Équations macroscopiques

#### 6. Qualité institutionnelle

```
dQ/dt = μ₁·⟨α⟩·⟨ε⟩ - μ₂·(1-⟨α⟩)·Φ - μ₃·G
```

**Composantes:**
- **Engagement démocratique** `μ₁·⟨α⟩·⟨ε⟩` : Citoyens actifs renforcent
- **Capture autoritaire** `-μ₂·(1-⟨α⟩)·Φ` : Polarisation + rejet → dégradation
- **Corruption par inégalités** `-μ₃·G` : Inégalités érodent

**Paramètres ajustables (radar):**
- μ₁ = 0.3 (engagement)
- μ₂ = 0.4 (capture)
- μ₃ = 0.2 (corruption)

#### 7. Polarisation

```
dΦ/dt = ν₁·σ(α) + ν₂·G - ν₃·⟨e⟩·Q
```

**Composantes:**
- **Variance des opinions** `ν₁·σ(α)` : Divergence → polarisation
- **Fracture économique** `ν₂·G` : Inégalités → clivages
- **Médiation institutionnelle** `-ν₃·⟨e⟩·Q` : Éducation + institutions → cohésion

**Paramètres:**
- ν₁ = 0.5, ν₂ = 0.3, ν₃ = 0.4

#### 8. Menace perçue

```
dM/dt = ρ₁·M_ext + ρ₂·Φ·(1-Q) + ρ₃·D·(1-⟨τ^c⟩) - ρ₄·⟨s⟩
```

**Composantes:**
- **Menaces réelles** `ρ₁·M_ext` : Base objective
- **Amplification** `ρ₂·Φ·(1-Q)` : Polarisation + institutions faibles amplifient
- **Xénophobie** `ρ₃·D·(1-⟨τ^c⟩)` : Diversité + intolérance → peur
- **Résilience collective** `-ρ₄·⟨s⟩` : Sécurité collective apaise

**Paramètres:**
- ρ₁ = 0.5, ρ₂ = 0.4, ρ₃ = 0.3, ρ₄ = 0.2

## Intégration numérique

**Méthode d'Euler explicite:**

Pour chaque pas de temps dt:

1. Calculer toutes les dérivées individuelles (α, τ^c, s, π, ε)
2. Calculer toutes les dérivées macroscopiques (Q, Φ, M)
3. Mettre à jour: `variable(t+dt) = variable(t) + dérivée·dt`
4. Borner les valeurs dans leurs domaines respectifs

**Pas de temps par défaut:** dt = 0.01

## Réseau social

Chaque agent possède un **voisinage social** N_i défini par:
- **Distance spatiale** : rayon = 0.2
- **Minimum de voisins** : 5 (k plus proches)

Les moyennes `⟨·⟩_N` sont calculées sur ce voisinage.

## Visualisations

### 1. Distribution spatiale des agents
- Couleur = adhésion démocratique
- **Vert** : démocratique (α → +1)
- **Rouge** : autoritaire (α → -1)

### 2. Séries temporelles
Graphiques de l'évolution:
- **Bleu** : Paramètre d'ordre Ψ
- **Vert** : Qualité institutionnelle Q
- **Rouge** : Polarisation Φ
- **Orange** : Menace perçue M

### 3. Graphique radar des paramètres
Visualisation interactive des 7 paramètres principaux:
- β₁, β₂, β₃, β₄ (adhésion démocratique)
- μ₁, μ₂, μ₃ (dynamique institutionnelle)

### 4. Métriques en temps réel
- Ψ (paramètre d'ordre)
- ⟨α⟩ (adhésion moyenne)
- Q, Φ, M
- Temps de simulation

## Utilisation

### Lancement

Ouvrir `index.html` dans un navigateur moderne, ou:

```bash
python -m http.server 8000
# Puis ouvrir http://localhost:8000
```

### Scénarios d'exploration

#### Transition autoritaire
1. Augmenter β₄ (effet peur) à 1.5
2. Augmenter M_ext (menace externe) à 0.7
3. Observer la chute de Ψ

#### Résilience démocratique
1. Augmenter β₁ (éducation) à 1.5
2. Augmenter μ₁ (engagement) à 0.8
3. Maintenir Q et Ψ élevés

#### Polarisation
1. Augmenter G₀ (inégalités) à 0.6
2. Observer l'augmentation de Φ et M
3. Effondrement progressif de Q

## Architecture technique

### Structure des fichiers

```
├── index.html              # Interface principale
├── css/
│   └── styles.css         # Styles + barre fixe + radar
├── js/
│   ├── agent.js           # Classe Agent (9 variables)
│   ├── society.js         # Classe Society (6 variables macro)
│   ├── equations.js       # 8 équations + paramètres
│   ├── simulator.js       # Intégration d'Euler + réseau social
│   ├── visualization.js   # Canvas: agents + séries temporelles
│   ├── radarchart.js      # Graphique radar interactif
│   └── main.js           # Point d'entrée + synchronisation
└── README.md             # Documentation complète
```

### Modules ES6

- **Modularité** : Chaque fichier = responsabilité unique
- **Séparation** : Logique / Visualisation / UI
- **Réutilisabilité** : Classes exportables

### Synchronisation radar-sliders

```
Radar drag → callback(param, value)
  → simulator.setParameter()
  → slider.value = value
  → radar.draw()

Slider change → simulator.setParameter()
  → render() → radar.draw()
```

## Contacts interculturels

**Simulation probabiliste:**
- Probabilité de contact = D × 0.1
- Si contact:
  - **Positif** (si τ^c > 0): C_i^+ = random(0, 0.5)
  - **Négatif** (si τ^c < 0): C_i^- = random(0, 0.5)

## Limitations et perspectives

### Limitations actuelles
- Contacts interculturels simplifiés (probabilistes)
- Réseau social statique (basé sur distance)
- Richesses constantes (pas de dynamique économique)
- Menace externe M_ext constante

### Extensions possibles
- **Variables individuelles** : âge, santé, capital social
- **Réseau dynamique** : homophilie, évolution temporelle
- **Chocs exogènes** : crises, élections, événements
- **Économie** : dynamique des richesses, mobilité sociale
- **Hystérésis** : points de non-retour, effets mémoire
- **Hétérogénéité** : groupes sociaux, clusters

## Interprétation des dynamiques

### Boucles de rétroaction positives (instabilité)

**Spirale autoritaire:**
```
M ↑ → α ↓ → Q ↓ → Φ ↑ → M ↑ → ...
```

**Spirale vertueuse:**
```
e ↑ → α ↑ → Q ↑ → s ↑ → ε ↑ → Q ↑ → ...
```

### Boucles de rétroaction négatives (stabilisation)

**Régulation par éducation:**
```
Φ ↑ → π ↑ mais e ↑ → π ↓
```

**Régulation institutionnelle:**
```
Φ ↑ → M ↑ mais Q ↑ → M ↓
```

## Références théoriques

Le modèle s'inspire de:
- **Systèmes dynamiques complexes** : transitions de phase
- **Modèles multi-agents** : comportements émergents
- **Sociologie politique** : mécanismes de basculement
- **Psychologie sociale** : contagion émotionnelle, polarisation

## Licence

Projet éducatif et de recherche.
