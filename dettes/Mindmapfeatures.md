# Mindmap Interactive - Architecture Dossier d'Avocat

## Description

Outil de visualisation interactif pour explorer l'architecture d'un dossier d'avocat à partir de contenu markdown.

## Fonctionnalités

- **Parsing automatique** du markdown avec reconnaissance des niveaux (`#`, `##`, `###`, etc.)
- **Détection intelligente** des types d'éléments :
  - Client
  - Dossier
  - Répertoire
  - Document
  - Sous-répertoire
- **Code couleur** différent pour chaque type d'élément
- **Layout circulaire** organisé autour des éléments parents
- **Effets d'interaction** au survol (hover effects)
- **Légende intégrée** pour la compréhension visuelle

## Utilisation

1. **Structurez votre contenu** en markdown :
```markdown
# Client: Dupont & Associés
## Dossier: Affaire Commerciale 2024
### Répertoire: Contrats
#### Document: Accord de confidentialité
#### Document: Contrat de prestation
### Répertoire: Correspondance
#### Sous-répertoire: Emails
#### Sous-répertoire: Courriers

Collez votre structure dans la zone de texte dédiée
2. **Utilisation**:

- Colle ta structure markdown dans le textarea
- Utilise la syntaxe : # Client: Nom, ## Dossier: Nom, etc.
- La mindmap se génère automatiquement

La mindmap se génère automatiquement avec la visualisation interactive

3. **Exemple d'un code**:

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mindmap Dossier Avocat</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .controls {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        textarea {
            width: 100%;
            height: 120px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: monospace;
            resize: vertical;
        }
        
        button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        
        button:hover {
            background: #1d4ed8;
        }
        
        #mindmap {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: auto;
        }
        
        .node {
            position: absolute;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease;
            border: 2px solid;
            min-width: 120px;
            text-align: center;
            font-size: 12px;
            font-weight: 500;
        }
        
        .node:hover {
            transform: scale(1.05);
            z-index: 100;
        }
        
        .client {
            background: #fef3c7;
            border-color: #f59e0b;
            color: #92400e;
        }
        
        .dossier {
            background: #dbeafe;
            border-color: #3b82f6;
            color: #1e40af;
        }
        
        .repertoire {
            background: #dcfce7;
            border-color: #10b981;
            color: #065f46;
        }
        
        .document {
            background: #fce7f3;
            border-color: #ec4899;
            color: #be185d;
        }
        
        .sous-repertoire {
            background: #e0e7ff;
            border-color: #6366f1;
            color: #4338ca;
        }
        
        .line {
            position: absolute;
            background: #94a3b8;
            z-index: 1;
        }
        
        .expanded {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .legend {
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 12px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="controls">
            <h2>Générateur de Mindmap - Architecture Dossier Avocat</h2>
            <textarea id="markdownInput" placeholder="Collez votre structure markdown ici...
Exemple:
# Client: Société ABC
## Dossier: Litige Commercial 2024
### Répertoire: Correspondances
#### Document: Lettre de mise en demeure.pdf
#### Document: Réponse adverse.pdf
### Répertoire: Pièces justificatives
#### Sous-répertoire: Contrats
##### Document: Contrat initial.pdf
##### Document: Avenant n°1.pdf
#### Sous-répertoire: Factures
##### Document: Facture 001.pdf"></textarea>
            <button onclick="generateMindmap()">Générer la Mindmap</button>
        </div>
        
        <div id="mindmap" style="width: 100%; height: 600px; position: relative;">
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #fef3c7; border: 1px solid #f59e0b;"></div>
                    Client
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #dbeafe; border: 1px solid #3b82f6;"></div>
                    Dossier
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #dcfce7; border: 1px solid #10b981;"></div>
                    Répertoire
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #fce7f3; border: 1px solid #ec4899;"></div>
                    Document
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #e0e7ff; border: 1px solid #6366f1;"></div>
                    Sous-répertoire
                </div>
            </div>
        </div>
    </div>

    <script>
        let nodes = [];
        let lines = [];

        function parseMarkdown(text) {
            const lines = text.split('\n').filter(line => line.trim());
            const structure = [];
            
            lines.forEach(line => {
                const level = (line.match(/^#+/) || [''])[0].length;
                const content = line.replace(/^#+\s*/, '').trim();
                
                if (content) {
                    let type = 'document';
                    if (content.toLowerCase().startsWith('client:')) {
                        type = 'client';
                    } else if (content.toLowerCase().startsWith('dossier:')) {
                        type = 'dossier';
                    } else if (content.toLowerCase().startsWith('répertoire:') || content.toLowerCase().startsWith('repertoire:')) {
                        type = 'repertoire';
                    } else if (content.toLowerCase().startsWith('sous-répertoire:') || content.toLowerCase().startsWith('sous-repertoire:')) {
                        type = 'sous-repertoire';
                    } else if (content.toLowerCase().startsWith('document:')) {
                        type = 'document';
                    }
                    
                    structure.push({
                        level,
                        content: content.replace(/^(client|dossier|répertoire|repertoire|sous-répertoire|sous-repertoire|document):\s*/i, ''),
                        type,
                        id: Date.now() + Math.random()
                    });
                }
            });
            
            return structure;
        }

        function createNode(item, x, y, parent = null) {
            const node = document.createElement('div');
            node.className = `node ${item.type}`;
            node.textContent = item.content;
            node.style.left = x + 'px';
            node.style.top = y + 'px';
            
            node.addEventListener('click', () => {
                node.classList.toggle('expanded');
            });
            
            return {
                element: node,
                item,
                x,
                y,
                parent
            };
        }

        function createLine(x1, y1, x2, y2) {
            const line = document.createElement('div');
            line.className = 'line';
            
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            line.style.width = length + 'px';
            line.style.height = '2px';
            line.style.left = x1 + 'px';
            line.style.top = y1 + 'px';
            line.style.transformOrigin = '0 50%';
            line.style.transform = `rotate(${angle}deg)`;
            
            return line;
        }

        function generateMindmap() {
            const markdown = document.getElementById('markdownInput').value;
            const mindmapContainer = document.getElementById('mindmap');
            
            // Clear existing content
            const existingNodes = mindmapContainer.querySelectorAll('.node, .line');
            existingNodes.forEach(el => el.remove());
            
            if (!markdown.trim()) {
                // Show example
                document.getElementById('markdownInput').value = `# Client: Société ABC
