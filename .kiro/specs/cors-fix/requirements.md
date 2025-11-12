# Requirements Document

## Introduction

This feature addresses the CORS (Cross-Origin Resource Sharing) errors that prevent the SillyTavern plugin from fetching model lists from API endpoints. The plugin currently fails when trying to access `https://520mz.zeabur.app/v1/models` due to missing CORS headers, and the fallback proxy mechanism returns 404 errors.

## Glossary

- **Plugin**: The SillyTavern browser extension that provides AI chat functionality
- **API Server**: The remote server at `https://520mz.zeabur.app` that provides AI model access
- **CORS**: Cross-Origin Resource Sharing, a browser security mechanism
- **Cloudflare Worker**: A serverless function running on Cloudflare's edge network
- **Proxy Endpoint**: An intermediary server that forwards requests to bypass CORS restrictions

## Requirements

### Requirement 1

**User Story:** As a plugin user, I want to fetch available AI models from my API endpoint, so that I can select which model to use for chat

#### Acceptance Criteria

1. WHEN THE Plugin attempts to fetch models from an API endpoint, THE Plugin SHALL successfully retrieve the model list without CORS errors
2. WHEN THE API Server does not support CORS, THE Plugin SHALL use a proxy mechanism to bypass CORS restrictions
3. IF THE direct API request fails due to CORS, THEN THE Plugin SHALL automatically fallback to the proxy endpoint
4. THE Plugin SHALL display clear error messages when both direct and proxy requests fail

### Requirement 2

**User Story:** As a plugin developer, I want to deploy a CORS proxy using the existing Cloudflare Worker, so that users can access any API endpoint without CORS issues

#### Acceptance Criteria

1. THE Cloudflare Worker SHALL accept proxy requests at the `/proxy` endpoint
2. WHEN THE Cloudflare Worker receives a proxy request, THE Cloudflare Worker SHALL forward the request to the target API with appropriate CORS headers
3. THE Cloudflare Worker SHALL return responses with `Access-Control-Allow-Origin: *` header
4. THE Cloudflare Worker SHALL handle OPTIONS preflight requests correctly
5. THE Cloudflare Worker SHALL preserve all request headers including Authorization tokens

### Requirement 3

**User Story:** As a plugin user, I want the plugin to automatically detect and use the best available method to fetch models, so that I don't need to manually configure proxy settings

#### Acceptance Criteria

1. THE Plugin SHALL first attempt direct API requests
2. IF THE direct request fails with a CORS error, THEN THE Plugin SHALL automatically retry using the Cloudflare Worker proxy
3. THE Plugin SHALL log which method succeeded for debugging purposes
4. THE Plugin SHALL cache the successful method to optimize future requests

### Requirement 4

**User Story:** As a plugin developer, I want to update the plugin configuration UI to allow users to specify a custom proxy URL, so that users can use their own proxy if needed

#### Acceptance Criteria

1. THE Settings UI SHALL include an optional "CORS Proxy URL" input field
2. WHERE THE user provides a custom proxy URL, THE Plugin SHALL use that proxy instead of the default Cloudflare Worker
3. THE Settings UI SHALL validate that the proxy URL is a valid HTTPS URL
4. THE Settings UI SHALL display a help tooltip explaining when to use a custom proxy
