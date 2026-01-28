// Quick test of Bankr SDK
require('dotenv').config();

async function test() {
  console.log('Loading @bankr/sdk...');
  
  const { BankrClient } = require('@bankr/sdk');
  
  const pk = process.env.TRADING_PRIVATE_KEY;
  const wallet = process.env.TRADING_WALLET || '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';
  
  console.log('Private key set:', !!pk, 'length:', pk?.length);
  console.log('Wallet:', wallet);
  
  if (!pk) {
    console.log('ERROR: No private key set');
    return;
  }
  
  console.log('Creating BankrClient...');
  const client = new BankrClient({
    privateKey: pk,
    walletAddress: wallet,
  });
  
  console.log('Client created. Testing simple prompt...');
  
  try {
    const result = await client.promptAndWait({
      prompt: 'What is the ETH balance of wallet ' + wallet + ' on Base?',
    });
    
    console.log('SUCCESS!');
    console.log('Status:', result.status);
    console.log('Response:', result.response?.substring(0, 200));
    console.log('Transactions:', result.transactions?.length || 0);
  } catch (err) {
    console.log('ERROR:', err.message);
    console.log('Stack:', err.stack);
  }
}

test();
