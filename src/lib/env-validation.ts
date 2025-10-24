/**
 * Environment variable validation for production deployment
 * Ensures all required environment variables are present and valid
 */

import { logger } from './logger';

interface RequiredEnvVars {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;
}

interface OptionalEnvVars {
  PORT?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

type EnvVars = RequiredEnvVars & OptionalEnvVars;

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing or invalid
 */
export function validateEnvironment(): EnvVars {
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  const env: Partial<EnvVars> = {};

  // Validate required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    } else {
      env[varName] = value;
    }
  }

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production');
    }
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (!['mysql:', 'mysql2:'].includes(url.protocol)) {
        errors.push('DATABASE_URL must use mysql:// or mysql2:// protocol');
      }
    } catch (error) {
      errors.push('DATABASE_URL is not a valid URL format');
    }
  }

  // Validate NODE_ENV
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  // Validate optional variables
  const optionalVars: (keyof OptionalEnvVars)[] = [
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'NEXT_PUBLIC_APP_URL'
  ];

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      env[varName] = value;
    }
  }

  // Validate PORT if provided
  if (env.PORT && isNaN(Number(env.PORT))) {
    errors.push('PORT must be a valid number');
  }

  // Validate DB_PORT if provided
  if (env.DB_PORT && isNaN(Number(env.DB_PORT))) {
    errors.push('DB_PORT must be a valid number');
  }

  // If there are validation errors, log them and throw
  if (errors.length > 0) {
    logger.error('Environment validation failed', new Error('Invalid environment configuration'), {
      errors,
      nodeEnv: process.env.NODE_ENV
    });
    
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  // Log successful validation
  logger.info('Environment validation successful', {
    nodeEnv: env.NODE_ENV,
    hasDatabase: !!env.DATABASE_URL,
    hasJwtSecret: !!env.JWT_SECRET,
    port: env.PORT || '3000'
  });

  return env as EnvVars;
}

/**
 * Get validated environment variables
 * Caches the result after first validation
 */
let cachedEnv: EnvVars | null = null;

export function getValidatedEnv(): EnvVars {
  if (!cachedEnv) {
    cachedEnv = validateEnvironment();
  }
  return cachedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get the application URL
 */
export function getAppUrl(): string {
  const env = getValidatedEnv();
  
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback for development
  const port = env.PORT || '3000';
  return `http://localhost:${port}`;
}
