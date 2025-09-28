#!/usr/bin/env tsx

/**
 * Test semplificato per verificare che tutto funzioni
 */

import 'dotenv/config';
import { loadConfig } from './src/config.js';
import { RizeApiService } from './src/services/rize-api.js';

async function testSimple() {
  const config = loadConfig();
  const api = new RizeApiService(config.apiKey);

  console.log('🧪 Test Semplificato RizeApiService\n');

  try {
    // Test metodi base
    console.log('👤 Testing getCurrentUser...');
    const user = await api.getCurrentUser();
    console.log('✅ getCurrentUser:', user.email);

    console.log('📁 Testing getProjects...');
    const projects = await api.getProjects(3);
    console.log('✅ getProjects:', projects.projects.length, 'progetti');

    console.log('📊 Testing getSummaries...');
    const summaries = await api.getSummaries('2025-09-22', '2025-09-22');
    console.log('✅ getSummaries:', summaries.length, 'giorni di dati');

    console.log('🎯 Testing getFocusSessions...');
    const sessions = await api.getFocusSessions('2025-09-10');
    console.log('✅ getFocusSessions:', sessions.length, 'sessioni');

    console.log('📈 Testing getAnalytics...');
    const analytics = await api.getAnalytics('week');
    console.log('✅ getAnalytics:', analytics.timeframe, 'con', analytics.metricsCount, 'giorni');

    console.log('\n🎉 Tutti i test completati con successo!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimple().catch(console.error);
