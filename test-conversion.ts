#!/usr/bin/env tsx

/**
 * Test rapido per verificare la conversione da secondi a minuti
 */

import 'dotenv/config';
import { loadConfig } from './src/config.js';
import { RizeApiService } from './src/services/rize-api.js';

async function testConversion() {
  const config = loadConfig();
  const api = new RizeApiService(config.apiKey);

  console.log('🧪 Test Conversione Secondi → Minuti\n');

  try {
    // Test getFocusMetrics
    console.log('📊 Testing getFocusMetrics conversion...');
    const metrics = await api.getFocusMetrics('2025-09-22', '2025-09-22');

    if (metrics.length > 0) {
      const firstMetric = metrics[0];
      console.log('✅ Conversione funziona:');
      console.log(`   Raw API: focusTime=6337s, breakTime=0s`);
      console.log(`   Converted: focusTime=${firstMetric.totalFocusTime}m, breakTime=${firstMetric.breakTime}m`);
      console.log(`   Productivity Score: ${firstMetric.productivityScore}%`);
    } else {
      console.log('⚠️  No metrics returned (expected for date without data)');
    }

    // Test getAnalytics
    console.log('\n📈 Testing getAnalytics conversion...');
    const analytics = await api.getAnalytics('day');

    console.log('✅ Analytics structure:');
    console.log(`   Timeframe: ${analytics.timeframe}`);
    console.log(`   Metrics count: ${analytics.metricsCount}`);
    console.log(`   Total focus time: ${analytics.trends.focusTime}m`);
    console.log(`   Average productivity: ${analytics.trends.productivityScore}%`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConversion().catch(console.error);
