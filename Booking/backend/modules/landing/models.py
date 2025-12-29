from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union
from datetime import datetime


class CTAButtonConfig(BaseModel):
    """CTA Button customization - link is always /book, enforced by frontend."""
    text: str = Field(default="Book Now", min_length=2, max_length=30)
    style: Literal["solid", "outline", "gradient"] = "solid"
    size: Literal["default", "large"] = "default"


class HeroSection(BaseModel):
    """Hero banner section configuration."""
    title: str = Field(default="Crafting Style, One Cut at a Time.", max_length=100)
    subtitle: str = Field(default="The Premier Grooming Experience for the Modern Gentleman.", max_length=200)
    background_image_url: str = Field(default="https://lh3.googleusercontent.com/aida-public/AB6AXuBB-1Y0s_lXFpiS9ml5idUXFUVfIBMGuVoEN3qLipabNdvj2DdwWbZxPnecBGrRRbT94R6Yx-WjqHFk4NN0szH6tuQP5wg44gdMPxtV9xYsLa6F2ULt3J8W2amTBNJHYFv3is8deauXZENKHlUDUXvDQfk7215oHCJKzxqxu6kPcT7ELvWJsKfBhsIFlfRIjdgs0e0DXGMwaozYPQg1YiL9LwlLQaCgig_NlljEmxfWO4DfCA55RKKbM3PQ-QQy1YQX0kfnpfLecm8")
    cta_button: CTAButtonConfig = Field(default_factory=CTAButtonConfig)
    
    # New Customization Fields
    height: Literal["small", "medium", "large", "full"] = "medium"
    image_fit: Literal["cover", "contain"] = "cover"
    text_alignment: Literal["left", "center", "right"] = "center"
    font_family: Literal["inter", "playfair", "roboto", "lora"] = "inter"
    title_font_size: Literal["small", "medium", "large", "xl"] = "large"
    subtitle_font_size: Literal["small", "medium", "large"] = "medium"


class PortfolioItem(BaseModel):
    """Single portfolio gallery item."""
    id: str
    image_url: str
    title: str = Field(max_length=50)
    alt_text: str = Field(max_length=100)


class SocialStat(BaseModel):
    """Social proof statistic."""
    id: str
    value: str = Field(max_length=20)  # e.g., "15.2K", "4.9/5"
    label: str = Field(max_length=30)  # e.g., "Followers", "Reviews"
    platform: Literal["instagram", "facebook", "google", "twitter", "youtube", "custom"] = "custom"


class Testimonial(BaseModel):
    """Customer testimonial."""
    id: str
    quote: str = Field(max_length=300)
    name: str = Field(max_length=50)
    title: str = Field(max_length=50)  # e.g., "Regular Client"


class SocialLinks(BaseModel):
    """Social media profile links."""
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None


class FooterConfig(BaseModel):
    """Footer section configuration."""
    business_name: str = Field(default="The Modern Gentleman", max_length=100)
    address: str = Field(default="123 Style Street, Suite 100\nMetropolis, ST 12345", max_length=200)
    phone: str = Field(default="(123) 456-7890", max_length=20)
    hours: List[str] = Field(default=["Mon - Fri: 9am - 7pm", "Saturday: 10am - 5pm", "Sunday: Closed"])
    social_links: SocialLinks = Field(default_factory=SocialLinks)


class FinalCTASection(BaseModel):
    """Final call-to-action section - CANNOT be hidden."""
    title: str = Field(default="Ready for a Transformation?", max_length=100)
    subtitle: str = Field(default="Book your appointment today and experience the difference.", max_length=200)
    cta_button: CTAButtonConfig = Field(default_factory=CTAButtonConfig)
    background_style: Literal["default", "accent", "gradient"] = "default"


class SectionConfig(BaseModel):
    """Generic section title/subtitle configuration."""
    title: str = Field(max_length=100)
    subtitle: str = Field(max_length=200)
    enabled: bool = True  # New field to toggle section visibility


