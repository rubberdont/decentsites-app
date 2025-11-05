from datetime import datetime


def booking_confirmation_template(booking_ref: str, profile_name: str, booking_date: datetime) -> str:
    """
    HTML template for booking confirmation email.
    
    Args:
        booking_ref: Booking reference number
        profile_name: Business profile name
        booking_date: Booking date/time
        
    Returns:
        HTML email template
    """
    formatted_date = booking_date.strftime("%B %d, %Y at %I:%M %p")
    
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">✓ Your Booking is Confirmed!</h2>
                
                <p style="color: #666; margin: 15px 0;">Dear Customer,</p>
                
                <p style="color: #666; margin: 15px 0;">Thank you for booking with us. Your booking has been confirmed.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Booking Reference:</strong> <span style="color: #4CAF50; font-weight: bold;">{booking_ref}</span></p>
                    <p style="margin: 8px 0;"><strong>Business:</strong> {profile_name}</p>
                    <p style="margin: 8px 0;"><strong>Date & Time:</strong> {formatted_date}</p>
                </div>
                
                <p style="color: #666; margin: 15px 0;">Please save your booking reference for your records. You can use it to track your booking status or contact the business.</p>
                
                <p style="color: #666; margin: 15px 0;">If you have any questions, please don't hesitate to reach out.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px; margin: 10px 0;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </body>
    </html>
    """


def booking_status_template(booking_ref: str, profile_name: str, status: str, reason: str = "") -> str:
    """
    HTML template for booking status update email.
    
    Args:
        booking_ref: Booking reference number
        profile_name: Business profile name
        status: New status (CONFIRMED, REJECTED, etc.)
        reason: Optional reason for status change
        
    Returns:
        HTML email template
    """
    status_color = "#4CAF50" if status == "CONFIRMED" else "#FF5252"
    status_message = "Your booking has been confirmed!" if status == "CONFIRMED" else f"Your booking status has been updated to {status}"
    
    reason_html = f"<p style=\"color: #666; margin: 15px 0;\"><strong>Reason:</strong> {reason}</p>" if reason else ""
    
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Booking Status Update</h2>
                
                <p style="color: #666; margin: 15px 0;">Dear Customer,</p>
                
                <p style="color: #666; margin: 15px 0;">{status_message}</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid {status_color}; padding: 15px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Booking Reference:</strong> <span style="color: {status_color}; font-weight: bold;">{booking_ref}</span></p>
                    <p style="margin: 8px 0;"><strong>Business:</strong> {profile_name}</p>
                    <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: {status_color}; font-weight: bold;">{status}</span></p>
                </div>
                
                {reason_html}
                
                <p style="color: #666; margin: 15px 0;">If you have any questions, please don't hesitate to reach out to the business.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px; margin: 10px 0;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </body>
    </html>
    """


def owner_notification_template(booking_ref: str, customer_name: str, profile_name: str) -> str:
    """
    HTML template for new booking notification to owner.
    
    Args:
        booking_ref: Booking reference number
        customer_name: Customer name
        profile_name: Business profile name
        
    Returns:
        HTML email template
    """
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">📅 New Booking Received</h2>
                
                <p style="color: #666; margin: 15px 0;">Dear Business Owner,</p>
                
                <p style="color: #666; margin: 15px 0;">You have received a new booking! Please review and respond accordingly.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Booking Reference:</strong> <span style="color: #2196F3; font-weight: bold;">{booking_ref}</span></p>
                    <p style="margin: 8px 0;"><strong>Customer:</strong> {customer_name}</p>
                    <p style="margin: 8px 0;"><strong>Business:</strong> {profile_name}</p>
                </div>
                
                <p style="color: #666; margin: 15px 0;">Please log in to your dashboard to view full booking details and confirm or reject the booking.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px; margin: 10px 0;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </body>
    </html>
    """


def cancellation_template(booking_ref: str, profile_name: str) -> str:
    """
    HTML template for booking cancellation email.
    
    Args:
        booking_ref: Booking reference number
        profile_name: Business profile name
        
    Returns:
        HTML email template
    """
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Booking Cancelled</h2>
                
                <p style="color: #666; margin: 15px 0;">Your booking has been cancelled.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong>Booking Reference:</strong> <span style="color: #FF9800; font-weight: bold;">{booking_ref}</span></p>
                    <p style="margin: 8px 0;"><strong>Business:</strong> {profile_name}</p>
                    <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">CANCELLED</span></p>
                </div>
                
                <p style="color: #666; margin: 15px 0;">If you would like to make another booking or have questions, please visit our website.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px; margin: 10px 0;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </body>
    </html>
    """
