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
      content: `🎉 Welcome to the Oh Sew Sheek Academy! 🧵✨\n\nWe're so excited to have you here! This academy was created especially for beginners who want to learn sewing step by step in a supportive and fun community. Whether you're brand new or just building confidence, you're in the right place.\n\n📱 Check the app daily!\nParticipation is part of the experience. When you engage, comment, and participate in activities, you earn points.\n\n🏆 Leaderboards & Challenges\nEach week we'll have leaderboards and fun challenges so you can level up your skills and stay motivated. And yes… there will be prizes! 🎁\n\n🎥 Live Classes\nWe host live classes twice a month. You'll find them under the "Live Classes" tab inside the academy.\n\n📋 Supply Lists\nEach course will include a supply list so you know exactly what you need before getting started.\n\n🔓 Level Unlock System\nSome courses are level-locked, which means you'll unlock them as you earn points and progress through the academy. This helps you build your skills the right way without feeling overwhelmed.\n\n📧 Need Help?\nIf you ever have questions, please don't hesitate to reach out to our support team: inquiry@ohsewsheek.com\n\nWe're excited to see what you create.\nWelcome again — now let's get sewing! 🪡✨`,
      is_read: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});