import dotenv from 'dotenv';

// Deployment-injected variables win; support either Neon CLI env-file location.
dotenv.config({ path: ['.env.local', '.env'], quiet: true });
