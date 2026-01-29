import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional


class EmailService:
    """Service for sending email notifications."""
    
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@bookingapp.com")
    
    @staticmethod
    async def send_email(
        to: str,
        subject: str,
        body: str,
        html: str
    ) -> bool:
        """
        Send email via SMTP.
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Plain text body
            html: HTML body
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = EmailService.FROM_EMAIL
            msg["To"] = to
            
            # Attach plain text and HTML
            msg.attach(MIMEText(body, "plain"))
            msg.attach(MIMEText(html, "html"))
            
            # Send email
            with smtplib.SMTP(EmailService.SMTP_HOST, EmailService.SMTP_PORT) as server:
                server.starttls()
                server.login(EmailService.SMTP_USERNAME, EmailService.SMTP_PASSWORD)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Failed to send email to {to}: {str(e)}")
            return False
    
    @staticmethod
    async def send_booking_confirmation(
        user_email: str,
        booking_ref: str,
        profile_name: str,
        booking_date: datetime
    ) -> bool:
        """
        Send booking confirmation email to customer.
        
        Args:
            user_email: Customer email
            booking_ref: Booking reference number
            profile_name: Business profile name
            booking_date: Booking date/time
            
        Returns:
            True if successful
        """
        from .templates import booking_confirmation_template
        
        subject = f"Booking Confirmed - Reference: {booking_ref}"
        html = booking_confirmation_template(booking_ref, profile_name, booking_date)
        body = f"Your booking has been confirmed.\nReference: {booking_ref}\nBusiness: {profile_name}\nDate: {booking_date.strftime('%B %d, %Y at %I:%M %p')}"
        
        return await EmailService.send_email(user_email, subject, body, html)
    
    @staticmethod
    async def send_booking_status_update(
        user_email: str,
        booking_ref: str,
        new_status: str,
        profile_name: str,
        reason: str = ""
    ) -> bool:
        """
        Send booking status update email to customer.
        
        Args:
            user_email: Customer email
            booking_ref: Booking reference number
            new_status: New status (CONFIRMED, REJECTED, etc.)
            profile_name: Business profile name
            reason: Optional reason for status change
            
        Returns:
            True if successful
        """
        from .templates import booking_status_template
        
        subject = f"Booking Status Update - Reference: {booking_ref}"
        html = booking_status_template(booking_ref, profile_name, new_status, reason)
        body = f"Your booking status has been updated to {new_status}.\nReference: {booking_ref}\nBusiness: {profile_name}"
        if reason:
            body += f"\nReason: {reason}"
        
        return await EmailService.send_email(user_email, subject, body, html)
    
    @staticmethod
    async def send_owner_new_booking(
        owner_email: str,
        booking_ref: str,
        customer_name: str,
        profile_name: str
    ) -> bool:
        """
        Send new booking notification to business owner.
        
        Args:
            owner_email: Owner email
            booking_ref: Booking reference number
            customer_name: Customer name
            profile_name: Business profile name
            
        Returns:
            True if successful
        """
        from .templates import owner_notification_template
        
        subject = f"New Booking - Reference: {booking_ref}"
        html = owner_notification_template(booking_ref, customer_name, profile_name)
        body = f"You have received a new booking.\nReference: {booking_ref}\nCustomer: {customer_name}\nBusiness: {profile_name}"
        
        return await EmailService.send_email(owner_email, subject, body, html)
    
    @staticmethod
    async def send_cancellation_notification(
        user_email: str,
        owner_email: str,
        booking_ref: str,
        profile_name: str
    ) -> bool:
        """
        Send cancellation notification to both customer and owner.
        
        Args:
            user_email: Customer email
            owner_email: Owner email
            booking_ref: Booking reference number
            profile_name: Business profile name
            
        Returns:
            True if both emails sent successfully
        """
        from .templates import cancellation_template
        
        subject = f"Booking Cancelled - Reference: {booking_ref}"
        html = cancellation_template(booking_ref, profile_name)
        body = f"Your booking has been cancelled.\nReference: {booking_ref}\nBusiness: {profile_name}"
        
        # Send to customer
        customer_sent = await EmailService.send_email(user_email, subject, body, html)
        
        # Send to owner
        owner_subject = f"Booking Cancelled by Customer - Reference: {booking_ref}"
        owner_body = f"A booking has been cancelled.\nReference: {booking_ref}\nBusiness: {profile_name}"
        owner_sent = await EmailService.send_email(owner_email, owner_subject, owner_body, html)
        
        return customer_sent and owner_sent

    @staticmethod
    async def send_owner_booking_rescheduled(
        owner_email: str,
        booking_ref: str,
        customer_name: str,
        profile_name: str,
        old_date: str,
        old_time: str,
        new_date: str,
        new_time: str
    ):
        """Send email to owner when customer reschedules a booking."""
        subject = f"Booking Rescheduled - {booking_ref}"
        
        html_content = f"""
        <h2>Booking Rescheduled</h2>
        <p>A customer has rescheduled their booking for <strong>{profile_name}</strong>.</p>
        
        <h3>Booking Details:</h3>
        <ul>
            <li><strong>Reference:</strong> {booking_ref}</li>
            <li><strong>Customer:</strong> {customer_name}</li>
            <li><strong>Original Date:</strong> {old_date} at {old_time}</li>
            <li><strong>New Date:</strong> {new_date} at {new_time}</li>
        </ul>
        
        <p>Please review the updated booking in your admin panel.</p>
        """
        
        await EmailService.send_email(owner_email, subject, html_content, html_content)

    @staticmethod
    async def send_customer_booking_rescheduled(
        customer_email: str,
        booking_ref: str,
        profile_name: str,
        old_date: str,
        old_time: str,
        new_date: str,
        new_time: str
    ):
        """Send email to customer when admin reschedules their booking."""
        subject = f"Your Booking Has Been Rescheduled - {booking_ref}"
        
        html_content = f"""
        <h2>Your Booking Has Been Rescheduled</h2>
        <p>The service provider has rescheduled your booking for <strong>{profile_name}</strong>.</p>
        
        <h3>Updated Booking Details:</h3>
        <ul>
            <li><strong>Reference:</strong> {booking_ref}</li>
            <li><strong>Original Date:</strong> {old_date} at {old_time}</li>
            <li><strong>New Date:</strong> {new_date} at {new_time}</li>
        </ul>
        
        <p>If you have any questions or concerns, please contact the service provider.</p>
        
        <p>Thank you for your understanding!</p>
        """
        
        await EmailService.send_email(customer_email, subject, html_content, html_content)
