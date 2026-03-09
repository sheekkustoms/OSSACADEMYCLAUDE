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

    // Invite user - this sends the invite email automatically
    await base44.users.inviteUser(email, 'user');

    // Queue a welcome message — will be delivered when they first log in
    // We store it now so it's waiting in their inbox
    await base44.asServiceRole.entities.Message.create({
      sender_email: 'sheek24kustoms@gmail.com',
      sender_name: 'Coach Sheek',
      recipient_email: email,
      recipient_name: '',
      content: `🎉 Welcome to Sew Sheek Sewing Academy!\n\nI'm so excited to have you here! 🪡✨\n\nHere's how to get started:\n📚 Head to the Courses tab to begin your first lesson\n🏆 Earn XP and level up as you learn\n💬 Join the Community to connect with other students\n🎯 Try the Weekly Challenge to test your skills\n\nIf you ever have questions, just reply to this message — I'm here to help!\n\nHappy sewing! 🧵\n– Coach Sheek`,
      is_read: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});