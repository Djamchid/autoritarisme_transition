# Simulation: Transition Démocratique vers l'Autoritarisme

Simulation interactive basée sur des équations différentielles modélisant l'évolution d'une société vers l'autoritarisme.

## Description

Ce projet implémente un système multi-agents où chaque agent possède des caractéristiques individuelles (richesse, éducation, adhésion démocratique, etc.) qui évoluent selon des équations différentielles couplées. Le système permet d'étudier les transitions de phase entre démocratie et autoritarisme.

## Fonctionnalités

- **Simulation en temps réel** avec 50-500 agents
- **Visualisation spatiale** des agents colorés selon leur adhésion démocratique
- **Graphiques temporels** des variables macroscopiques
- **Contrôles interactifs** pour ajuster les paramètres en temps réel
- **Paramètre d'ordre** Ψ = ⟨α⟩ · Q pour identifier les transitions de phase

## Variables du modèle

### Variables individuelles (par agent)
- **w_i** : Richesse
- **e_i** : Éducation
- **s_i** : Sécurité perçue
- **τ^w_i, τ^p_i, τ^c_i** : Tolérances (économique, physique, culturelle)
- **ε_i** : Énergie civique
- **π_i** : Perméabilité aux influences
- **α_i** : Adhésion démocratique

### Variables macroscopiques
- **G** : Inégalité (Gini)
- **P** : Précarité
- **D** : Diversité culturelle
- **Q** : Qualité institutionnelle
- **Φ** : Polarisation
- **M** : Menace perçue

## Équations principales

### Adhésion démocratique
```
dα_i/dt = π_i·⟨α⟩ + β₁·e_i·(1-α_i) - β₂·(1-s_i)·α_i + β₃·Q - β₄·M·π_i
```

### Qualité institutionnelle
```
dQ/dt = μ₁·⟨α⟩·⟨ε⟩ - μ₂·(1-⟨α⟩)·Φ - μ₃·G
```

### Polarisation
```
dΦ/dt = ν₁·σ(α) + ν₂·G - ν₃·⟨e⟩·Q
```

Voir `specifications.md` pour la formalisation complète.

## Utilisation

### Lancement local

1. Ouvrir `index.html` dans un navigateur web moderne
2. Ou utiliser un serveur local :
```bash
python -m http.server 8000
# Puis ouvrir http://localhost:8000
```

### Contrôles

- **Démarrer** : Lance la simulation
- **Pause** : Met en pause
- **Réinitialiser** : Réinitialise avec de nouveaux paramètres

### Paramètres ajustables

- **Nombre d'agents** : Taille de la population (50-500)
- **Pas de temps** : Vitesse de simulation (0.001-0.1)
- **Paramètres β** : Influence de l'éducation, insécurité, institutions, peur
- **Paramètres μ** : Dynamique institutionnelle
- **Conditions initiales** : Q₀, G₀, M_ext

## Structure du code

```
├── index.html              # Interface principale
├── css/
│   └── styles.css         # Styles de l'application
├── js/
│   ├── agent.js           # Classe Agent (variables individuelles)
│   ├── society.js         # Classe Society (variables macroscopiques)
│   ├── equations.js       # Équations différentielles
│   ├── simulator.js       # Moteur de simulation (intégration d'Euler)
│   ├── visualization.js   # Rendu graphique
│   └── main.js           # Point d'entrée et contrôles UI
└── specifications.md      # Formalisation mathématique complète
```

## Architecture

- **Modularité** : Code organisé en modules ES6
- **Séparation des préoccupations** : Logique, visualisation et UI séparées
- **Intégration numérique** : Méthode d'Euler avec pas de temps ajustable
- **Réseau social** : Voisinage basé sur la proximité spatiale

## Interprétation des résultats

### Paramètre d'ordre Ψ
- **Ψ > 0.3** : Régime démocratique stable
- **Ψ < 0.3** : Risque de transition autoritaire
- **Ψ < 0** : Régime autoritaire établi

### Visualisation des agents
- **Vert** : Adhésion démocratique forte (α → +1)
- **Rouge** : Tendance autoritaire (α → -1)

### Graphiques temporels
- **Bleu** : Paramètre d'ordre Ψ
- **Vert** : Qualité institutionnelle Q
- **Rouge** : Polarisation Φ
- **Orange** : Menace perçue M

## Limitations et extensions possibles

### Limitations actuelles
- Contacts interculturels simplifiés (probabilistes)
- Réseau social statique basé sur la distance
- Pas de modélisation des chocs externes dynamiques

### Extensions futures
- Ajouter capital social, santé, âge des agents
- Réseau social dynamique avec homophilie
- Événements exogènes (crises, élections)
- Hystérésis et effets de seuil non-linéaires
- Mécanismes de feedback institutionnels

## Références

Voir `specifications.md` pour la dérivation complète des équations et la discussion des paramètres manquants.

## Licence

Projet éducatif et de recherche.
