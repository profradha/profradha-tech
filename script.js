// Utility function to normalize paths
function normalizePath(path) {
    if (!path) return '/';
    // Remove trailing slash and .html extension
    return path.replace(/\/$/, '').replace(/\.html$/, '') || '/';
}

// Active nav link highlighting
function updateActiveNavLink() {
    try {
        const currentPath = normalizePath(window.location.pathname);
        const navLinks = document.querySelectorAll('.nav-item');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const normalizedHref = normalizePath(href);
            
            // Remove active class from all links
            link.classList.remove('active');
            
            // Add active class to matching link
            if (normalizedHref === currentPath) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Error updating active nav link:', error);
    }
}

// Mobile nav toggle
function setupMobileNav() {
    try {
        const toggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (!toggle || !navLinks) return;

        function closeMenu() {
            navLinks.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            navLinks.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
        }

        toggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.contains('open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!navLinks.classList.contains('open')) return;
            if (navLinks.contains(e.target) || toggle.contains(e.target)) return;
            closeMenu();
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        // Close menu if resized back to desktop width
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMenu();
        });
    } catch (error) {
        console.error('Error setting up mobile nav:', error);
    }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        try {
            // Alt + H for home
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.location.href = '/';
            }
            // Alt + W for work
            else if (e.altKey && e.key === 'w') {
                e.preventDefault();
                window.location.href = '/work';
            }
            // Alt + T for talks
            else if (e.altKey && e.key === 't') {
                e.preventDefault();
                window.location.href = '/talks';
            }
            // Alt + L for life
            else if (e.altKey && e.key === 'l') {
                e.preventDefault();
                window.location.href = '/life';
            }
            // Alt + R for resume
            else if (e.altKey && e.key === 'r') {
                e.preventDefault();
                window.location.href = '/resume';
            }
        } catch (error) {
            console.error('Error handling keyboard shortcut:', error);
        }
    });
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    try {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                try {
                    const targetId = this.getAttribute('href');
                    if (targetId && targetId !== '#') {
                        const target = document.querySelector(targetId);
                        if (target) {
                            e.preventDefault();
                            target.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error during smooth scroll:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error setting up smooth scroll:', error);
    }
}

// Turn heading text into a URL-friendly slug
function slugify(text) {
    return (text || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Copy text to the clipboard, with a fallback for non-secure contexts
function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            resolve();
        } catch (error) {
            reject(error);
        } finally {
            document.body.removeChild(textarea);
        }
    });
}

// Give every section heading a stable id and a button to copy a deep link to it
function setupSectionShareLinks() {
    try {
        const headings = document.querySelectorAll('main h1');
        const usedIds = new Set();

        headings.forEach((heading) => {
            const label = heading.textContent.trim();
            let id = heading.id;

            if (!id) {
                const base = slugify(label) || 'section';
                let candidate = base;
                let suffix = 2;
                while (usedIds.has(candidate) || document.getElementById(candidate)) {
                    candidate = `${base}-${suffix++}`;
                }
                id = candidate;
                heading.id = id;
            }
            usedIds.add(id);

            heading.classList.add('shareable-heading');

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'section-link-btn';
            button.setAttribute('aria-label', `Copy link to "${label}" section`);
            button.innerHTML = `
                <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5"></path>
                    <path d="M14 11a5 5 0 0 0-7.07 0l-2.83 2.83a5 5 0 0 0 7.07 7.07l1.5-1.5"></path>
                </svg>
                <svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
                <span class="copy-feedback" aria-live="polite">Link copied!</span>
            `;

            button.addEventListener('click', () => {
                const url = `${window.location.origin}${window.location.pathname}#${id}`;
                copyTextToClipboard(url)
                    .then(() => {
                        button.classList.add('copied');
                        clearTimeout(button._copyTimeout);
                        button._copyTimeout = setTimeout(() => {
                            button.classList.remove('copied');
                        }, 1600);
                    })
                    .catch((error) => {
                        console.error('Error copying section link:', error);
                    });
            });

            heading.appendChild(button);
        });
    } catch (error) {
        console.error('Error setting up section share links:', error);
    }
}

// Scroll to the section named in the URL hash, once headings have ids
function scrollToHashSection() {
    try {
        if (!window.location.hash) return;
        const id = decodeURIComponent(window.location.hash.slice(1));
        const target = document.getElementById(id);
        if (!target) return;
        requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    } catch (error) {
        console.error('Error scrolling to section:', error);
    }
}

