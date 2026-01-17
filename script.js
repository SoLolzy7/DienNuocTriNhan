// Formspree Configuration
const FORMSPREE_URL = "https://formspree.io/f/mpqqqwbk";

// DOM Elements
const header = document.querySelector('.header');
const form = document.getElementById('serviceForm');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const spinner = document.querySelector('.spinner');
const notification = document.getElementById('notification');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuClose = document.querySelector('.mobile-menu-close');
const overlay = document.querySelector('.overlay');

// Service Cards Animation
const serviceCards = document.querySelectorAll('.service-card');

// Scroll Effects
window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Service cards animation
    serviceCards.forEach(card => {
        const cardPosition = card.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (cardPosition < screenPosition) {
            card.classList.add('visible');
        }
    });
});

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button and show loading
    submitBtn.disabled = true;
    btnText.textContent = 'Đang gửi...';
    spinner.style.display = 'block';
    
    // Collect form data
    const formData = new FormData(form);
    
    // Add timestamp and source
    formData.append('_timestamp', new Date().toISOString());
    formData.append('_source', 'website');
    formData.append('_page', window.location.href);
    
    try {
        // Send to Formspree
        const response = await fetch(FORMSPREE_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Success
            showNotification('✅ Yêu cầu đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 5 phút.', 'success');
            form.reset();
            
            // Send SMS/Telegram alert (optional)
            await sendAlert(formData);
            
            // Track conversion (optional)
            trackConversion();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Có lỗi xảy ra! Vui lòng gọi trực tiếp: 0938.123.456', 'error');
        
        // Fallback: Save to localStorage
        saveToLocalStorage(formData);
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        btnText.textContent = 'GỬI YÊU CẦU';
        spinner.style.display = 'none';
    }
});

// Notification System
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Send alert to Telegram/SMS (Optional)
async function sendAlert(formData) {
    // You can integrate with Telegram or SMS service here
    // Example using Telegram Bot API
    /*
    const botToken = 'YOUR_BOT_TOKEN';
    const chatId = 'YOUR_CHAT_ID';
    const message = `📞 YÊU CẦU MỚI:\nTên: ${formData.get('name')}\nSĐT: ${formData.get('phone')}\nDịch vụ: ${formData.get('service')}`;
    
    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });
    } catch (e) {
        console.log('Telegram alert failed');
    }
    */
}

// Save to localStorage as backup
function saveToLocalStorage(formData) {
    try {
        const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        const submission = {
            timestamp: new Date().toISOString(),
            name: formData.get('name'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            address: formData.get('address'),
            message: formData.get('message')
        };
        
        submissions.push(submission);
        localStorage.setItem('formSubmissions', JSON.stringify(submissions));
        
        console.log('Saved to localStorage as backup');
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

// Track conversion (for analytics)
function trackConversion() {
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead');
    }
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL'
        });
    }
}

// Mobile Menu
mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

mobileMenuClose?.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

overlay?.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Close mobile menu if open
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Smooth scroll
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// Auto-fill phone from URL parameter
function autoFillFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get('phone');
    const service = urlParams.get('service');
    
    if (phone && document.getElementById('phone')) {
        document.getElementById('phone').value = phone;
    }
    
    if (service && document.getElementById('service')) {
        document.getElementById('service').value = service;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Animate service cards on initial load
    serviceCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 200);
    });
    
    // Auto-fill from URL
    autoFillFromURL();
    
    // Initialize tooltips
    initTooltips();
});

// Tooltips for floating buttons
function initTooltips() {
    const floatingButtons = document.querySelectorAll('.floating-button');
    
    floatingButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            }
        });
    });
}

// Form validation
function initFormValidation() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Chỉ cho phép số, không thêm dấu chấm
            this.value = this.value.replace(/\D/g, '');
            
            // KHÔNG CÓ auto format - đây là nguyên nhân gây lỗi
            // XÓA HOÀN TOÀN phần code format dưới đây:
            // if (this.value.length > 4) {
            //     this.value = this.value.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
            // }
        });
    }
}

// Call the validation function
initFormValidation();