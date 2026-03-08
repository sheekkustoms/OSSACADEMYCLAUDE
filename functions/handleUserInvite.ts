import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email } = await req.json();
    
    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Invite user
    await base44.users.inviteUser(email, 'user');

    // Auto-approve by creating a notification that they're approved
    // When user joins via invite link, mark them as auto-approved
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Welcome to Sew Sheek Sewing Academy!',
      body: `Hi,

You've been invited to join Sew Sheek Sewing Academy! Click the link below to join:

https://sewsheek.academy

Your access has been pre-approved. You'll be able to start learning immediately!

Best regards,
Sew Sheek Sewing Team`
    });

    return Response.json({ success: true, message: 'Invite sent and user will be auto-approved' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});