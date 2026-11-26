const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const tokenMatch = envFile.match(/WHATSAPP_API_TOKEN="([^"]+)"/);
const phoneIdMatch = envFile.match(/WHATSAPP_PHONE_NUMBER_ID="([^"]+)"/);

const token = tokenMatch ? tokenMatch[1] : '';
const phoneId = phoneIdMatch ? phoneIdMatch[1] : '';

const targetPhone = process.argv[2] || '919023978348';

const payload = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: targetPhone,
  type: 'interactive',
  interactive: {
    type: 'list',
    header: {
      type: 'text',
      text: 'Varni Holidays Desk'
    },
    body: {
      text: '🌴 *Welcome to Varni Holidays!*\n\nTap the button below to browse all services and packages directly — no typing needed:'
    },
    footer: {
      text: 'Varni Holidays • Anand'
    },
    action: {
      button: 'Browse Services 🧭',
      sections: [
        {
          title: '🏖️ Holiday Packages',
          rows: [
            {
              id: 'menu_package',
              title: 'Kerala Tour Packages',
              description: '6N/7D Grand & 5N/6D Classic Tours'
            },
            {
              id: 'pkg_rajasthan',
              title: 'Rajasthan Royal Tour',
              description: '5N/6D Forts, Palaces & Desert Stays'
            },
            {
              id: 'pkg_kashmir',
              title: 'Kashmir Paradise Tour',
              description: 'Srinagar, Gulmarg & Pahalgam Escapes'
            }
          ]
        },
        {
          title: '🚆 Transit & Assistance',
          rows: [
            {
              id: 'menu_flight',
              title: 'Flight Booking Desk',
              description: 'Domestic & International lowest fares'
            },
            {
              id: 'menu_visa',
              title: 'Visa Assistance Desk',
              description: 'Tourist, Business & NRI Visas'
            },
            {
              id: 'menu_status',
              title: 'Track Status / PNR',
              description: 'Check your booking or quote status'
            },
            {
              id: 'menu_agent',
              title: 'Talk to Travel Expert',
              description: 'Direct call & Anand office support'
            }
          ]
        }
      ]
    }
  }
};

fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
  .then(r => r.json())
  .then(d => {
    console.log('Interactive List Result:', JSON.stringify(d, null, 2));
  })
  .catch(err => console.error('Dispatch Error:', err));
