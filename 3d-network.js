// 3D Network Mesh Background using Three.js
(function() {
    // Only load if the container exists or just append to body
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvas-container';
    canvasContainer.style.position = 'fixed';
    canvasContainer.style.top = '0';
    canvasContainer.style.left = '0';
    canvasContainer.style.width = '100vw';
    canvasContainer.style.height = '100vh';
    canvasContainer.style.zIndex = '-2'; // Behind everything
    canvasContainer.style.overflow = 'hidden';
    document.body.prepend(canvasContainer);

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0x1B1B26, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    // Create Particles (Nodes)
    const particleCount = 200; // number of nodes
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xF2790F); // Ember
    const color2 = new THREE.Color(0x6FE0D3); // Signal Glow
    const color3 = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
        // Random positions in a sphere
        const r = 300 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Mix colors
        const mixedColor = color1.clone().lerp(color2, Math.random());
        if(Math.random() > 0.8) mixedColor.lerp(color3, 0.5);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 3.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Create Lines (Connections)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
    });

    // To connect particles, we check distance
    const linesGeometry = new THREE.BufferGeometry();
    let linePositions = [];
    let lineColors = [];

    // Simple brute-force connection for nearby nodes
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const distSq = dx*dx + dy*dy + dz*dz;

            if (distSq < 4500) { // Connect if close enough
                linePositions.push(
                    positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                    positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                );
                
                lineColors.push(
                    colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2],
                    colors[j * 3], colors[j * 3 + 1], colors[j * 3 + 2]
                );
            }
        }
    }

    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lines);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animation Loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);

        time += 0.002;
        
        // Smooth mouse follow
        targetX = mouseX * 0.05;
        targetY = mouseY * 0.05;
        
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;
        
        lines.rotation.y += 0.001;
        lines.rotation.x += 0.0005;

        // Subtle camera movement based on mouse
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Pulse effect
        particleMaterial.size = 3.5 + Math.sin(time * 5) * 1.5;

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Dynamic 3D Tilt Effect for Glass Cards
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
})();