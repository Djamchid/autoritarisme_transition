# Formalisation des équations d'évolution

## 1. Variables d'état individuelles

Pour chaque agent $i \in \{1, ..., N\}$ :

| Variable | Symbole | Domaine |
|----------|---------|---------|
| Richesse | $w_i$ | $[0, +\infty)$ |
| Éducation | $e_i$ | $[0, 1]$ |
| Sécurité perçue | $s_i$ | $[0, 1]$ |
| Tolérance économique | $\tau^w_i$ | $[-1, 1]$ |
| Tolérance physique | $\tau^p_i$ | $[-1, 1]$ |
| Tolérance culturelle | $\tau^c_i$ | $[-1, 1]$ |
| Énergie civique | $\epsilon_i$ | $[0, 1]$ |
| Perméabilité | $\pi_i$ | $[0, 1]$ |
| Adhésion démocratique | $\alpha_i$ | $[-1, 1]$ |

---

## 2. Variables macroscopiques (champ)

| Variable | Symbole | Signification |
|----------|---------|---------------|
| Inégalité | $G$ | Gini effectif |
| Précarité | $P$ | Taux d'insécurité économique |
| Diversité | $D$ | Hétérogénéité culturelle visible |
| Qualité institutionnelle | $Q$ | Solidité des contre-pouvoirs |
| Polarisation | $\Phi$ | Fragmentation informationnelle |
| Menace perçue | $M$ | Niveau de peur collective |

---

## 3. Équations d'évolution individuelles

### 3.1 Adhésion démocratique (variable centrale)

$$\frac{d\alpha_i}{dt} = \underbrace{\pi_i \cdot \langle \alpha \rangle_{\mathcal{N}_i}}_{\text{influence sociale}} + \underbrace{\beta_1 \cdot e_i \cdot (1 - \alpha_i)}_{\text{effet éducation}} - \underbrace{\beta_2 \cdot (1-s_i) \cdot \alpha_i}_{\text{érosion par insécurité}} + \underbrace{\beta_3 \cdot Q}_{\text{effet institutionnel}} - \underbrace{\beta_4 \cdot M \cdot \pi_i}_{\text{effet peur}}$$

où $\mathcal{N}_i$ est le voisinage social de $i$ et $\langle \cdot \rangle_{\mathcal{N}_i}$ la moyenne sur ce voisinage.

**Paramètres manquants identifiés :** $\beta_1, \beta_2, \beta_3, \beta_4$ (poids relatifs des mécanismes)

---

### 3.2 Tolérances (exemple : tolérance culturelle)

$$\frac{d\tau^c_i}{dt} = \underbrace{\gamma_1 \cdot e_i \cdot (1 - \tau^c_i)}_{\text{ouverture par éducation}} + \underbrace{\gamma_2 \cdot C_i^{+} \cdot (1 - \tau^c_i)}_{\text{contact positif}} - \underbrace{\gamma_3 \cdot C_i^{-} \cdot (1 + \tau^c_i)}_{\text{contact négatif}} - \underbrace{\gamma_4 \cdot (1-s_i) \cdot \Phi \cdot \tau^c_i}_{\text{repli identitaire}}$$

**Paramètres manquants :** 
- $C_i^{+}, C_i^{-}$ : fréquence de contacts interculturels positifs/négatifs
- $\gamma_1, ..., \gamma_4$ : constantes de couplage
- **Qualité des contacts** (pas seulement fréquence)

---

### 3.3 Sécurité perçue

$$\frac{d s_i}{dt} = \underbrace{\delta_1 \cdot \frac{w_i}{\langle w \rangle}}_{\text{richesse relative}} + \underbrace{\delta_2 \cdot Q}_{\text{filet institutionnel}} - \underbrace{\delta_3 \cdot P}_{\text{précarité ambiante}} - \underbrace{\delta_4 \cdot M}_{\text{climat anxiogène}} - \underbrace{\delta_5 \cdot \pi_i \cdot \Phi}_{\text{contagion médiatique}}$$

**Paramètres manquants :**
- **Stabilité de l'emploi** individuelle (pas seulement richesse)
- **Capital social** (réseau de soutien)
- **Santé** (physique et mentale)

