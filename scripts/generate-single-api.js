const fs = require('fs-extra')
const path = require('path')
const { execSync } = require('child_process')

// Script to generate API for a single service
async function generateSingleApi() {
  const serviceName = process.argv[2]
  const swaggerUrl = process.argv[3]

  if (!serviceName || !swaggerUrl) {
    console.error('Usage: npm run generate:api <service-name> <swagger-url>')
    console.error('Example: npm run generate:api user-service http://localhost:8081/v3/api-docs')
    process.exit(1)
  }

  console.log(`🚀 Generating API for ${serviceName}...`)

  const outputDir = `src/generated/${serviceName}`

  try {
    // Clean the output directory
    await fs.emptyDir(outputDir)

    // Generate the API using OpenAPI Generator
    const command = `npx @openapitools/openapi-generator-cli generate \\
      -i ${swaggerUrl} \\
      -g typescript-axios \\
      -o ${outputDir} \\
      --additional-properties=npmName=ementor-api-client,supportsES6=true,withInterfaces=true,useSingleRequestParameter=true \\
      --skip-validate-spec`

    console.log(`Running: ${command.replace(/\s+/g, ' ')}`)
    execSync(command, { stdio: 'inherit' })

    // Post-process the generated files
    await postProcessGeneratedFiles({ name: serviceName, outputDir })

    console.log(`✅ Successfully generated API for ${serviceName}`)
  } catch (error) {
    console.error(`❌ Failed to generate API for ${serviceName}:`, error.message)
    process.exit(1)
  }
}

async function postProcessGeneratedFiles(service) {
  const apiDir = path.join(service.outputDir, 'api')

  // Check if directories exist
  if (await fs.pathExists(apiDir)) {
    const apiFiles = await fs.readdir(apiDir)

    // Process each API file to integrate with our axios interceptor
    for (const file of apiFiles) {
      if (file.endsWith('.ts')) {
        const filePath = path.join(apiDir, file)
        let content = await fs.readFile(filePath, 'utf8')

        // Replace the default axios import with our custom apiClient
        content = content.replace(
          /import.*axios.*from.*['"]axios['"];?/g,
          `import apiClient from '../../../@core/axios/axiosEmentor';`
        )

        // Replace axios usage with apiClient
        content = content.replace(/axios\(/g, 'apiClient(')
        content = content.replace(/= axios;/g, '= apiClient;')

        await fs.writeFile(filePath, content)
      }
    }
  }

  // Create a service-specific index file
  const indexPath = path.join(service.outputDir, 'index.ts')

  const indexContent = `// Auto-generated index file for ${service.name}
export * from './api';
export * from './model';
export * from './configuration';
export * from './base';
`

  await fs.writeFile(indexPath, indexContent)
}

// Run the generation
generateSingleApi().catch(console.error)
