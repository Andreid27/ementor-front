# API Generation Setup for Multiple Microservices

This setup allows you to automatically generate TypeScript API clients from Swagger/OpenAPI documentation for multiple microservices while integrating with your existing axios interceptor.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install --save-dev @openapitools/openapi-generator-cli fs-extra
```

### 2. Configure Your Services

Edit `api-config.json` to match your microservices:

```json
{
  "services": [
    {
      "name": "user-service",
      "swaggerUrl": "http://localhost:8081/v3/api-docs",
      "outputDir": "src/generated/user-service",
      "baseUrl": "/service1/user"
    }
  ]
}
```

### 3. Generate APIs

#### Generate all APIs at once:

```bash
npm run generate:apis
```

#### Generate a single service API:

```bash
npm run generate:api user-service http://localhost:8081/v3/api-docs
```

```bash
node scripts/generate-single-api.js profile-service-client http://localhost:49202/e-docs
```

## Usage

### Basic Usage

```typescript
import { apiClientFactory } from '@/generated/api-client-factory'

// Using the factory (after generation)
const users = await apiClientFactory.userService.getUsers()
const profile = await apiClientFactory.profileService.getProfile(userId)
```

### Advanced Usage

```typescript
import { UserApi } from '@/generated/user-service'
import { configs } from '@/generated/api-client-factory'

// Create a custom client instance
const userApi = new UserApi(configs.userService)
const result = await userApi.getUsers()
```

### Direct API Calls (current approach)

Your existing axios interceptor will still work for direct API calls:

```typescript
import apiClient from '@/@core/axios/axiosEmentor'

const response = await apiClient.get('/service1/user/users')
```

## Features

✅ **Automatic Token Management**: Integrates with your existing token interceptor  
✅ **Type Safety**: Full TypeScript support with generated interfaces  
✅ **Multiple Services**: Support for multiple microservices  
✅ **Custom Axios Instance**: Uses your existing axios configuration  
✅ **Easy Regeneration**: Simple commands to update APIs when services change  
✅ **Flexible Configuration**: Easy to add/remove services

## File Structure

```
src/
├── generated/
│   ├── api-client-factory.ts    # Main factory for all services
│   ├── user-service/            # Generated user service APIs
│   ├── profile-service/         # Generated profile service APIs
│   └── ...                      # Other services
├── @core/
│   └── axios/
│       └── axiosEmentor.js      # Your existing interceptor
└── ...
```

## Troubleshooting

### Service Not Accessible

Make sure your microservice is running and the Swagger URL is accessible:

```bash
curl http://localhost:8081/v3/api-docs
```

### TypeScript Errors

After generation, you may need to update the factory file imports. The generation script will guide you through this.

### Custom Configuration

You can modify the generation process by editing:

- `api-config.json` - Service configurations
- `scripts/generate-apis.js` - Generation logic
- `scripts/generate-single-api.js` - Single service generation

## Next Steps

1. Run `npm run generate:apis` to generate your first set of APIs
2. Update the imports in `api-client-factory.ts` based on generated files
3. Start using type-safe API calls in your components
4. Set up automated regeneration in your CI/CD pipeline