---

### 3.4 Perméabilité

$$\frac{d\pi_i}{dt} = -\underbrace{\eta_1 \cdot e_i \cdot \pi_i}_{\text{esprit critique}} + \underbrace{\eta_2 \cdot (1-s_i) \cdot (1-\pi_i)}_{\text{vulnérabilité}} + \underbrace{\eta_3 \cdot \Phi \cdot (1-\pi_i)}_{\text{pression médiatique}}$$

**Paramètre manquant :**
- **Littératie médiatique** (distincte de l'éducation générale)
- **Âge / génération** (rapport aux médias)

---

### 3.5 Énergie civique

$$\frac{d\epsilon_i}{dt} = \underbrace{\lambda_1 \cdot s_i \cdot (1-\epsilon_i)}_{\text{disponibilité}} - \underbrace{\lambda_2 \cdot (1-s_i)}_{\text{épuisement survie}} + \underbrace{\lambda_3 \cdot \langle \epsilon \rangle_{\mathcal{N}_i}}_{\text{entraînement social}} - \underbrace{\lambda_4 \cdot (1-Q)}_{\text{découragement institutionnel}}$$

**Paramètre manquant :**
- **Sentiment d'efficacité** (croire que l'action compte)
- **Temps disponible** (charge de travail, caring)

---

## 4. Équations macroscopiques

### 4.1 Qualité institutionnelle

$$\frac{dQ}{dt} = \underbrace{\mu_1 \cdot \langle \alpha \rangle \cdot \langle \epsilon \rangle}_{\text{engagement démocratique}} - \underbrace{\mu_2 \cdot (1 - \langle \alpha \rangle) \cdot \Phi}_{\text{capture autoritaire}} - \underbrace{\mu_3 \cdot G}_{\text{corruption par inégalités}}$$

---

### 4.2 Polarisation

$$\frac{d\Phi}{dt} = \underbrace{\nu_1 \cdot \sigma(\alpha)}_{\text{variance des opinions}} + \underbrace{\nu_2 \cdot G}_{\text{fracture économique}} - \underbrace{\nu_3 \cdot \langle e \rangle \cdot Q}_{\text{médiation institutionnelle}}$$

où $\sigma(\alpha)$ est l'écart-type de l'adhésion démocratique.

---

### 4.3 Menace perçue

$$\frac{dM}{dt} = \underbrace{\rho_1 \cdot M_{ext}}_{\text{menaces réelles}} + \underbrace{\rho_2 \cdot \Phi \cdot (1-Q)}_{\text{amplification}} + \underbrace{\rho_3 \cdot D \cdot (1 - \langle \tau^c \rangle)}_{\text{xénophobie}} - \underbrace{\rho_4 \cdot \langle s \rangle}_{\text{résilience collective}}$$

**Paramètre manquant :**
- $M_{ext}$ : menaces objectives (climat, guerre, pandémie...)

---

## 5. Synthèse : paramètres manquants révélés

| Catégorie | Paramètres à ajouter |
|-----------|---------------------|
| **Individuel** | Capital social, santé, âge, littératie médiatique, sentiment d'efficacité, temps disponible |
| **Relationnel** | Qualité des contacts interculturels, homophilie du réseau, bridging vs bonding |
| **Institutionnel** | Représentativité politique, accès à la justice, mémoire historique |
| **Exogène** | Chocs externes (climat, guerre, crise économique), technologie de surveillance |
| **Dynamique** | Hystérésis (irréversibilité partielle), effets de seuil non-linéaires |

---

## 6. Paramètre d'ordre et transition de phase

Le **paramètre d'ordre** naturel serait :

$$\Psi = \langle \alpha \rangle \cdot Q$$

La transition vers l'autoritarisme survient quand $\Psi$ passe sous un seuil critique $\Psi_c$.

**Question ouverte :** la transition est-elle continue (second ordre) ou discontinue avec hystérésis (premier ordre) ?

 code une première version simulable de ce système, permettant de discuter des choix de couplage et des valeurs des constantes ; outout html, css, js vailla modular
