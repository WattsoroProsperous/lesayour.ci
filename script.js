/**
 * Le Sayour - Modern Restaurant Website
 * JavaScript - Animations & Interactions
 */

// Cache Buster - Écrase le cache à chaque chargement
(function() {
    // 1. Supprimer tous les caches du navigateur
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }

    // 2. Désactiver le cache du Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
        });
    }

    // 3. Forcer le rechargement des ressources (CSS, images, scripts)
    const timestamp = Date.now();

    // CSS
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('fonts.googleapis.com')) {
            const newHref = href.split('?')[0] + '?t=' + timestamp;
            link.setAttribute('href', newHref);
        }
    });

    // Images
    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
            img.setAttribute('src', src.split('?')[0] + '?t=' + timestamp);
        }
    });

    // 4. Empêcher la mise en cache via headers (pour les requêtes futures)
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        options.cache = 'no-store';
        return originalFetch(url, options);
    };
})();

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Preloader.init();
    CustomCursor.init();
    Navigation.init();
    ScrollAnimations.init();
    Gallery.init();
    Newsletter.init();
    LazyMedia.init();
    PopupAd.init();
});

/**
 * Preloader Module
 */
const Preloader = {
    preloader: null,
    bar: null,
    percent: null,
    progress: 0,

    init() {
        this.preloader = document.getElementById('preloader');
        this.bar = document.querySelector('.preloader-bar');
        this.percent = document.querySelector('.preloader-percent');

        if (!this.preloader) return;

        document.body.classList.add('locked');

        // Critical assets to preload
        const criticalAssets = [
            'assets/logo.png',
            'assets/Un goût de mer qui fait voyager.jpg'
        ];

        this.preloadAssets(criticalAssets);
    },

    preloadAssets(assets) {
        let loaded = 0;
        const total = assets.length;

        assets.forEach(src => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loaded++;
                this.updateProgress((loaded / total) * 100);
                if (loaded === total) {
                    this.complete();
                }
            };
            img.src = src;
        });

        // Fallback timeout
        setTimeout(() => this.complete(), 5000);
    },

    updateProgress(value) {
        this.progress = Math.min(value, 100);
        if (this.bar) {
            this.bar.style.width = `${this.progress}%`;
        }
        if (this.percent) {
            this.percent.textContent = `${Math.round(this.progress)}%`;
        }
    },

    complete() {
        if (this.preloader.classList.contains('hidden')) return;

        this.updateProgress(100);

        setTimeout(() => {
            this.preloader.classList.add('hidden');
            document.body.classList.remove('locked');

            // Trigger hero animations
            HeroAnimations.init();

            // Initialize scroll animations
            setTimeout(() => {
                ScrollAnimations.check();
            }, 100);
        }, 600);
    }
};

/**
 * Custom Cursor Module
 */
const CustomCursor = {
    cursor: null,
    follower: null,
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    followerX: 0,
    followerY: 0,

    init() {
        this.cursor = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');

        if (!this.cursor || !this.follower || window.innerWidth < 1024) return;

        this.bindEvents();
        this.animate();
    },

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .btn, input, .gallery-item');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.follower.classList.remove('hover');
            });
        });
    },

    animate() {
        // Smooth cursor movement
        this.cursorX += (this.mouseX - this.cursorX) * 0.5;
        this.cursorY += (this.mouseY - this.cursorY) * 0.5;

        this.followerX += (this.mouseX - this.followerX) * 0.15;
        this.followerY += (this.mouseY - this.followerY) * 0.15;

        this.cursor.style.left = `${this.cursorX}px`;
        this.cursor.style.top = `${this.cursorY}px`;

        this.follower.style.left = `${this.followerX}px`;
        this.follower.style.top = `${this.followerY}px`;

        requestAnimationFrame(() => this.animate());
    }
};

/**
 * Hero Animations Module
 */
const HeroAnimations = {
    init() {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        // Animate elements with data-aos
        const elements = heroContent.querySelectorAll('[data-aos]');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('aos-animate');
            }, index * 150);
        });
    }
};

/**
 * Navigation Module
 */