class BrandingConfig(BaseModel):
    """Brand colors and logo."""
    primary_color: str = Field(default="#d4af37", pattern=r"^#[0-9A-Fa-f]{6}$")
    dark_bg_color: str = Field(default="#1a1a1a", pattern=r"^#[0-9A-Fa-f]{6}$")
    light_bg_color: str = Field(default="#f5f5f5", pattern=r"^#[0-9A-Fa-f]{6}$")
    logo_url: Optional[str] = None


# --- Custom Content Blocks ---

class BaseBlock(BaseModel):
    id: str
    type: str
    enabled: bool = True

class ImageTextBlock(BaseBlock):
    type: Literal["image_text"] = "image_text"
    layout: Literal["left", "right"] = "left"  # Image position
    title: str
    content: str
    image_url: str

class TextBlock(BaseBlock):
    type: Literal["text"] = "text"
    title: Optional[str] = None
    content: str
    alignment: Literal["left", "center", "right"] = "left"

class GalleryBlock(BaseBlock):
    type: Literal["gallery"] = "gallery"
    title: Optional[str] = None
    layout: Literal["grid", "masonry", "carousel"] = "grid"
    images: List[str]  # List of image URLs

class FrameBlock(BaseBlock):
    type: Literal["frame"] = "frame"
    url: str
    height: int = 400

# Union type for polymorphic list
ContentBlock = Union[ImageTextBlock, TextBlock, GalleryBlock, FrameBlock]


