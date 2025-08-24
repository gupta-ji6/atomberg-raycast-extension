# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raycast extension for controlling Atomberg smart appliances (primarily fans) through their IoT API. The extension allows users to view, manage, and control their Atomberg devices directly from Raycast.

## Development Commands

```bash
npm run dev          # Start development mode with hot reload
npm run build        # Build the extension for production
npm run lint         # Check code style and potential issues
npm run fix-lint     # Auto-fix linting issues
npm run publish      # Publish to Raycast Store
```

## Architecture Overview

### Core Structure
- **Two main commands**: `list-atomberg-devices` (device listing/control) and `manage-atomberg-credentials` (credential management)
- **Service-oriented architecture** with clear separation of concerns
- **Custom React hooks** for state management and API interaction
- **Centralized configuration** through constants and types

### Key Components

**API Service Layer (`src/services/atomberg-api.ts`)**
- `AtombergApiService` class handles all Atomberg API interactions
- Manages JWT token lifecycle (24-hour expiry with 5-minute refresh buffer)
- Implements proper authentication flow using API key + refresh token → access token
- Handles device listing, control commands, and error management

**State Management (`src/hooks/useAtombergDevices.ts`)**
- Custom hook that encapsulates device state and API operations
- Uses `useMemo` to prevent infinite re-rendering of API service
- Manages loading states and device refresh logic

**UI Components (`src/components/`)**
- `DeviceItem`: Individual device list item with control actions
- `EmptyStates`: Reusable empty state views for different scenarios

**Utility Layer (`src/utils/device-utils.ts`)**
- Pure functions for data transformation (grouping devices by room)
- Credential validation utilities

### Authentication Flow

1. User configures API key and refresh token in Raycast preferences
2. Extension uses refresh token to obtain 24-hour access token from `/get_access_token`
3. Access token is cached in LocalStorage with expiry tracking
4. All API calls use access token + API key headers
5. Tokens auto-refresh when needed (5-minute buffer before expiry)

### API Integration

**Base URL**: `https://api.developer.atomberg-iot.com/v1`

**Key Endpoints**:
- `GET /get_access_token` - Authentication (requires refresh token + API key)
- `GET /get_list_of_devices` - Device listing
- `POST /devices/{id}/command` - Device control

**Response Patterns**:
All API responses follow `{ status: "Success", message: {...} }` structure.

### Data Flow

1. **Device Listing**: `useAtombergDevices` → `AtombergApiService.fetchDevices()` → UI components
2. **Device Control**: UI action → `AtombergApiService.controlDevice()` → API call
3. **Room Grouping**: Raw devices → `groupDevicesByRoom()` → `List.Section` components

### Configuration Management

- **Constants** (`src/constants.ts`): API URLs, endpoints, storage keys
- **Types** (`src/types.ts`): TypeScript interfaces for API responses and app state
- **Preferences**: Secure storage of API credentials via Raycast's password-type preferences

### Common Patterns

**Error Handling**: Centralized in service layer with Toast notifications
**Loading States**: Managed through custom hook with proper state transitions  
**Component Structure**: Functional components with proper prop interfaces
**Memory Management**: Careful use of `useMemo` and `useCallback` to prevent unnecessary re-renders

## Important Notes

- API credentials are stored securely using Raycast's preference system (password type)
- Access tokens are cached locally but never committed to version control
- All API calls require both API key (header) and access token (Bearer auth)
- Device rooms are used for UI organization with alphabetical sorting
- Extension supports light/dark theme through proper icon assets