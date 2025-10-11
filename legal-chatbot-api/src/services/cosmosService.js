const { CosmosClient } = require('@azure/cosmos');

class CosmosService {
  constructor() {
    this.client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });
    this.database = this.client.database(process.env.COSMOS_DATABASE_NAME);
  }

  getContainer(name) {
    return this.database.container(name);
  }

  async createItem(containerName, item) {
    try {
      const container = this.getContainer(containerName);
      const { resource } = await container.items.create(item);
      return resource;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'item: ${error.message}`);
    }
  }

  async queryItems(containerName, query) {
    try {
      const container = this.getContainer(containerName);
      const { resources } = await container.items.query(query).fetchAll();
      return resources;
    } catch (error) {
      throw new Error(`Erreur lors de la requête: ${error.message}`);
    }
  }
}

module.exports = new CosmosService();
