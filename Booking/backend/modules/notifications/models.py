from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class NotificationType(str, Enum):
    """Notification type enumeration."""
    BOOKING_CONFIRMATION = "BOOKING_CONFIRMATION"
    BOOKING_STATUS_UPDATE = "BOOKING_STATUS_UPDATE"
    BOOKING_REMINDER = "BOOKING_REMINDER"
    CANCELLATION = "CANCELLATION"
    OWNER_NEW_BOOKING = "OWNER_NEW_BOOKING"
    PASSWORD_RESET = "PASSWORD_RESET"


class EmailConfig(BaseModel):
    """Email configuration model."""
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    from_email: EmailStr


class NotificationPreferences(BaseModel):
    """User notification preferences model."""
    user_id: str
    receive_booking_confirmations: bool = True
    receive_booking_updates: bool = True
    receive_booking_reminders: bool = True
    receive_cancellations: bool = True
    receive_owner_notifications: bool = True
    email_digest: bool = False  # Daily digest vs immediate
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class EmailNotification(BaseModel):
    """Email notification model for queue/log."""
    id: Optional[str] = None
    notification_type: NotificationType
    recipient_email: EmailStr
    subject: str
    html_body: str
    text_body: str
    sent: bool = False
    sent_at: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[str] = None
