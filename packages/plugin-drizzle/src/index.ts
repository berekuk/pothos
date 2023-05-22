import './global-types';
import './field-builder';
import './schema-builder';
import SchemaBuilder, { BasePlugin, SchemaTypes } from '@pothos/core';

export * from './types';

const pluginName = 'drizzle';

export default pluginName;

export class PothosDrizzlePlugin<Types extends SchemaTypes> extends BasePlugin<Types> {}

SchemaBuilder.registerPlugin(pluginName, PothosDrizzlePlugin, {});
