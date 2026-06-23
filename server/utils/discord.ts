export async function notifyDiscordWebhook(publication: any, authorName: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.');
    return;
  }

  const divisionColors: Record<string, number> = {
    'artifacts': 0x3498db, // Blue
    '3d': 0xe67e22,        // Orange
    'code': 0x2ecc71,      // Green
  };

  const color = divisionColors[publication.division] || 0x95a5a6; // Default Gray

  const embed = {
    title: `New Publication Submitted: ${publication.title}`,
    description: `A new ${publication.type.replace('_', ' ')} has been submitted for review!`,
    color: color,
    fields: [
      {
        name: 'Author',
        value: authorName,
        inline: true,
      },
      {
        name: 'Division',
        value: publication.division.charAt(0).toUpperCase() + publication.division.slice(1),
        inline: true,
      },
      {
        name: 'License',
        value: publication.license,
        inline: true,
      }
    ],
    footer: {
      text: `Open Rockets Press • ${new Date().toISOString().split('T')[0]}`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Open Rockets Press Bot',
        avatar_url: 'https://openrockets.com/logo.png', // Fallback URL
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send Discord webhook:', error);
  }
}