## Dossier: Litige Commercial 2024
### Répertoire: Correspondances
#### Document: Lettre de mise en demeure.pdf
#### Document: Réponse adverse.pdf
### Répertoire: Pièces justificatives
#### Sous-répertoire: Contrats
##### Document: Contrat initial.pdf
##### Document: Avenant n°1.pdf
#### Sous-répertoire: Factures
##### Document: Facture 001.pdf
##### Document: Facture 002.pdf`;
                generateMindmap();
                return;
            }
            
            const structure = parseMarkdown(markdown);
            nodes = [];
            lines = [];
            
            const centerX = mindmapContainer.clientWidth / 2;
            const centerY = 50;
            const levelSpacing = 120;
            const nodeSpacing = 150;
            
            // Position nodes
            structure.forEach((item, index) => {
                let x, y;
                
                if (item.level === 1) {
                    // Root level - center
                    x = centerX - 60;
                    y = centerY;
                } else {
                    // Find parent
                    const parentIndex = structure.slice(0, index).reverse().findIndex(
                        parent => parent.level === item.level - 1
                    );
                    
                    if (parentIndex !== -1) {
                        const realParentIndex = index - 1 - parentIndex;
                        const parent = nodes[realParentIndex];
                        
                        // Count siblings at same level
                        const siblings = structure.filter(
                            (sibling, sibIndex) => sibIndex > realParentIndex && 
                            sibIndex < index + structure.slice(index + 1).findIndex(
                                next => next.level <= item.level - 1
                            ) + index + 1 &&
                            sibling.level === item.level
                        );
                        
                        const siblingIndex = siblings.findIndex(s => s === item);
                        const totalSiblings = siblings.length;
                        
                        // Arrange in circle around parent
                        const angle = (siblingIndex / Math.max(totalSiblings, 1)) * 2 * Math.PI - Math.PI/2;
                        const radius = levelSpacing + (item.level - 2) * 30;
                        
                        x = parent.x + Math.cos(angle) * radius;
                        y = parent.y + Math.sin(angle) * radius + levelSpacing;
                    } else {
                        x = centerX + (index % 3 - 1) * nodeSpacing;
                        y = centerY + item.level * levelSpacing;
                    }
                }
                
                const node = createNode(item, x, y);
                nodes.push(node);
                mindmapContainer.appendChild(node.element);
                
                // Create line to parent
                if (item.level > 1) {
                    const parentIndex = nodes.slice(0, -1).reverse().findIndex(
                        parent => parent.item.level === item.level - 1
                    );
                    
                    if (parentIndex !== -1) {
                        const parent = nodes[nodes.length - 2 - parentIndex];
                        const line = createLine(
                            parent.x + 60, parent.y + 20,
                            x + 60, y + 20
                        );
                        mindmapContainer.appendChild(line);
                    }
                }
            });
        }

        // Generate example on load
        window.onload = () => {
            generateMindmap();
        };
    </script>
</body>
</html>
