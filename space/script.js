document.addEventListener('DOMContentLoaded', () => {
    const space = document.getElementById('space');
    // Adjust color distribution to 90% white, 10% colored
    const colors = [
        'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',
        'blue', 'purple', 'yellow', 'white', 'white', 'white', 'white', 'white', 'white',
        'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',
        'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'
    ];
    const galaxyColors = ['blue', 'purple', 'pink', ''];
    const stars = [];
    const galaxies = [];
    const MIN_SPEED = 1;
    const NORMAL_SPEED = 10;
    const WARP_SPEED = 30;
    let currentSpeed = NORMAL_SPEED;
    let targetSpeed = NORMAL_SPEED;
    let isWarping = false;
    let isPaused = false;
    let lastSpeed = NORMAL_SPEED;
    let pauseStartTime = null;
    const PAUSE_DURATION = 1000; // 1 second transition
    let animationFrameId = null;
    
    // Z-depth constants
    const Z_START_MIN = -2000;
    const Z_START_MAX = -1000;
    const Z_RESET_TRIGGER = 1000;
    const Z_RESET_START = 800; // Start replacing stars before they reach trigger
    
    // Initial animation variables
    let isInitialAnimation = true;
    let initialSpeed = 5;
    let initialAnimationStartTime = null;
    const INITIAL_ANIMATION_DURATION = 3000; // 3 seconds
    
    // Add merge functionality
    let isMerging = false;
    let mergeStartTime = null;
    const MERGE_DURATION = 3000; // 3 seconds
    const STAR_GROWTH_DURATION = 400; // 400ms for star growth
    const CENTER_X = window.innerWidth / 2;
    const CENTER_Y = window.innerHeight / 2;
    let mergedStar = null;
    let mergedStarStartTime = null;

    document.getElementById('mergeButton').addEventListener('click', () => {
        if (!isMerging) {
            isMerging = true;
            mergeStartTime = performance.now();
            mergedStarStartTime = performance.now();
            document.getElementById('mergeButton').style.display = 'none';
            
            // Immediately remove galaxies
            galaxies.forEach(galaxy => space.removeChild(galaxy.element));
            galaxies.length = 0;
            
            // Remove any nebula elements
            const nebulas = space.querySelectorAll('.nebula');
            nebulas.forEach(nebula => space.removeChild(nebula));

            // Create and start growing merged star immediately
            mergedStar = document.createElement('div');
            mergedStar.className = 'merged-star';
            mergedStar.style.left = `${CENTER_X}px`;
            mergedStar.style.top = `${CENTER_Y}px`;
            mergedStar.style.width = '1px';
            mergedStar.style.height = '1px';
            mergedStar.style.opacity = '0.3';
            space.appendChild(mergedStar);
        }
    });

    function createSupernova() {
        const supernova = document.createElement('div');
        supernova.className = 'supernova';
        supernova.style.left = `${CENTER_X}px`;
        supernova.style.top = `${CENTER_Y}px`;
        supernova.style.width = '0';
        supernova.style.height = '0';
        space.appendChild(supernova);

        // Start small
        requestAnimationFrame(() => {
            supernova.style.width = '10px';
            supernova.style.height = '10px';
            supernova.style.transform = 'translate(-50%, -50%)';
            
            // Expand
            setTimeout(() => {
                supernova.style.width = '200vmax';
                supernova.style.height = '200vmax';
                
                // Fade out
                setTimeout(() => {
                    supernova.style.opacity = '0';
                    
                    // Remove after fade
                    setTimeout(() => {
                        space.removeChild(supernova);
                        // Reset state
                        isMerging = false;
                        document.getElementById('mergeButton').style.display = 'block';
                        // Recreate stars
                        stars.length = 0;
                        galaxies.length = 0;
                        space.innerHTML = '';
                        for (let i = 0; i < 800; i++) {
                            createStar();
                        }
                        for (let i = 0; i < 8; i++) {
                            createGalaxy();
                        }
                    }, 2000);
                }, 1000);
            }, 500);
        });
    }

    function getRandomStarColor() {
        // 90% white, 10% colored distribution
        if (Math.random() < 0.9) return 'white';
        return ['blue', 'purple', 'yellow'][Math.floor(Math.random() * 3)];
    }

    function createGalaxy(initialZ = null) {
        const galaxy = document.createElement('div');
        const color = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];
        galaxy.className = `galaxy ${color}`;
        
        // Calculate initial position with spread based on distance
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.5) * 0.9 + 0.1; // Keep galaxies more towards edges
        const spreadMultiplier = initialZ ? (initialZ + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN) : 1;
        
        // Random size between 200 and 500 pixels
        const size = 200 + Math.random() * 300;
        
        // Initial random position with spread and offset
        const x = window.innerWidth/2 + (Math.cos(angle) * window.innerWidth * radius * spreadMultiplier);
        const y = window.innerHeight/2 + (Math.sin(angle) * window.innerHeight * radius * spreadMultiplier);
        const z = initialZ ?? (Z_START_MIN + Math.random() * (Z_START_MAX - Z_START_MIN));
        
        const galaxyObj = {
            element: galaxy,
            x: x,
            y: y,
            z: z,
            angle: angle,
            radius: radius,
            size: size,
            speed: Math.random() * 0.5 + 0.2 // Slower movement for galaxies
        };
        
        // Set initial position and size
        galaxy.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        galaxy.style.width = `${size}px`;
        galaxy.style.height = `${size}px`;
        
        space.appendChild(galaxy);
        galaxies.push(galaxyObj);
        return galaxyObj;
    }
    
    function createStar(initialZ = null) {
        const star = document.createElement('div');
        star.className = `star ${getRandomStarColor()}`;
        
        // Calculate initial position with spread based on distance
        const angle = Math.random() * Math.PI * 2;
        // Randomize radius distribution pattern
        const radiusPattern = Math.random();
        const radius = radiusPattern < 0.7 ? 
            // 70% chance: weighted towards outer edges
            Math.pow(Math.random(), 0.5) * 0.8 + 0.2 :
            // 30% chance: more uniform distribution
            Math.random() * 0.8 + 0.2;
            
        const spreadMultiplier = initialZ ? (initialZ + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN) : 1;
        
        // Randomize offset range
        const offsetRange = Math.random() * 150 + 50; // 50-200 range
        const centerOffsetX = (Math.random() - 0.5) * offsetRange;
        const centerOffsetY = (Math.random() - 0.5) * offsetRange;
        
        // Initial random position with spread and offset
        const x = window.innerWidth/2 + (Math.cos(angle) * window.innerWidth/2 * radius * spreadMultiplier) + centerOffsetX;
        const y = window.innerHeight/2 + (Math.sin(angle) * window.innerHeight/2 * radius * spreadMultiplier) + centerOffsetY;
        const z = initialZ ?? (Z_START_MIN + Math.random() * (Z_START_MAX - Z_START_MIN));
        
        // Randomize speed variation
        const speedVariation = Math.random();
        const baseSpeed = speedVariation < 0.8 ?
            // 80% chance: normal speed range
            Math.random() * 1.5 + 0.5 :
            // 20% chance: faster stars
            Math.random() * 2.5 + 1;
        
        // Randomize size with occasional larger stars
        const sizeVariation = Math.random();
        const size = sizeVariation < 0.95 ?
            // 95% chance: small stars (1-3px)
            Math.pow(Math.random(), 2) * 2 + 1 :
            // 5% chance: larger stars (3-5px)
            Math.random() * 2 + 3;
        
        const starObj = {
            element: star,
            x: x,
            y: y,
            z: z,
            angle: angle,
            radius: radius,
            centerOffsetX: centerOffsetX,
            centerOffsetY: centerOffsetY,
            speed: baseSpeed,
            size: size,
            needsReplacement: false
        };
        
        // Set initial position
        star.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        
        space.appendChild(star);
        stars.push(starObj);
        return starObj;
    }
    
    // Create initial stars and galaxies
    for (let i = 0; i < 800; i++) {
        createStar();
    }
    for (let i = 0; i < 8; i++) {
        createGalaxy();
    }
    
    function updateStars(timestamp) {
        // Handle initial animation
        if (isInitialAnimation) {
            if (!initialAnimationStartTime) initialAnimationStartTime = timestamp;
            const progress = (timestamp - initialAnimationStartTime) / INITIAL_ANIMATION_DURATION;
            
            if (progress >= 1) {
                isInitialAnimation = false;
                targetSpeed = MIN_SPEED;
            } else {
                // Ease out cubic
                const easeOut = 1 - Math.pow(1 - progress, 3);
                targetSpeed = Math.max(MIN_SPEED, initialSpeed * (1 - easeOut));
            }
        }

        // Handle merge animation
        if (isMerging) {
            const mergeProgress = (timestamp - mergeStartTime) / MERGE_DURATION;
            const starGrowthProgress = Math.min(1, (timestamp - mergedStarStartTime) / STAR_GROWTH_DURATION);
            
            if (mergeProgress >= 1) {
                // Just remove the stars, merged star is already present
                stars.forEach(star => space.removeChild(star.element));
                stars.length = 0;
                
                // Start pulsing
                let growing = true;
                const pulseAnimation = setInterval(() => {
                    if (growing) {
                        mergedStar.style.transform = 'translate(-50%, -50%) scale(1.1)';
                    } else {
                        mergedStar.style.transform = 'translate(-50%, -50%) scale(1.0)';
                    }
                    growing = !growing;
                }, 1000);
                return;
            }
            
            // Cubic easing for smooth merge and faster growth
            const easeProgress = 1 - Math.pow(1 - mergeProgress, 3);
            const growthEaseProgress = 1 - Math.pow(1 - starGrowthProgress, 1.5); // More aggressive easing
            
            // Update merged star size and opacity
            const mergedStarSize = 1 + (19 * growthEaseProgress); // Grow from 1px to 20px
            mergedStar.style.width = `${mergedStarSize}px`;
            mergedStar.style.height = `${mergedStarSize}px`;
            mergedStar.style.opacity = Math.min(1, 0.3 + (0.7 * Math.pow(growthEaseProgress, 0.5))); // Faster opacity change
            
            stars.forEach(star => {
                // Calculate distance from center for size scaling
                const dx = star.x - CENTER_X;
                const dy = star.y - CENTER_Y;
                const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) / 2;
                const distanceRatio = distanceFromCenter / maxDistance;
                
                // Move towards center
                const targetX = CENTER_X;
                const targetY = CENTER_Y;
                const targetZ = 0;
                
                star.x = star.x + (targetX - star.x) * easeProgress;
                star.y = star.y + (targetY - star.y) * easeProgress;
                star.z = star.z + (targetZ - star.z) * easeProgress;
                
                // Calculate star size based on distance and merge progress
                // Slower shrinking by using square root of progress
                const shrinkProgress = Math.sqrt(easeProgress);
                const shrinkFactor = Math.max(0.3, (1 - shrinkProgress) + (distanceRatio * 0.7));
                const starSize = Math.max(1, star.size * shrinkFactor);
                
                // Update position with centered scaling
                star.element.style.transform = `translate3d(${star.x - starSize/2}px, ${star.y - starSize/2}px, ${star.z}px)`;
                
                // Update star size
                star.element.style.width = `${starSize}px`;
                star.element.style.height = `${starSize}px`;
                
                // Fade based on distance from center and merge progress
                // Slower fade out
                const fadeOut = Math.max(0.2, (1 - shrinkProgress) * (0.3 + distanceRatio * 0.7));
                star.element.style.opacity = fadeOut;
            });
            
            animationFrameId = requestAnimationFrame(updateStars);
            return;
        }

        // Handle pause/resume transition
        if (pauseStartTime) {
            const pauseProgress = (timestamp - pauseStartTime) / PAUSE_DURATION;
            if (pauseProgress >= 1) {
                currentSpeed = targetSpeed;
                pauseStartTime = null;
                // If fully paused, stop animation
                if (isPaused && currentSpeed === 0) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                    return;
                }
            } else {
                // Cubic easing for smooth transition
                const easeProgress = 1 - Math.pow(1 - pauseProgress, 3);
                currentSpeed = lastSpeed + (targetSpeed - lastSpeed) * easeProgress;
            }
        } else {
            currentSpeed = targetSpeed;
        }

        // Update galaxies
        galaxies.forEach(galaxy => {
            galaxy.z += (currentSpeed * galaxy.speed);
            
            // Calculate spread based on z position
            const spreadMultiplier = (galaxy.z + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN);
            
            // Update position with increasing spread as it moves closer
            const spread = Math.pow(spreadMultiplier, 1.5); // Exponential spread
            galaxy.x = window.innerWidth/2 + (Math.cos(galaxy.angle) * window.innerWidth * galaxy.radius * spread);
            galaxy.y = window.innerHeight/2 + (Math.sin(galaxy.angle) * window.innerHeight * galaxy.radius * spread);
            
            // Reset galaxy if it's too close
            if (galaxy.z > Z_RESET_TRIGGER) {
                galaxy.z = Z_START_MIN;
                galaxy.angle = Math.random() * Math.PI * 2;
                galaxy.radius = Math.pow(Math.random(), 0.5) * 0.9 + 0.1;
            }
            
            // Update galaxy position and scale
            const scale = Math.max(0.1, Math.min(3, (galaxy.z + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN)));
            galaxy.element.style.transform = `translate3d(${galaxy.x}px, ${galaxy.y}px, ${galaxy.z}px) scale(${scale})`;
            galaxy.element.style.opacity = Math.min(0.3, scale * 0.2);
        });

        // Update stars
        stars.forEach(star => {
            // Move star towards viewer (increase z)
            star.z += currentSpeed + star.speed;
            
            // Calculate spread based on z position
            const spreadMultiplier = (star.z + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN);
            
            // Update position with increasing spread as it moves closer
            const spread = Math.pow(spreadMultiplier, 1.5); // Exponential spread
            star.x = window.innerWidth/2 + 
                    (Math.cos(star.angle) * window.innerWidth * star.radius * spread) + 
                    (star.centerOffsetX * spread);
            star.y = window.innerHeight/2 + 
                    (Math.sin(star.angle) * window.innerHeight * star.radius * spread) + 
                    (star.centerOffsetY * spread);
            
            // Start replacing stars before they reach the trigger point
            if (star.z > Z_RESET_START && !star.needsReplacement) {
                star.needsReplacement = true;
                // Create replacement star with new random properties
                createStar();
            }
            
            // Remove star if it's too close
            if (star.z > Z_RESET_TRIGGER) {
                space.removeChild(star.element);
                const index = stars.indexOf(star);
                if (index > -1) {
                    stars.splice(index, 1);
                }
                return;
            }
            
            // Update star position
            star.element.style.transform = `translate3d(${star.x}px, ${star.y}px, ${star.z}px)`;
            
            // Scale star based on z position with smoother transition
            const scale = Math.max(0.1, Math.min(2, (star.z + Math.abs(Z_START_MIN)) / (Math.abs(Z_START_MIN) * 0.75)));
            // Make stars stretch during warp
            const stretchFactor = isWarping ? (scale * 2) : 1;
            star.element.style.width = `${scale * star.size * stretchFactor}px`;
            star.element.style.height = `${scale * star.size}px`;
            // Adjusted opacity for better visibility of distant stars
            star.element.style.opacity = Math.min(1, scale * 1.2);
        });
        
        // Continue animation if not fully paused
        if (!isPaused || currentSpeed > 0) {
            animationFrameId = requestAnimationFrame(updateStars);
        }
    }
    
    // Check scroll position and update speed
    function checkScroll() {
        if (!isPaused && !pauseStartTime) {
            if (window.pageYOffset > 0) {
                if (!isInitialAnimation) {
                    targetSpeed = NORMAL_SPEED;
                    lastSpeed = NORMAL_SPEED;
                }
            } else {
                if (!isInitialAnimation) {
                    targetSpeed = MIN_SPEED;
                    lastSpeed = MIN_SPEED;
                }
            }
        }
    }
    
    // Handle scroll
    window.addEventListener('scroll', checkScroll);
    
    // Handle mouse events for warp speed
    window.addEventListener('mousedown', () => {
        if (!isInitialAnimation && !isPaused && !pauseStartTime) {
            isWarping = true;
            targetSpeed = WARP_SPEED;
            lastSpeed = WARP_SPEED;
        }
    });
    
    window.addEventListener('mouseup', () => {
        if (!isInitialAnimation && !isPaused && !pauseStartTime) {
            isWarping = false;
            targetSpeed = window.pageYOffset > 0 ? NORMAL_SPEED : MIN_SPEED;
            lastSpeed = targetSpeed;
        }
    });
    
    // Also handle touch events for mobile
    window.addEventListener('touchstart', () => {
        if (!isInitialAnimation && !isPaused && !pauseStartTime) {
            isWarping = true;
            targetSpeed = WARP_SPEED;
            lastSpeed = WARP_SPEED;
        }
    });
    
    window.addEventListener('touchend', () => {
        if (!isInitialAnimation && !isPaused && !pauseStartTime) {
            isWarping = false;
            targetSpeed = window.pageYOffset > 0 ? NORMAL_SPEED : MIN_SPEED;
            lastSpeed = targetSpeed;
        }
    });
    
    // Handle pause/continue with semicolon
    window.addEventListener('keydown', (event) => {
        if (event.key === ';' && !pauseStartTime) {
            if (isPaused) {
                // Resume animation with smooth transition
                isPaused = false;
                lastSpeed = 0;
                targetSpeed = window.pageYOffset > 0 ? NORMAL_SPEED : MIN_SPEED;
                pauseStartTime = performance.now();
                // Restart animation if stopped
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(updateStars);
                }
            } else {
                // Pause animation with smooth transition
                isPaused = true;
                lastSpeed = currentSpeed;
                targetSpeed = 0;
                pauseStartTime = performance.now();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const viewportChange = window.innerWidth / window.innerHeight;
        
        stars.forEach(star => {
            const spreadMultiplier = (star.z + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN);
            const spread = Math.pow(spreadMultiplier, 1.5);
            star.x = window.innerWidth/2 + 
                    (Math.cos(star.angle) * window.innerWidth * star.radius * spread) + 
                    (star.centerOffsetX * spread);
            star.y = window.innerHeight/2 + 
                    (Math.sin(star.angle) * window.innerHeight * star.radius * spread) + 
                    (star.centerOffsetY * spread);
            star.element.style.transform = `translate3d(${star.x}px, ${star.y}px, ${star.z}px)`;
        });
        
        galaxies.forEach(galaxy => {
            const spreadMultiplier = (galaxy.z + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN);
            const spread = Math.pow(spreadMultiplier, 1.5);
            galaxy.x = window.innerWidth/2 + (Math.cos(galaxy.angle) * window.innerWidth * galaxy.radius * spread);
            galaxy.y = window.innerHeight/2 + (Math.sin(galaxy.angle) * window.innerHeight * galaxy.radius * spread);
            const scale = Math.max(0.1, Math.min(3, (galaxy.z + Math.abs(Z_START_MIN)) / Math.abs(Z_START_MIN)));
            galaxy.element.style.transform = `translate3d(${galaxy.x}px, ${galaxy.y}px, ${galaxy.z}px) scale(${scale})`;
        });
    });
    
    // Start animation
    animationFrameId = requestAnimationFrame(updateStars);
});
