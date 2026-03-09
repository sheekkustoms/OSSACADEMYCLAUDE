import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_type, title, author_name } = await req.json();

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Create notification for each user (except the creator)
    const notificationPromises = allUsers.map(user => {
      if (user.email === author_name) return null; // Don't notify the creator
      
      let message = "";
      if (event_type === "post") {
        message = `New post: "${title}"`;
      } else if (event_type === "quiz") {
        message = `New quiz game: "${title}"`;
      } else if (event_type === "live_class") {
        message = `New live class: "${title}"`;
      }

      return base44.asServiceRole.entities.Notification.create({
        recipient_email: user.email,
        type: "announcement",
        message: message,
        from_name: author_name || "Admin"
      });
    });

    await Promise.all(notificationPromises.filter(Boolean));
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});