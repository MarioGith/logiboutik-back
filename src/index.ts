import { config } from './config';
import { connectDatabase } from './database';
import { createApp } from './app';

async function main() {
  await connectDatabase(config.mongoUrl);
  createApp(config.corsOrigins).listen(config.port, () => {
    console.log(`Logiboutik API listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error('Logiboutik API failed to start:', err);
  process.exit(1);
});
