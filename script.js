// Mobile Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-menu a").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));

// Form validation for future forms
document.addEventListener('DOMContentLoaded', function() {
    // Common form validation function
    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.addEventListener('submit', function(event) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e74c3c';
                    
                    // Create or show error message
                    let errorMsg = input.nextElementSibling;
                    if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = '#e74c3c';
                        errorMsg.style.fontSize = '0.9rem';
                        errorMsg.style.marginTop = '5px';
                        input.parentNode.insertBefore(errorMsg, input.nextSibling);
                    }
                    errorMsg.textContent = 'This field is required';
                } else {
                    input.style.borderColor = '#ccc';
                    
                    // Remove error message if exists
                    const errorMsg = input.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.textContent = '';
                    }
                }
            });
            
            if (!isValid) {
                event.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    }
    
    // Validate forms on each page
    validateForm('login-form');
    validateForm('signup-form');
    validateForm('relocation-form');
    validateForm('swap-form');
    validateForm('resignation-form');
    validateForm('makeNewReqest-form');
    
    // Display current year in footer
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Feature cards animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe feature cards for animation
document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

    // --- Unified applications storage and admin dashboard counters ---
    const APP_KEY = 'applications';

    function getApplications() {
        try {
            return JSON.parse(localStorage.getItem(APP_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveApplications(apps) {
        localStorage.setItem(APP_KEY, JSON.stringify(apps));
        // notify same-tab listeners
        window.dispatchEvent(new Event('applicationsUpdated'));
        // trigger storage event for other tabs (some browsers restrict constructing StorageEvent)
        try {
            window.dispatchEvent(new StorageEvent('storage', { key: APP_KEY, newValue: JSON.stringify(apps) }));
        } catch (e) {
            localStorage.setItem(APP_KEY + '_updatedAt', Date.now());
        }
    }

    function addApplication(app) {
        const apps = getApplications();
        apps.unshift(app);
        saveApplications(apps);
    }

    function getApplicationCounts() {
        const apps = getApplications();
        const counts = { swap: 0, relocation: 0, resignation: 0, total: apps.length };
        apps.forEach(a => {
            const t = (a.type || '').toLowerCase();
            if (t === 'swap') counts.swap++;
            if (t === 'relocation') counts.relocation++;
            if (t === 'resignation') counts.resignation++;
        });
        return counts;
    }

    function updateAdminDashboardCounts() {
        const counts = getApplicationCounts();
        const elSwap = document.getElementById('count-swap');
        const elReloc = document.getElementById('count-relocation');
        const elResign = document.getElementById('count-resignation');
        const elTotal = document.getElementById('count-total');

        if (elSwap) elSwap.textContent = counts.swap;
        if (elReloc) elReloc.textContent = counts.relocation;
        if (elResign) elResign.textContent = counts.resignation;
        if (elTotal) elTotal.textContent = counts.total;
    }

    // Migrate legacy globalSwapRequests to unified applications key (idempotent)
    (function migrateLegacy() {
        try {
            const legacy = JSON.parse(localStorage.getItem('globalSwapRequests') || '[]');
            if (Array.isArray(legacy) && legacy.length > 0) {
                const apps = getApplications();
                let changed = false;
                legacy.forEach(r => {
                    if (!apps.find(a => String(a.id) === String(r.id))) {
                        r.type = r.type || 'swap';
                        apps.unshift(r);
                        changed = true;
                    }
                });
                if (changed) saveApplications(apps);
            }
        } catch (e) { }
    })();

    // Keep counts in sync in real-time
    window.addEventListener('applicationsUpdated', updateAdminDashboardCounts);
    window.addEventListener('storage', function(e) {
        if (!e) return;
        if (e.key === APP_KEY || e.key === 'applications' || e.key === APP_KEY + '_updatedAt') {
            updateAdminDashboardCounts();
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        updateAdminDashboardCounts();
    });