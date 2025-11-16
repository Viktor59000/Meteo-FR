## 🌟 Aperçu du Projet

Ce projet est une application web monopage (SPA) conçue pour fournir des prévisions météorologiques détaillées pour n'importe quelle commune en France. Il utilise la cartographie interactive pour une UX moderne et épurée.

L'interface est conçue selon une esthétique **Dark Mode**, priorisant la rapidité d'accès à l'information par la recherche instantanée (autocomplete) et la consultation de données étendues sur **14 jours**.

### Fonctionnalités Clés :

* **Carte Interactive (Leaflet)** : Visualisation de la France avec un marqueur dynamique sur la ville sélectionnée.
* **Recherche Instantanée (UX)** : Utilise l'API de Géocodage du Gouvernement Français pour une autocomplétion rapide (déclenchement dès la première lettre).
* **Panneau de Statistiques** : Affichage des données actuelles (Température, Humidité, Vent) de manière fiable (lecture du premier index horaire de l'API).
* **Prévisions Détaillées** : Vue étendue sur **14 jours** avec des extrêmes quotidiens (Min/Max).
* **Vue Horaire Défilante** : Un clic sur un jour ouvre une galerie horaire (`hourly-scroll-container`) pour une immersion complète dans les données, inspirée par l'UX de RainViewer.
* **Design & Accessibilité** : Esthétique Dark Mode avec bascule de thème (Soleil/Lune) et utilisation de balises `<abbr>` pour améliorer la sémantique et l'accessibilité des données.

---

## 🛠️ Stack Technique

| Composant | Rôle |
| :--- | :--- |
| **JavaScript (ES6+)** | Logique de l'application et gestion du flux de données. |
| **Webpack** | Bundler pour la modularisation (JS, CSS). |
| **Axios** | Client HTTP essentiel pour toutes les requêtes API asynchrones. |
| **Leaflet** | Librairie de cartographie interactive. |
| **API Open-Meteo** | Fournisseur de données météorologiques (jusqu'à 16 jours de prévisions horaires). |
| **API Gouv** | Fournisseur de données de géocodage pour la recherche de communes. |

---

## 🚀 Installation et Démarrage

Pour lancer ce projet en local, vous devez avoir [Node.js](https://nodejs.org/) et `npm` installés.

1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/Viktor59000/meteo-france-map.git](https://github.com/Viktor59000/meteo-france-map.git)
    cd meteo-france-map
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```

3.  **Démarrer le serveur de développement :**
    ```bash
    npm start
    ```
    L'application s'ouvrira automatiquement dans votre navigateur.

---

## 📄 Licence et Contact

* **GitHub :** [@Viktor59000](https://github.com/Viktor59000)
* **Projet :** `meteo-france-map`
