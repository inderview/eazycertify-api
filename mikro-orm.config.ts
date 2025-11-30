import { defineConfig } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import * as dotenv from 'dotenv'

// Load environment variables for CLI usage
dotenv.config()

export default defineConfig({
	clientUrl: process.env.DATABASE_URL ?? '',
	entities: ['./dist/src/**/*.entity.js'],
	entitiesTs: ['./src/**/*.entity.ts'],
	migrations: {
		path: './src/migrations',
		pathTs: './src/migrations',
		tableName: 'mikro_orm_migrations',
	},
	metadataProvider: TsMorphMetadataProvider,
	discovery: {
		// allow the app to start even if there are currently no entities
		warnWhenNoEntities: false,
	},
	debug: process.env.NODE_ENV !== 'production',
})

