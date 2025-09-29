const fs = require('fs-extra')
const path = require('path')
const { execSync } = require('child_process')

// Load configuration
const config = require('../api-config.json')

async function generateApis() {
  console.log('🚀 Starting API generation for all microservices...\n')

  // Ensure the generated directory exists
  const generatedDir = path.join(__dirname, '../src/generated')
  await fs.ensureDir(generatedDir)

  const generatedServices = []

  // Generate APIs for each service
  for (const service of config.services) {
    console.log(`📦 Generating API for ${service.name}...`)

    try {
      // Clean the output directory
      await fs.emptyDir(service.outputDir)

      // Generate the API using OpenAPI Generator
      const additionalProps = Object.entries(config.globalConfig.additionalProperties)
        .map(([key, value]) => `${key}=${value}`)
        .join(',')

      const command = `npx @openapitools/openapi-generator-cli generate -i "${service.swaggerUrl}" -g ${config.globalConfig.generator} -o "${service.outputDir}" --additional-properties=${additionalProps} --skip-validate-spec`

      console.log(`   Fetching from: ${service.swaggerUrl}`)
      execSync(command, { stdio: 'pipe' })

      // Post-process the generated files
      await postProcessGeneratedFiles(service)

      generatedServices.push(service)
      console.log(`✅ Successfully generated API for ${service.name}\n`)
    } catch (error) {
      console.error(`❌ Failed to generate API for ${service.name}:`, error.message)
      console.error('   Make sure the swagger URL is accessible and the service is running.')
      console.error(`   Try: curl "${service.swaggerUrl}"\n`)
    }
  }

  if (generatedServices.length > 0) {
    // Generate the main API client factory
    await generateApiClientFactory(generatedServices)

    // Generate TypeScript barrel exports
    await generateBarrelExports(generatedServices)

    console.log('📄 Generated files:')
    console.log('   - src/generated/api-client-factory.ts')
    console.log('   - src/generated/index.ts')
    generatedServices.forEach(service => {
      console.log(`   - ${service.outputDir}/`)
    })
  }

  console.log('\n🎉 API generation completed!')
  console.log('\nNext steps:')
  console.log('1. Review the generated files')
  console.log('2. Import and use: import { apiClient } from "@/generated";')
  console.log('3. Enjoy type-safe API calls! 🎯')
}

async function postProcessGeneratedFiles(service) {
  const apiDir = path.join(service.outputDir, 'api')
  const apiFilePath = path.join(service.outputDir, 'api.ts')
  const configPath = path.join(service.outputDir, 'configuration.ts')

  // Process api.ts file if it exists in the root
  if (await fs.pathExists(apiFilePath)) {
    let content = await fs.readFile(apiFilePath, 'utf8')

    // Replace the default axios import with our custom apiClient
    content = content.replace(
      /import.*globalAxios.*from.*['"]axios['"];?/g,
      `import apiClient from '../../@core/axios/axiosEmentor';`
    )

    // Replace globalAxios usage with apiClient
    content = content.replace(/globalAxios/g, 'apiClient')

    await fs.writeFile(apiFilePath, content)
  }

  // Check if old structure with api directory exists and process API files
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

        // Replace axios.create() calls to use our instance
        content = content.replace(/axios\.create\([^)]*\)/g, 'apiClient')

        // Replace standalone axios calls
        content = content.replace(/(?<!\.)\baxios\(/g, 'apiClient(')

        await fs.writeFile(filePath, content)
      }
    }
  }

  // Modify configuration.ts to use our axios instance
  if (await fs.pathExists(configPath)) {
    let configContent = await fs.readFile(configPath, 'utf8')

    // Add our axios import
    if (!configContent.includes('axiosEmentor')) {
      configContent = `import apiClient from '../../@core/axios/axiosEmentor';\n${configContent}`

      // Replace axios parameter in Configuration class
      configContent = configContent.replace(/axios\?\s*:\s*AxiosInstance/g, 'axios?: AxiosInstance = apiClient')
    }

    await fs.writeFile(configPath, configContent)
  }

  // Create a service-specific index file
  await createServiceIndex(service)
}

async function createServiceIndex(service) {
  const indexPath = path.join(service.outputDir, 'index.ts')

  // Check which files exist to determine what to export
  const apiExists = await fs.pathExists(path.join(service.outputDir, 'api.ts'))
  const modelExists = await fs.pathExists(path.join(service.outputDir, 'model.ts'))
  const configExists = await fs.pathExists(path.join(service.outputDir, 'configuration.ts'))
  const baseExists = await fs.pathExists(path.join(service.outputDir, 'base.ts'))

  let exports = []
  if (apiExists) exports.push("export * from './api';")
  if (modelExists) exports.push("export * from './model';")
  if (configExists) exports.push("export * from './configuration';")
  if (baseExists) exports.push("export * from './base';")

  const indexContent = `// Auto-generated index file for ${service.name}
// Generated on: ${new Date().toISOString()}

${exports.join('\n')}

// Service configuration
export const ${toCamelCase(service.name)}Config = {
  name: '${service.name}',
  baseUrl: '${service.baseUrl}',
  swaggerUrl: '${service.swaggerUrl}'
};
`

  await fs.writeFile(indexPath, indexContent)
}

async function generateApiClientFactory(services) {
  const factoryPath = path.join(__dirname, '../src/generated/api-client-factory.ts')

  const imports = services
    .map(service => `import * as ${toCamelCase(service.name)} from './${service.name}';`)
    .join('\n')

  const clients = services
    .map(service => {
      const camelName = toCamelCase(service.name)

      return `  ${camelName}: {
    config: ${camelName}.${camelName}Config,
    // APIs will be available here after generation
    // Example: userApi: new ${camelName}.UserApi(configuration),
  },`
    })
    .join('\n')

  const factoryContent = `// Auto-generated API client factory
// Generated on: ${new Date().toISOString()}
// This file provides centralized access to all microservice APIs

import { Configuration } from './user-service/configuration';
${imports}

// Create base configuration
const createConfiguration = (basePath: string) => new Configuration({
  basePath: (process.env.NEXT_PUBLIC_PROD_HOST || '') + basePath,
});

// Service configurations
export const serviceConfigs = {
${services.map(service => `  ${toCamelCase(service.name)}: createConfiguration('${service.baseUrl}'),`).join('\n')}
};

// Main API client with all services
export const apiClient = {
${clients}
};

// Individual service exports for direct access
${services.map(service => `export { ${toCamelCase(service.name)} };`).join('\n')}

// Default export
export default apiClient;

// Type-safe service access helpers
export type ServiceName = ${services.map(s => `'${s.name}'`).join(' | ')};

export function getServiceConfig(serviceName: ServiceName): Configuration {
  const configKey = serviceName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  return serviceConfigs[configKey as keyof typeof serviceConfigs];
}
`

  await fs.writeFile(factoryPath, factoryContent)
}

async function generateBarrelExports(services) {
  const indexPath = path.join(__dirname, '../src/generated/index.ts')

  const indexContent = `// Auto-generated barrel exports for all generated APIs
// Generated on: ${new Date().toISOString()}

export * from './api-client-factory';
${services.map(service => `export * as ${toCamelCase(service.name)} from './${service.name}';`).join('\n')}

// Default export is the main API client
export { default } from './api-client-factory';
`

  await fs.writeFile(indexPath, indexContent)
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

// Handle script execution
if (require.main === module) {
  generateApis().catch(error => {
    console.error('💥 Generation failed:', error)
    process.exit(1)
  })
}

module.exports = { generateApis }
