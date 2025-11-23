import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap () {
	const app = await NestFactory.create(AppModule)
	app.enableCors()
	app.setGlobalPrefix('api')
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	)

	const config = new DocumentBuilder()
		.setTitle('EazyCertify API')
		.setDescription('API documentation for EazyCertify')
		.setVersion('1.0')
		.addBearerAuth(
			{ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
			'bearer',
		)
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true })

	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
