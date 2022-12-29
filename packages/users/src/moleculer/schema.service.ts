import { Service, Event, Action } from 'moleculer-decorators';
import { Service as MoleculerService, ServiceSettingSchema } from 'moleculer';
import { ServiceEndpointDefinition } from '@apollo/gateway';

export enum SchemaEvents {
  SCHEMA_CREATED = 'schema_created',
  SCHEMA_DISCOVERY = 'schema_discovery',
}

export interface SchemaServiceSettings extends ServiceSettingSchema {
  endpoint: ServiceEndpointDefinition;
}

@Service({
  name: 'schema',
})
export class SchemaService extends MoleculerService<SchemaServiceSettings> {
  /**
   * Caches the endpoints captured by the schema_created event handler.
   */
  private endpointList: ServiceEndpointDefinition[] = [];

  /**
   * Publish the schema endpoint on startup for the gateway to collect it.
   */
  async started() {
    this.logger.info('schema endpoint is', this.settings.endpoint);
    this.publish();
  }

  /***
   * Publishes this node's endpoint for the graphql schema.
   */
  @Action()
  async publish() {
    if (this.settings.endpoint) {
      await this.broker.broadcast(
        SchemaEvents.SCHEMA_CREATED,
        this.settings.endpoint,
      );
    }
  }

  /**
   * Returns the endpoint list capture by this service through the schema_created event handler.
   */
  @Action()
  async endpoints(): Promise<ServiceEndpointDefinition[]> {
    return this.endpointList;
  }

  /**
   * Fires the schema_discovery event for connected nodes to publish its schema endpoints
   */
  @Action()
  async discover(): Promise<ServiceEndpointDefinition[]> {
    await this.broker.broadcast(SchemaEvents.SCHEMA_DISCOVERY);
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.endpointList), 1000);
    });
  }

  /**
   * Listens for the schema_created event and caches the payload within the service.
   */
  @Event({
    name: SchemaEvents.SCHEMA_CREATED,
  })
  handleSchemaCreated(
    payload: ServiceEndpointDefinition,
    sender: string,
    eventName: SchemaEvents,
  ) {
    this.logger.info('EVENT: schema_created', { payload, sender, eventName });
    this.endpointList = this.endpointList
      ?.filter((endpoint) => endpoint.name !== payload.name)
      ?.concat(payload) || [payload];
  }

  /**
   * Listens for the schema_discovery and fires the schema_created event for the gateway to collect this node's schema endpoint.
   */
  @Event({
    name: SchemaEvents.SCHEMA_DISCOVERY,
  })
  handleSchemaDiscovery(
    payload: never,
    sender: string,
    eventName: SchemaEvents,
  ) {
    this.logger.info(`EVENT: ${SchemaEvents.SCHEMA_DISCOVERY}`, {
      sender,
      eventName,
    });
    this.publish();
  }
}
