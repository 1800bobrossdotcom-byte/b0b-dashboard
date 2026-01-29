// c0m inbox checker - extracts verification links
require('dotenv').config();
const { AgentMailClient } = require('agentmail');

async function checkInbox() {
  const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY });
  
  console.log('💀 c0m checking inbox for verification emails...\n');
  
  const result = await client.inboxes.messages.list('c0m@agentmail.to', { limit: 10 });
  
  if (!result.messages || result.messages.length === 0) {
    console.log('📭 No messages yet');
    return;
  }
  
  console.log(`📬 Found ${result.messages.length} message(s):\n`);
  
  for (const msg of result.messages) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('FROM:', msg.from);
    console.log('SUBJECT:', msg.subject);
    console.log('ID:', msg.id);
    
    // Get full message to find links
    try {
      const fullMsg = await client.inboxes.messages.get('c0m@agentmail.to', msg.id);
      const body = fullMsg.text || fullMsg.html || '';
      
      // Extract any verification/confirmation links
      const linkPatterns = [
        /https?:\/\/[^\s<>"]+confirm[^\s<>"]*/gi,
        /https?:\/\/[^\s<>"]+verify[^\s<>"]*/gi,
        /https?:\/\/[^\s<>"]+activate[^\s<>"]*/gi,
        /https?:\/\/[^\s<>"]+token=[^\s<>"]*/gi,
      ];
      
      let foundLinks = [];
      for (const pattern of linkPatterns) {
        const matches = body.match(pattern);
        if (matches) foundLinks.push(...matches);
      }
      
      if (foundLinks.length > 0) {
        console.log('\n🔗 VERIFICATION LINKS:');
        foundLinks.forEach(link => console.log('   ' + link));
      } else {
        // Show preview if no links found
        console.log('\nPREVIEW:', body.substring(0, 200).replace(/\n/g, ' ') + '...');
      }
    } catch (e) {
      console.log('Could not fetch full message:', e.message);
    }
    console.log('');
  }
}

checkInbox().catch(console.error);