const Navigation = {
    header: null,
    toggle: null,
    mobileMenu: null,
    lastScroll: 0,

    init() {
        this.header = document.getElementById('header');
        this.toggle = document.getElementById('nav-toggle');
        this.mobileMenu = document.getElementById('mobile-menu');

        if (!this.header) return;

        this.bindEvents();
    },

    bindEvents() {
        // Scroll handler
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

        // Mobile menu toggle
        if (this.toggle && this.mobileMenu) {
            this.toggle.addEventListener('click', () => this.toggleMenu());

            // Close on link click
            const mobileLinks = this.mobileMenu.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
        }

        // Active link on scroll
        window.addEventListener('scroll', () => this.updateActiveLink(), { passive: true });

        // Smooth scroll for nav links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    this.closeMenu();
                    const offset = this.header.offsetHeight;
                    const top = target.offsetTop - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    },

    handleScroll() {
        const scrollY = window.scrollY;

        // Add/remove scrolled class
        if (scrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        this.lastScroll = scrollY;
    },

    toggleMenu() {
        this.toggle.classList.toggle('active');
        this.mobileMenu.classList.toggle('active');
        document.body.classList.toggle('locked');
    },

    closeMenu() {
        this.toggle.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.classList.remove('locked');
    },

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                // Desktop nav
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                // Mobile nav
                document.querySelectorAll('.mobile-nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
};

/**
 * Scroll Animations Module
 */
const ScrollAnimations = {
    elements: [],

    init() {
        this.elements = document.querySelectorAll('[data-aos]');

        if (this.elements.length === 0) return;

        window.addEventListener('scroll', () => this.check(), { passive: true });
        window.addEventListener('resize', () => this.check(), { passive: true });
    },

    check() {
        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.85;

        this.elements.forEach(el => {
            const rect = el.getBoundingClientRect();

            if (rect.top < triggerPoint) {
                el.classList.add('aos-animate');
            }
        });
    }
};

/**
 * Gallery Module - Enhanced with navigation
 */
const Gallery = {
    modal: null,
    openBtns: [],
    closeBtn: null,
    backdrop: null,
    mainImage: null,
    thumbnails: [],
    prevBtn: null,
    nextBtn: null,
    currentIndex: 0,
    images: [
        'assets/events/recent events/prestation de la star ibrahim farhat/event details/ibrahim farhat pose.jpg',
        'assets/events/recent events/prestation de la star ibrahim farhat/event details/galery 1.jpg',
        'assets/events/recent events/prestation de la star ibrahim farhat/event details/galery 2.jpg',
        'assets/events/recent events/prestation de la star ibrahim farhat/event details/galery 3.jpg'
    ],

    init() {
        this.modal = document.getElementById('gallery-modal');
        this.closeBtn = document.getElementById('close-gallery');
        this.mainImage = document.getElementById('gallery-main-img');
        this.prevBtn = document.getElementById('gallery-prev');
        this.nextBtn = document.getElementById('gallery-next');
        this.thumbnails = document.querySelectorAll('.gallery-thumb');
        this.currentCounter = document.getElementById('gallery-current');

        // Multiple open triggers
        this.openBtns = [
            document.getElementById('open-gallery'),
            document.getElementById('open-gallery-btn'),
            document.getElementById('play-video-btn')
        ].filter(btn => btn !== null);

        // Preview items
        this.previewItems = document.querySelectorAll('.gallery-preview-item');

        // Video elements
        this.videoPoster = document.getElementById('video-poster');
        this.videoElement = document.getElementById('gallery-video');
        this.playRecapBtn = document.getElementById('play-recap-btn');

        if (!this.modal) return;

        this.backdrop = this.modal.querySelector('.gallery-modal-backdrop');

        this.bindEvents();
    },

    bindEvents() {
        // Open buttons
        this.openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // If it's the video button, scroll to video section and play
                if (btn.id === 'play-video-btn') {
                    this.open();
                    setTimeout(() => {
                        const videoSection = document.querySelector('.gallery-video-section');
                        if (videoSection) {
                            videoSection.scrollIntoView({ behavior: 'smooth' });
                            // Auto-play video after scroll
                            setTimeout(() => this.playRecapVideo(), 500);
                        }
                    }, 300);
                } else {
                    this.open();
                }
            });
        });

        // Preview items click - open gallery at specific index
        this.previewItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.open(index);
            });
        });

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Backdrop click
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }

        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Thumbnail clicks
        this.thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.goTo(index));
        });

        // Video poster/play button click
        if (this.videoPoster) {
            this.videoPoster.addEventListener('click', () => this.playRecapVideo());
        }
        if (this.playRecapBtn) {
            this.playRecapBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playRecapVideo();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;

            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
    },

    playRecapVideo() {
        if (this.videoPoster && this.videoElement) {
            // Hide poster
            this.videoPoster.classList.add('hidden');
            // Show and play video
            this.videoElement.style.display = 'block';
            this.videoElement.classList.add('active');
            this.videoElement.play().catch(() => {});
        }
    },

    resetVideo() {
        if (this.videoPoster && this.videoElement) {
            // Show poster
            this.videoPoster.classList.remove('hidden');
            // Hide and pause video
            this.videoElement.style.display = 'none';
            this.videoElement.classList.remove('active');
            this.videoElement.pause();
            this.videoElement.currentTime = 0;
        }
    },

    open(index = 0) {
        this.modal.classList.add('active');
        document.body.classList.add('locked');
        this.goTo(index);
    },

    close() {
        this.modal.classList.remove('active');
        document.body.classList.remove('locked');

        // Reset video to poster state
        this.resetVideo();
    },

    goTo(index) {
        this.currentIndex = index;

        // Update main image with fade effect
        if (this.mainImage) {
            this.mainImage.style.opacity = '0';
            setTimeout(() => {
                this.mainImage.src = this.images[index];
                this.mainImage.style.opacity = '1';
            }, 150);
        }

        // Update thumbnails
        this.thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });

        // Update counter
        if (this.currentCounter) {
            this.currentCounter.textContent = index + 1;
        }
    },

    prev() {
        const newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.images.length - 1;
        this.goTo(newIndex);
    },

    next() {
        const newIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
        this.goTo(newIndex);
    }
};

