/**
 * API Configuration
 * This file contains configuration settings for the SNOMED CT API
 */

// Frontend API configuration
// Always use the full Snowstorm URL for GitHub Pages compatibility
export const API_BASE = "https://sct-endo-demo.rath.asia/snowstorm";

// SNOMED CT configuration
// Branch to use for SNOMED CT API calls
export const BRANCH = "MAIN";

// Server configuration
// Set to true to use the real Snowstorm server, false to use local development server
export const USE_REAL_SERVER = true;

// Backend API configuration
// Base URL for the backend Snowstorm API server
export const SNOWSTORM_API_BASE = USE_REAL_SERVER
  ? "https://sct-endo-demo.rath.asia/snowstorm"
  : "http://localhost:8080";

// Browser path - just the endpoint name
export const BROWSER_PATH = "/browser";

// SNOMED CT version configuration
export const VERSION = "2025-04-01";

// Other API configuration can be added here as needed
// For example, API version, timeout settings, etc.
