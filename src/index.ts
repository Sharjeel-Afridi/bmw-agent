/**
 * Main Entry Point
 * 
 * Simple execution flow to test the agent setup.
 * 
 * This file demonstrates:
 * 1. Loading environment variables
 * 2. Getting the orchestrator agent
 * 3. Sending a test message
 * 4. Displaying the response
 * 
 * Usage: npm run dev
 */

import 'dotenv/config';
import { mastra } from './mastra';
import { calendarStore } from './memory/calendar-store';

async function main() {
  console.log('🚀 Personal Productivity Agent Starting...\n');
  
  // Get the orchestrator agent
  const orchestrator = mastra.agents.orchestrator;
  
  // Test prompt - feel free to change this
  const userInput = "Schedule a 2-hour coding session after lunch tomorrow";
  
  console.log(`📝 User Input: "${userInput}"\n`);
  console.log('🤔 Agent thinking...\n');
  
  try {
    // Generate response using the agent
    const result = await orchestrator.generate(userInput);
    
    console.log('✅ Agent Response:');
    console.log('─'.repeat(50));
    console.log(result.text);
    console.log('─'.repeat(50));
    console.log();
    
    // Show tool calls if any
    if (result.toolCalls && result.toolCalls.length > 0) {
      console.log('🔧 Tools Used:');
      result.toolCalls.forEach((call, index) => {
        console.log(`  ${index + 1}. ${call.toolName}`);
        console.log(`     Input:`, JSON.stringify(call.args, null, 2));
      });
      console.log();
    }
    
    // Show tool results
    if (result.toolResults && result.toolResults.length > 0) {
      console.log('📊 Tool Results:');
      result.toolResults.forEach((toolResult, index) => {
        console.log(`  ${index + 1}. ${toolResult.toolName}`);
        console.log(`     Result:`, JSON.stringify(toolResult.result, null, 2));
      });
      console.log();
    }
    
    // Display all calendar events
    const allEvents = calendarStore.getAllEvents();
    if (allEvents.length > 0) {
      console.log('📅 All Calendar Events:');
      allEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title}`);
        console.log(`     Time: ${event.startTime} → ${event.endTime}`);
        console.log(`     ID: ${event.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        console.log('\n💡 Tip: Make sure to:');
        console.log('   1. Copy .env.example to .env');
        console.log('   2. Add your Gemini API key');
        console.log('   3. Get a key from: https://aistudio.google.com/apikey');
      }
    }
    
    process.exit(1);
  }
}

// Run the main function
main();