/**
 * Newsletter Module
 */
const Newsletter = {
    form: null,

    init() {
        this.form = document.getElementById('newsletter-form');

        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    handleSubmit(e) {
        e.preventDefault();

        const input = this.form.querySelector('input[type="email"]');
        const email = input.value;

        if (this.validateEmail(email)) {
            this.showSuccess(input);
        } else {
            this.showError(input);
        }
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    showSuccess(input) {
        const parent = input.parentElement;
        parent.style.border = '1px solid #27ae60';

        // Reset input
        setTimeout(() => {
            input.value = '';
            parent.style.border = '';
        }, 2000);

        // Show toast
        this.showToast('Merci ! Vous êtes inscrit.', 'success');
    },

    showError(input) {
        const parent = input.parentElement;
        parent.style.border = '1px solid #c0392b';

        setTimeout(() => {
            parent.style.border = '';
        }, 2000);

        this.showToast('Veuillez entrer un email valide.', 'error');
    },

    showToast(message, type) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            padding: 16px 32px;
            background: ${type === 'success' ? '#27ae60' : '#c0392b'};
            color: white;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 9999;
            transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        `;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

/**
 * Lazy Media Module
 */
const LazyMedia = {
    init() {
        this.lazyVideos();
    },

    lazyVideos() {
        const videos = document.querySelectorAll('video[data-lazy]');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        video.play().catch(() => {});
                        observer.unobserve(video);
                    }
                });
            }, { rootMargin: '100px' });

            videos.forEach(video => {
                video.pause();
                observer.observe(video);
            });
        }
    }
};

/**
 * Pop-up Publicitaire Module
 * - S'affiche UNE SEULE FOIS par session
 * - Se déclenche au premier scroll de l'utilisateur
 */
const PopupAd = {
    popup: null,
    closeBtn: null,
    ctaBtn: null,
    video: null,
    scrollHandler: null,

    init() {
        // Éléments du DOM
        this.popup = document.getElementById('popup');
        if (!this.popup) return;

        // Vérifier si déjà affiché cette session
        if (sessionStorage.getItem('popupShown') === 'true') return;

        this.closeBtn = document.getElementById('popup-close');
        this.ctaBtn = document.getElementById('popup-cta');
        this.video = document.getElementById('popup-video');

        this.bindCloseEvents();
        this.waitForScroll();
    },

    waitForScroll() {
        // Handler simple : au premier scroll, afficher le popup
        this.scrollHandler = () => {
            // Retirer immédiatement l'écouteur
            window.removeEventListener('scroll', this.scrollHandler);

            // Petit délai pour ne pas interrompre le scroll
            setTimeout(() => this.open(), 300);
        };

        window.addEventListener('scroll', this.scrollHandler, { once: true, passive: true });
    },

    bindCloseEvents() {
        // Bouton fermer
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Bouton CTA
        if (this.ctaBtn) {
            this.ctaBtn.addEventListener('click', () => this.close());
        }

        // Clic sur l'overlay
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) this.close();
        });

        // Touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup.classList.contains('active')) {
                this.close();
            }
        });
    },

    open() {
        // Marquer comme affiché immédiatement
        sessionStorage.setItem('popupShown', 'true');

        // Afficher le popup
        this.popup.classList.add('active');
        document.body.classList.add('locked');

        // Jouer la vidéo avec le son
        if (this.video) {
            this.video.muted = false;
            this.video.volume = 0.7;
            this.video.currentTime = 0;

            setTimeout(() => {
                this.video.play().catch(() => {
                    // Fallback : jouer en muet si autoplay bloqué
                    this.video.muted = true;
                    this.video.play().catch(() => {});
                });
            }, 100);
        }
    },

    close() {
        this.popup.classList.remove('active');
        document.body.classList.remove('locked');

        // Mettre la vidéo en pause et reset
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0;
        }
    }
};

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Parallax effect on scroll (optional enhancement)
 */
const ParallaxEffect = {
    init() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        if (parallaxElements.length === 0) return;

        window.addEventListener('scroll', throttle(() => {
            const scrollY = window.scrollY;

            parallaxElements.forEach(el => {
                const speed = el.dataset.parallax || 0.5;
                const offset = scrollY * speed;
                el.style.transform = `translateY(${offset}px)`;
            });
        }, 16));
    }
};

/**
 * Magnetic buttons effect (optional enhancement)
 */
const MagneticButtons = {
    init() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-white');

        if (window.innerWidth < 1024) return;

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }
};

// Initialize magnetic buttons after preloader
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        MagneticButtons.init();
    }, 1500);
});