// Track page views (simple analytics)
function trackPageView() {
    try {
        const page = normalizePath(window.location.pathname);
        console.log(`User viewed: ${page}`);
    } catch (error) {
        console.error('Error tracking page view:', error);
    }
}

// Carousel functionality with thumbnail support
function setupCarousel() {
    try {
        document.querySelectorAll('.carousel-container').forEach(initCarousel);
    } catch (error) {
        console.error('Error setting up carousel:', error);
    }
}

function initCarousel(carouselContainer) {
    try {
        const carousel = carouselContainer.querySelector('.carousel');
        if (!carousel) return; // Exit if carousel doesn't exist in this container

        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        let thumbnails = carouselContainer.querySelectorAll('.thumbnail');

        if (slides.length === 0) return;
        
        let currentSlide = 0;
        let autoPlayInterval;
        let isTransitioning = false;
        
        // Create thumbnails if they don't exist
        if (thumbnails.length === 0) {
            const thumbnailContainer = carouselContainer.querySelector('.carousel-thumbnails');
            if (thumbnailContainer) {
                slides.forEach((slide, index) => {
                    const img = slide.querySelector('img');
                    const caption = slide.querySelector('.carousel-caption');
                    if (img) {
                        const thumbnail = document.createElement('div');
                        thumbnail.className = 'thumbnail';
                        if (index === 0) thumbnail.classList.add('active');
                        
                        const thumbImg = document.createElement('img');
                        thumbImg.src = img.src;
                        thumbImg.alt = caption ? caption.textContent : `Slide ${index + 1}`;
                        
                        thumbnail.appendChild(thumbImg);
                        thumbnailContainer.appendChild(thumbnail);
                    }
                });
                thumbnails = carouselContainer.querySelectorAll('.thumbnail');
            }
        }
        
        // Show specific slide
        function showSlide(index, skipTransitionCheck = false) {
            // Prevent rapid transitions
            if (isTransitioning && !skipTransitionCheck) return;
            
            isTransitioning = true;
            
            // Handle wrap around
            if (index >= slides.length) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = slides.length - 1;
            } else {
                currentSlide = index;
            }
            
            // Update slides
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === currentSlide) {
                    slide.classList.add('active');
                }
            });
            
            // Update thumbnails
            thumbnails.forEach((thumbnail, i) => {
                thumbnail.classList.remove('active');
                if (i === currentSlide) {
                    thumbnail.classList.add('active');
                }
            });
            
            // Allow transitions after a brief delay
            setTimeout(() => {
                isTransitioning = false;
            }, 300);
        }
        
        // Next slide
        function nextSlide() {
            showSlide(currentSlide + 1);
        }
        
        // Previous slide
        function prevSlide() {
            showSlide(currentSlide - 1);
        }
        
        // Auto play
        function startAutoPlay() {
            stopAutoPlay(); // Clear any existing interval
            autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }
        
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        function restartAutoPlay() {
            stopAutoPlay();
            // Add a delay before restarting autoplay to give user time
            setTimeout(() => {
                startAutoPlay();
            }, 500);
        }
        
        // Event listeners for buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                restartAutoPlay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                restartAutoPlay();
            });
        }
        
        // Event listeners for thumbnails
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                showSlide(index);
                restartAutoPlay();
            });
        });
        
        // Keyboard navigation for carousel (only when this carousel is hovered)
        let isHovered = false;
        carouselContainer.addEventListener('mouseenter', () => { isHovered = true; });
        carouselContainer.addEventListener('mouseleave', () => { isHovered = false; });

        document.addEventListener('keydown', (e) => {
            if (!isHovered) return;

            if (e.key === 'ArrowLeft') {
                prevSlide();
                restartAutoPlay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                restartAutoPlay();
            }
        });

        // Pause auto play on hover
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);

        // Start auto play
        startAutoPlay();
        
    } catch (error) {
        console.error('Error setting up carousel:', error);
    }
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();
    setupMobileNav();
    setupKeyboardShortcuts();
    setupSmoothScroll();
    trackPageView();
    setupCarousel();
    setupSectionShareLinks();
    scrollToHashSection();
});