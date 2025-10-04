Intégrer iManage MCP + Wassette dans votre système existant :
Architecture d'intégration N.O.G + iManage
[N.O.G Frontend] → [Flask Backend] → [Wassette Component] → [iManage MCP Server]
Modifications à apporter
1. Nouveau composant Python pour iManage
python# server/imanage_mcp_client.py
import asyncio
import httpx
import json
from typing import Dict, Any, Optional

class IManageMCPClient:
    def __init__(self):
        self.azure_client_id = None
        self.azure_client_secret = None
        self.azure_tenant_id = None
        self.imanage_mcp_url = None
        
    async def authenticate_with_azure(self, user_context: str) -> str:
        """Authentification Azure AD pour accès iManage"""
        # Implémentation OAuth2 flow
        token_url = f"https://login.microsoftonline.com/{self.azure_tenant_id}/oauth2/v2.0/token"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data={
                "client_id": self.azure_client_id,
                "client_secret": self.azure_client_secret,
                "scope": "https://graph.microsoft.com/.default",
                "grant_type": "client_credentials"
            })
            return response.json()["access_token"]
    
    async def search_documents(self, user_token: str, query: str, context: str = "") -> Dict[Any, Any]:
        """Recherche dans iManage via MCP"""
        mcp_request = {
            "method": "tools/call",
            "params": {
                "name": "search-documents",
                "arguments": {
                    "query": query,
                    "context": context,
                    "user_permissions": True  # Respecte les perms iManage
                }
            }
        }
        
        headers = {
            "Authorization": f"Bearer {user_token}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.imanage_mcp_url}/mcp",
                json=mcp_request,
                headers=headers
            )
            return response.json()

# Instance globale
imanage_client = IManageMCPClient()
2. Nouveau agent spécialisé iManage
javascript// client/js/agents/imanage-agent.js
const iManageAgent = {
    id: "imanage_search",
    title: "iManage Document Search",
    context: "Recherche de Documents",
    body: "Agent spécialisé dans la recherche et l'analyse de documents stockés dans iManage. Accède de manière sécurisée aux contrats, mémos, correspondances et autres documents juridiques avec respect des permissions utilisateur.",
    icon: "fa-folder-open",
    color: "#2E86C1",
    
    // Méthodes spécifiques
    async searchDocuments(query, context = "") {
        const response = await fetch('/backend-api/v2/imanage-search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                query: query,
                context: context,
                agent_id: this.id
            })
        });
        return response.json();
    },
    
    // Templates de prompt
    promptTemplates: {
        search: "Rechercher dans iManage: {query}",
        analyze: "Analyser le document iManage: {doc_id}",
        summarize: "Résumer les documents trouvés sur: {topic}"
    }
};
3. Modification du backend Flask
python# server/backend.py - Ajout de l'endpoint iManage
from imanage_mcp_client import imanage_client

@app.route('/backend-api/v2/imanage-search', methods=['POST'])
async def imanage_search():
    try:
        data = request.json
        query = data.get('query', '')
        context = data.get('context', '')
        
        # 1. Authentification via Wassette Component
        user_token = await imanage_client.authenticate_with_azure(
            request.headers.get('User-Context', 'default')
        )
        
        # 2. Recherche sécurisée via MCP
        results = await imanage_client.search_documents(
            user_token, query, context
        )
        
        # 3. Formatage pour N.O.G
        formatted_results = {
            "response": f"Trouvé {len(results.get('documents', []))} documents dans iManage",
            "documents": results.get('documents', []),
            "metadata": {
                "source": "iManage",
                "query": query,
                "permissions_respected": True
            }
        }
        
        return jsonify(formatted_results)
        
    except Exception as e:
        return jsonify({"error": f"iManage search failed: {str(e)}"}), 500

# Modification de l'endpoint principal pour supporter iManage
@app.route('/backend-api/v2/conversation', methods=['POST'])
def conversation():
    data = request.json
    content = data.get('meta', {}).get('content', {})
    
    # Détecter si c'est une requête iManage
    user_message = content.get('parts', [{}])[0].get('content', '')
    
    if 'imanage' in user_message.lower() or 'documents' in user_message.lower():
        # Rediriger vers l'agent iManage
        return redirect(url_for('imanage_search'), code=307)
    
    # Traitement normal...
    return stream_legal_response(data)
4. Configuration Wassette
bash# Configuration des permissions pour le composant iManage
wassette load-component ./components/imanage-connector.wasm

# Permissions réseau
wassette grant-network-permission imanage-connector "imanage.votreclient.com:443"
wassette grant-network-permission imanage-connector "login.microsoftonline.com:443"

# Variables d'environnement
wassette grant-environment-variable-permission imanage-connector "AZURE_CLIENT_ID"
wassette grant-environment-variable-permission imanage-connector "AZURE_CLIENT_SECRET"
wassette grant-environment-variable-permission imanage-connector "AZURE_TENANT_ID"
5. Interface utilisateur - Ajout à onboarding.js
javascript// client/js/onboarding.js - Ajout de l'agent iManage
const agentsData = {
    // ... vos agents existants ...
    
    imanage_search: {
        title: "iManage Document Search",
        context: "Recherche de Documents",
        body: "Accès sécurisé aux documents iManage de votre organisation. Recherche, analyse et résumé de contrats, mémos et correspondances avec respect des permissions utilisateur.",
        keywords: ["imanage", "documents", "contrats", "recherche", "juridique"],
        icon: "fa-folder-open"
    }
};
Avantages de cette intégration
✅ Sécurité : Wassette isole l'accès à iManage
✅ Permissions : Respect des droits utilisateurs iManage
✅ Architecture cohérente : S'intègre dans N.O.G existant
✅ Audit : Logs automatiques des accès
✅ Évolutivité : Prêt pour d'autres connecteurs
Question : Voulez-vous que je détaille l'implémentation du composant Wassette ou l'intégration frontend ?



