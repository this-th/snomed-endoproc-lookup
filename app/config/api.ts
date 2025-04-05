/**
 * API Configuration
 * This file contains configuration settings for the SNOMED CT API
 */

// Frontend API configuration
// For GitHub Pages deployment, we need to use the full URL
// For local development, we can use either relative path or direct URL
export const API_BASE = process.env.NODE_ENV === 'production' 
  ? "https://snowstorm.snomedtools.org/snowstorm/snomed-ct" 
  : "https://snowstorm.snomedtools.org/snowstorm/snomed-ct";

// SNOMED CT configuration
// Branch to use for SNOMED CT API calls
export const BRANCH = "MAIN";

// Server configuration
// Set to true to use the real Snowstorm server, false to use local development server
export const USE_REAL_SERVER = true;

// Backend API configuration
// Base URL for the backend Snowstorm API server
export const SNOWSTORM_API_BASE = USE_REAL_SERVER 
  ? "https://snowstorm.snomedtools.org/snowstorm/snomed-ct" 
  : "http://localhost:8080";

// Browser path - just the endpoint name
export const BROWSER_PATH = "/browser";

// SNOMED CT version configuration
export const VERSION = "2025-04-01";

// Other API configuration can be added here as needed
// For example, API version, timeout settings, etc. 