#!/usr/bin/env tsx

/**
 * Script di test rapido per RizeApiService
 * Permette di testare l'API senza dover buildare e avviare il server MCP completo
 */

import 'dotenv/config';
import { loadConfig } from './src/config.js';

const config = loadConfig();

import { RizeApiService } from './src/services/rize-api.js';

class RizeApiTester {
  private api: RizeApiService;

  constructor() {
    // Usa API key di test (anche se non valida, ci permetterà di testare la struttura)
    this.api = new RizeApiService(config.apiKey);
  }

  async testAllMethods() {
    console.log('🚀 Iniziando test completo RizeApiService...\n');

    try {
      await this.testCurrentUser();
      await this.testProjects();
      await this.testSummaries();
      // await this.testFocusSessions();
      // await this.testAnalytics();

      console.log('\n✅ Test completati! Controlla i log per i dettagli delle response API.');
    } catch (error) {
      console.error('❌ Errore durante i test:', error);
    }
  }

  async testCurrentUser() {
    console.log('👤 Testing getCurrentUser...');
    try {
      const user = await this.api.getCurrentUser();
      console.log('✅ getCurrentUser success:', { email: user.email, name: user.name });
    } catch (error) {
      console.log('❌ getCurrentUser failed (expected with invalid API key):', error.message);
    }
    console.log('');
  }

  async testProjects() {
    console.log('📁 Testing getProjects...');
    try {
      const result = await this.api.getProjects(5);
      console.log('✅ getProjects success:', {
        count: result.projects.length,
        hasNextPage: result.hasNextPage,
        sampleProjects: result.projects.slice(0, 2).map(p => ({ id: p.id, name: p.name }))
      });
    } catch (error) {
      console.log('❌ getProjects failed (expected with invalid API key):', error.message);
    }
    console.log('');
  }

  async testSummaries() {
    console.log('📊 Testing getSummaries...');
    try {
      const summaries = await this.api.getSummaries('2025-09-01', '2025-09-28');
      console.log('✅ getSummaries success:', {
        count: summaries.length,
        sample: summaries.slice(0, 5).map(m => ({
          date: m.date,
          focusTime: m.totalFocusTime,
          score: m.productivityScore,
          topCategory: m.topCategory.name + ' - ' + m.topCategory.timeSpent + 'm',
          breakTime: m.breakTime,
          distractionTime: m.distractionTime,
          contextSwitches: m.contextSwitches
        }))
      });
    } catch (error) {
      console.log('❌ getSummaries failed (expected with invalid API key):', error.message);
    }
    console.log('');
  }

  async testFocusSessions() {
    console.log('🎯 Testing getFocusSessions...');
    try {
      const sessions = await this.api.getFocusSessions('2025-09-10');
      console.log('✅ getFocusSessions success:', {
        count: sessions.length,
        sample: sessions.slice(0, 2).map(s => ({
          id: s.id,
          title: s.title,
          duration: s.duration,
          category: s.category
        }))
      });
    } catch (error) {
      console.log('❌ getFocusSessions failed (expected with invalid API key):', error.message);
    }
    console.log('');
  }

  async testAnalytics() {
    console.log('📈 Testing getAnalytics...');
    try {
      const analytics = await this.api.getAnalytics('month');
      console.log('✅ getAnalytics success:', {
        timeframe: analytics.timeframe,
        metricsCount: analytics.metrics.length,
        trends: analytics.trends,
        sampleMetric: analytics.metrics[0] ? {
          date: analytics.metrics[0].date,
          focusTime: analytics.metrics[0].totalFocusTime,
          score: analytics.metrics[0].productivityScore
        } : null
      });
    } catch (error) {
      console.log('❌ getAnalytics failed (expected with invalid API key):', error.message);
    }
    console.log('');
  }

  async testCreateProject() {
    console.log('🆕 Testing createProject...');
    try {
      const project = await this.api.createProject('Test Project', 'Created during testing');
      console.log('✅ createProject success:', project);
    } catch (error) {
      console.log('❌ createProject failed (expected with invalid API key):', error.message);
    }
    console.log('');
  }
}

// Funzione principale
async function main() {
  const tester = new RizeApiTester();
  await tester.testAllMethods();
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RizeApiTester };