# Default data for first-time setup
DEFAULT_PORTFOLIO_ITEMS = [
    {"id": "1", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDyKH2-WfbBJ0sxbbd8PXPxPqlet1MD6UMlkD5riQniZ5PbpSM4VUbzYb_72whGn8c1odW6lgEomDW2lShkrUMFqqqVAzpPFyKtZsTVLC-YR5uFAxMIbTsQyldCQuwWAycAA7F1-2bww7gOICrAhe_f6_kwvBM02bOzsRQUmCUwWpUMbcPW8vG1OSRdPXOoMFgydeA1yirhcatWrK8H9wA350jDCkHSC0oj2FoyjhDCFS-nLLOSy-dm_42ZiAElRCFFPGTBPT-PD8A", "title": "Classic Fade", "alt_text": "Man with a classic fade haircut"},
    {"id": "2", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBnFLdT-RhjJ4pv7IzCsMc7G2-gj6zqDdy_8k73wJLi1Y9M0vzWVzSRiIxTDu4dhK79hZe_rphp7Qnn8ERcEch3_0XCuOZQ664tBIYG8O_ffQMCxgrOMB9ltoWnUJQR5h5NoyEtRUqJAlxodt5DSZo-6jPw5FtqcDl2-EluBbDa9aVL7LOOE1uC_TGp5N2Ch7yFANWSxQUOpUWtHmcX0b-mg0oQ-XOCbET3-35s6g6_PniCLcAWBzuY7AyGfW4cb7U-zwLKgGWgwU8", "title": "Sharp Beard Trim", "alt_text": "Close up of a perfectly trimmed beard"},
    {"id": "3", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuArxsy3iIPmxU1ozWW05HwTQX5qQq8ROIlRFIExDATvzXA0AnQS-ww08EVfSSMI4ASXYJSFn95siguR2n1uPB414Cc9riBPoNPJWVelg7tvUaVjTFk3GO6z9AKXj8koBhdm62uf6SNpT2S-74JZ7pWqhTxcwbvp7r8Sp3-Jw1WQ_3JjnU7leR6swagVzaUL71Ms0MLhMd89B_7cqlMTBy9Ti5w9mAvGGqhrrpqW-jvJqbu0Ac1wf_Vm9F1PmedgxVGIaBaxN06Hnck", "title": "Modern Pompadour", "alt_text": "Man with a stylish modern pompadour"},
    {"id": "4", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCyqTSkx117QlntUHbQZNUaSksmlqpNe8lJ9fnJZfP6FGd17Hp0Xoj7x0mcIynke6mnn_b5fzTFTDuNXtdo-FbtWChQyp-nfeEQQrYg_0fDSYcstyqhSptkgOX5RTJGFCX7WUD6ZRIbBYBuMFQKkIysTIOHhGi7LFRA2ERmgnwouIBKUbFEirgu0kPqGEZMfVDmtR4PZZd580LQL_KKekAgJhwzOE50si_h-YnhBPhHN3PG8m-YYyZR_X5Qu0vTtgTy0iyefMNEULI", "title": "The Shop's Ambiance", "alt_text": "Interior of the barbershop"}
]

DEFAULT_STATS = [
    {"id": "1", "value": "15.2K", "label": "Followers", "platform": "instagram"},
    {"id": "2", "value": "4.9/5", "label": "350+ Reviews", "platform": "facebook"},
    {"id": "3", "value": "4.9", "label": "stars", "platform": "google"},
    {"id": "4", "value": "1M+", "label": "Video Views", "platform": "twitter"}
]

DEFAULT_TESTIMONIALS = [
    {"id": "1", "quote": "Best haircut I've ever had. The attention to detail is unmatched. I walked out feeling like a new man. Highly recommend!", "name": "John D.", "title": "Regular Client"},
    {"id": "2", "quote": "The atmosphere is incredible - cool, relaxed, and professional. The barbers are true artists. I wouldn't trust anyone else with my beard.", "name": "Michael P.", "title": "First-time Visitor"},
    {"id": "3", "quote": "From the hot towel shave to the final styling, the experience was pure luxury. The perfect way to unwind and look sharp.", "name": "David L.", "title": "Grooming Enthusiast"}
]


class LandingPageConfig(BaseModel):
    """Complete landing page configuration."""
    id: str
    owner_id: str
    
    # Hero Section (CTA required)
    hero: HeroSection = Field(default_factory=HeroSection)
    
    # Services Section (services managed separately, just titles here)
    services_section: SectionConfig = Field(default_factory=lambda: SectionConfig(
        title="Signature Services",
        subtitle="Experience the art of grooming with our expert services."
    ))
    
    # Portfolio Gallery
    portfolio_section: SectionConfig = Field(default_factory=lambda: SectionConfig(
        title="Our Work",
        subtitle="A gallery of our finest cuts and satisfied clients."
    ))
    portfolio_items: List[PortfolioItem] = Field(default_factory=lambda: [PortfolioItem(**item) for item in DEFAULT_PORTFOLIO_ITEMS], max_length=8)
    
    # Social Stats
    stats_section: SectionConfig = Field(default_factory=lambda: SectionConfig(
        title="Trusted by the Community",
        subtitle="Our reputation speaks for itself across all platforms."
    ))
    stats: List[SocialStat] = Field(default_factory=lambda: [SocialStat.model_validate(stat) for stat in DEFAULT_STATS], max_length=6)
    
    # Testimonials
    testimonials_section: SectionConfig = Field(default_factory=lambda: SectionConfig(
        title="What Our Clients Say",
        subtitle="Your satisfaction is our masterpiece."
    ))
    testimonials: List[Testimonial] = Field(default_factory=lambda: [Testimonial(**t) for t in DEFAULT_TESTIMONIALS], max_length=6)
    
    # Final CTA (ALWAYS visible, CTA required)
    final_cta: FinalCTASection = Field(default_factory=FinalCTASection)
    
    # Custom Sections
    custom_sections: List[ContentBlock] = Field(default_factory=list)
    
    # Footer
    footer: FooterConfig = Field(default_factory=FooterConfig)
    
    # Branding
    branding: BrandingConfig = Field(default_factory=BrandingConfig)
    
    # Metadata
    is_published: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LandingPageConfigUpdate(BaseModel):
    """Update model - all fields optional for partial updates."""
    hero: Optional[HeroSection] = None
    services_section: Optional[SectionConfig] = None
    portfolio_section: Optional[SectionConfig] = None
    portfolio_items: Optional[List[PortfolioItem]] = None
    stats_section: Optional[SectionConfig] = None
    stats: Optional[List[SocialStat]] = None
    testimonials_section: Optional[SectionConfig] = None
    testimonials: Optional[List[Testimonial]] = None
    final_cta: Optional[FinalCTASection] = None
    custom_sections: Optional[List[ContentBlock]] = None
    footer: Optional[FooterConfig] = None
    branding: Optional[BrandingConfig] = None
