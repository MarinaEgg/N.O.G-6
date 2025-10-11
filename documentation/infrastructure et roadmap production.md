# Récapitulatif Infrastructure POC + Roadmap Production (N.O.G - grade)

## Ce qu'on a déployé (POC Staging)

legal-chatbot-staging_group/
├─ Cosmos DB (legal-chatbot-cosmos)
│  ├─ legalChatbotDB
│  │  ├─ agents (partition: /agentId)
│  │  ├─ conversations (partition: /userId)
│  │  └─ messages (partition: /conversationId)
│  ├─ Mode: Serverless + Free Tier (1000 RU/s gratuits)
│  └─ Backup: Continuous 7 days
│
├─ Function App (legal-chatbot-api)
│  ├─ Runtime: Node.js 20 LTS Linux
│  ├─ Plan: Consumption (serverless)
│  ├─ Storage: legalchatbotstagingb9ea
│  └─ Monitoring: Application Insights
│
└─ Ressources existantes
   ├─ Azure OpenAI (2 instances: east + west)
   ├─ Storage Account (eggondatalake)
   ├─ Pinecone SaaS (embeddings)
   └─ 2 VMs (legal-chatbot-staging + interface)

### Infrastructure Azure (East US 2)

## 🔴 Dette Technique Critique (POC → Production iManage-grade)

### 1. Zero Trust Architecture

**Actuel** : Accès public activé partout

**Target** :
- [ ] Private Endpoints (Cosmos DB, Storage, Functions)
- [ ] VNet integration complète
- [ ] NSG strict (pas d'internet direct)
- [ ] Azure Bastion seulement (supprimer SSH direct VMs)
- [ ] Application Gateway + WAF v2

**Priorité** : P0 (bloquant prod)  
**Fichiers** : `infrastructure/network.bicep` (à créer)

### 2. Customer-Managed Encryption Keys (CMEK)

**Actuel** : Service-managed keys

**Target** :
- [ ] Azure Key Vault Premium (HSM FIPS 140-2 Level 2)
- [ ] Dual-party encryption (customer owns master key)
- [ ] File-level encryption keys (FEK)
- [ ] Library-level encryption keys (LEK)
- [ ] Hierarchie NIST compliant

**Priorité** : P0 (bloquant données sensibles)  
**Fichiers** :
- `src/services/encryption.js`
- `infrastructure/keyvault.bicep`
- Cosmos DB → recréer avec CMK

### 3. Authentification Zéro Secret

**Actuel** :
- Cosmos DB : connection string en clair
- Storage : secrets dans Function App Settings
- Pas d'auth utilisateur (Azure AD manquant)

**Target** :
- [ ] System-assigned Managed Identity (Function App)
- [ ] RBAC roles (Storage Blob Contributor, Cosmos DB Data Contributor)
- [ ] Azure AD B2C pour utilisateurs finaux
- [ ] MSAL.js v2 PKCE frontend
- [ ] Certificats client TLS 1.2 mutual auth
- [ ] Supprimer tous secrets/connection strings

**Priorité** : P0  
**Fichiers** :
- `src/config/cosmosdb.js` → utiliser `@azure/identity`
- `src/auth/` (à créer)
- Frontend : intégrer MSAL.js

### 4. CI/CD Zero-Touch

**Actuel** : Déploiement manuel

**Target** :
- [ ] GitHub Actions avec OIDC (pas de secrets)
- [ ] Bicep/ARM templates (Infrastructure as Code)
- [ ] Environnements isolés (dev/staging/prod)
- [ ] Feature flags (LaunchDarkly ou Azure App Config)
- [ ] Rollback automatique si healthcheck fail
- [ ] Zero downtime deployments (blue/green)

**Priorité** : P1  
**Fichiers** : `.github/workflows/deploy.yml` (à créer)

### 5. Geo-Redundancy & HA

**Actuel** : Single region (East US 2)

**Target Europe** :
- [ ] Primary: France Central
- [ ] Secondary: Germany North ou West Europe
- [ ] Cosmos DB: Multi-region writes
- [ ] Storage: GZRS (Geo-Zone Redundant)
- [ ] Traffic Manager ou Front Door
- [ ] RTO < 1h, RPO < 15min

**Priorité** : P1 (avant GA Europe)  
**Coût** : +60-80%

### 6. Monitoring & Logging

**Actuel** : Application Insights basic

**Target** :
- [ ] Structured logging (JSON + correlation IDs)
- [ ] Azure Monitor Workbooks (dashboards SRE)
- [ ] Log Analytics retention 90 days
- [ ] Alertes PagerDuty/Teams (latency, errors, RU throttling)
- [ ] Audit logs immutables (compliance)
- [ ] SIEM integration (Sentinel si nécessaire)

**Priorité** : P2  
**Fichiers** : `src/utils/logger.js` (à créer)

### 7. API Security & Rate Limiting

**Actuel** : Aucune protection

**Target** :
- [ ] Azure API Management (APIM)
- [ ] OAuth 2.0 + JWT validation
- [ ] Rate limiting par utilisateur (100 req/min)
- [ ] IP whitelist (VPN corporate si besoin)
- [ ] DDoS Protection Standard
- [ ] CORS strict (pas de wildcard)

**Priorité** : P1  
**Fichiers** : `src/middleware/` (à créer)

### 8. Data Residency & Compliance EU

**Actuel** : US region (East US 2)

**Target** :
- [ ] Migration complète vers France Central
- [ ] Vérifier Azure OpenAI dispo France (sinon Sweden Central)
- [ ] GDPR compliance audit
- [ ] Data Processing Agreement (DPA) Microsoft
- [ ] Sovereignty logs (pas de support US sur données EU)

**Priorité** : P0 si clients EU  
**Délai** : 2-3 semaines migration

### 9. Disaster Recovery Plan

**Actuel** : Backup Cosmos 7j, aucun test

**Target** :
- [ ] DR runbook documenté
- [ ] Backup testing trimestriel
- [ ] Failover drill annuel
- [ ] Cosmos DB Point-in-Time Restore testé
- [ ] Secrets backup (Key Vault soft-delete 90j activé)

**Priorité** : P2  
**Fichiers** : `docs/disaster-recovery.md` (à créer)

### 10. Frontend Security

**Actuel** : Pas de CSP, pas de sanitation

**Target** :
- [ ] Content Security Policy (CSP) strict
- [ ] Subresource Integrity (SRI) pour CDN
- [ ] DOMPurify pour tout HTML user-generated
- [ ] Cookies: Secure + HttpOnly + SameSite=Strict
- [ ] Pas de localStorage pour tokens (memory only)

**Priorité** : P0  
**Fichiers** :
- `index.html` → ajouter meta CSP
- `src/utils/sanitizer.js` (à créer)

## 📊 Priorisation (N.O.G - grade Production)

### Phase 1 - Bloquants Production (P0) - 4-6 semaines

- CMEK + Key Vault Premium
- Managed Identity + supprimer secrets
- Azure AD B2C auth
- Private Endpoints + VNet
- CSP + sanitation frontend
- Migration France Central

### Phase 2 - Avant GA (P1) - 2-3 semaines

- CI/CD GitHub Actions
- API Management + rate limiting
- Geo-redundancy secondary region
- Monitoring dashboards

### Phase 3 - Post-GA (P2) - ongoing

- DR testing
- Feature flags
- Advanced logging/SIEM
- Compliance certifications (ISO 27001, SOC 2)

## 💰 Estimation Coûts Production (France Central)

**POC actuel** : ~25€/mois (free tiers)  
**Production N.O.G - grade** : 800-1200€/mois

- Cosmos DB provisioned (5000 RU/s) : 300€
- Functions Premium (HA + VNet) : 200€
- Key Vault Premium HSM : 150€
- APIM Developer tier : 150€
- Private Endpoints (3x) : 30€
- GZRS Storage : 50€
- Application Gateway : 100€
- Monitoring/Logs : 50€
