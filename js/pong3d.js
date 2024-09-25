import * as THREE from 'three';

// Clase principal del juego
class Game {
    constructor() {
        // Configuración de dificultad
        this.difficulty = 'easy'; // Puedes ajustar esto para 'easy', 'medium', 'hard'
        this.difficultySettings = {
            easy: 0.5,
            medium: 1,
            hard: 2
        };
        this.initialSpeed = this.difficultySettings[this.difficulty];

        // Dimensiones y propiedades del campo
        this.ballHeight = 2;
        this.wallHeight = this.ballHeight * 2;
        this.wallThickness = 1;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.fieldWidth = 100;
        this.fieldHeight = 50;

        // Estado del juego
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.paddle1 = null;
        this.paddle2 = null;
        this.ball = null;
        this.field = null;
        this.walls = null;
        this.soloPlay = sessionStorage.getItem('modoJuego') === 'solo';

        // Entradas del teclado
        this.wKey = { isPressed: false };
        this.sKey = { isPressed: false };
        this.upKey = { isPressed: false };
        this.downKey = { isPressed: false };

        // Variables de juego
        this.speed = 0.5;  // Velocidad de movimiento de las palas
        this.speedIncrement = 0.05; // Incremento de velocidad de la pelota en cada colisión
        this.boundaryMargin = 5; // Margen para detectar cuando la pelota sale del campo

        this.isGameStarted = false; // Nuevo estado para saber si el juego ha comenzado

        // Inicializar el juego
        //this.init();

    }
    
    exitGame() {
        // Función para salir del juego y volver al menú anterior
        const exitMessage = confirm("¿Estás seguro de que quieres salir del juego?");
        if (exitMessage) {
            // Aquí puedes redirigir al menú anterior, por ejemplo:
            window.location.href = "menu.html";  // Cambiar la URL al menú o página anterior
        }
    }

    init() {
        this.scene = new THREE.Scene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createObjects();

        // Configurar los event listeners
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));

        this.showStartMessage();
        this.gameLoop();
    }

    showStartMessage() {
        // Crear y mostrar un mensaje de inicio con HTML
        const startMessage = document.createElement('div');
        startMessage.id = "startMessage";
        startMessage.style.position = 'absolute';
        startMessage.style.top = '50%';
        startMessage.style.left = '50%';
        startMessage.style.transform = 'translate(-50%, -50%)';
        startMessage.style.fontSize = '24px';
        startMessage.style.color = '#ffffff';
        startMessage.innerHTML = "Presiona cualquier tecla para comenzar";
        document.body.appendChild(startMessage);

        // Esperar a que el jugador presione una tecla para iniciar
        window.addEventListener('keydown', this.startGame.bind(this));
    }

    startGame() {
        if (!this.isGameStarted) {
            this.isGameStarted = true;  // Marcar que el juego ha comenzado
            this.ball.resetPosition();  // Poner la pelota en movimiento
            this.hideStartMessage();    // Ocultar el mensaje de inicio
            this.gameLoop();            // Iniciar el bucle del juego
        }
    }

    exitGame() {
        // Función para salir del juego y volver al menú anterior
        const exitMessage = confirm("¿Estás seguro de que quieres salir del juego?");
        if (exitMessage) {
            // Aquí puedes redirigir al menú anterior, por ejemplo:
            window.location.href = "/";  // Cambiar la URL al menú o página anterior
        }
    }

    hideStartMessage() {
        const startMessage = document.getElementById("startMessage");
        if (startMessage) {
            startMessage.remove();  // Eliminar el mensaje de inicio
        }
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // Campo de visión (FOV)
            this.screenWidth / this.screenHeight, // Relación de aspecto
            0.1, // Plano cercano
            1000 // Plano lejano
        );
    
        // Ajustar la posición de la cámara
        this.camera.position.set(20, 70, 70); // Colocarla en una posición elevada
        this.camera.lookAt(0, 0, 0); // Mirar hacia el centro del campo
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.screenWidth, this.screenHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.setClearColor(0xfaf0e6);

        const main = document.getElementById("main");
        if (main) {
            main.appendChild(this.renderer.domElement);
        } else {
            console.error("No se encontró el elemento con id 'main'. Asegúrate de que exista en tu HTML.");
        }
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 50, 50);
        this.scene.add(directionalLight);
    }

    createObjects() {
        // Crear el campo
        this.field = new Field(this.fieldWidth, this.fieldHeight);
        this.scene.add(this.field.mesh);

        // Crear las palas
        this.paddle1 = new Paddle(-this.fieldWidth / 2 + 1, this.fieldHeight);
        this.paddle2 = new Paddle(this.fieldWidth / 2 - 1, this.fieldHeight);
        this.scene.add(this.paddle1.mesh);
        this.scene.add(this.paddle2.mesh);

        // Crear la pelota
        this.ball = new Ball(this.initialSpeed);
        this.scene.add(this.ball.mesh);

        // Crear los muros laterales
        this.walls = new Walls(this.fieldWidth, this.fieldHeight, this.wallHeight, this.wallThickness);
        this.scene.add(this.walls.topWall);
        this.scene.add(this.walls.bottomWall);

        // Crear la línea central
        this.createCenterLine();
    }

    createCenterLine() {
        const lineGeometry = new THREE.BufferGeometry();
        const lineVertices = new Float32Array([
            0, 0, this.fieldHeight / 2,
            0, 0, -this.fieldHeight / 2
        ]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const centerLine = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(centerLine);
    }

    resizeCanvas() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
        // Ajustar la cámara para que mantenga el tamaño del campo
        const aspectRatio = this.screenWidth / this.screenHeight;
        
        this.camera.left = -this.fieldWidth / 2;
        this.camera.right = this.fieldWidth / 2;
        this.camera.top = this.fieldHeight / 2;
        this.camera.bottom = -this.fieldHeight / 2;
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.screenWidth, this.screenHeight);
    }

    handleKeydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                this.upKey.isPressed = true;
                break;
            case 'ArrowDown':
                this.downKey.isPressed = true;
                break;
            case 'w':
                this.wKey.isPressed = true;
                break;
            case 's':
                this.sKey.isPressed = true;
                break;
            case 'Escape': // Detectar si se presiona 'ESC'
                this.exitGame();  // Llamar a la función para salir del juego
                break;
        }
    }

    handleKeyup(event) {
        switch (event.key) {
            case 'ArrowUp':
                this.upKey.isPressed = false;
                break;
            case 'ArrowDown':
                this.downKey.isPressed = false;
                break;
            case 'w':
                this.wKey.isPressed = false;
                break;
            case 's':
                this.sKey.isPressed = false;
                break;
        }
    }

    collision(ball, paddle) {
        const ballBox = new THREE.Box3().setFromObject(ball.mesh);
        const paddleBox = new THREE.Box3().setFromObject(paddle.mesh);
        return ballBox.intersectsBox(paddleBox);
    }

    movePaddle(paddle, moveUp, moveDown) {
        if (moveUp) {
            paddle.moveDown(this.speed); // Cambiar a moveDown para invertir el movimiento
        }
        if (moveDown) {
            paddle.moveUp(this.speed); // Cambiar a moveUp para invertir el movimiento
        }
        paddle.limitPosition(-this.fieldHeight / 2, this.fieldHeight / 2);
    }

    update() {
        this.ball.updatePosition();

        const ballRadius = this.ball.mesh.geometry.parameters.radius;

        // Rebote en los muros superior e inferior
        if (this.ball.mesh.position.z + ballRadius >= this.fieldHeight / 2) {
            this.ball.bounceY();
            this.ball.mesh.position.z = this.fieldHeight / 2 - ballRadius;
            this.ball.increaseSpeed(this.speedIncrement);
        } else if (this.ball.mesh.position.z - ballRadius <= -this.fieldHeight / 2) {
            this.ball.bounceY();
            this.ball.mesh.position.z = -this.fieldHeight / 2 + ballRadius;
            this.ball.increaseSpeed(this.speedIncrement);
        }

        // Colisiones con las palas
        if (this.collision(this.ball, this.paddle1)) {
            this.ball.bounceX();
            this.ball.mesh.position.x = this.paddle1.mesh.position.x + (ballRadius + this.paddle1.width / 2);
            this.ball.increaseSpeed(this.speedIncrement);
        }

        if (this.collision(this.ball, this.paddle2)) {
            this.ball.bounceX();
            this.ball.mesh.position.x = this.paddle2.mesh.position.x - (ballRadius + this.paddle2.width / 2);
            this.ball.increaseSpeed(this.speedIncrement);
        }

        // Comprobar si la pelota salió del campo
        if (this.ball.mesh.position.x - ballRadius <= -this.fieldWidth / 2 - this.boundaryMargin) {
            if (!this.collision(this.ball, this.paddle1)) {
                this.ball.resetPosition();
                this.paddle2.score++;
            }
        } else if (this.ball.mesh.position.x + ballRadius >= this.fieldWidth / 2 + this.boundaryMargin) {
            if (!this.collision(this.ball, this.paddle2)) {
                this.ball.resetPosition();
                this.paddle1.score++;
            }
        }

        // Mover las palas
        this.movePaddle(this.paddle1, this.upKey.isPressed, this.downKey.isPressed);
        if (this.soloPlay) {
            this.updateComPaddle();
        } else {
            this.movePaddle(this.paddle2, this.wKey.isPressed, this.sKey.isPressed);
        }
    }

    updateComPaddle() {
        const distanceToBall = this.ball.mesh.position.z - this.paddle2.mesh.position.z;
        const aiSpeed = 0.5 * this.initialSpeed;

        if (distanceToBall > 0) {
            this.paddle2.moveUp(aiSpeed);
        } else {
            this.paddle2.moveDown(aiSpeed);
        }
        this.paddle2.limitPosition(-this.fieldHeight / 2, this.fieldHeight / 2);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    gameLoop() {
        this.update();
        this.render();
        if (this.isGameStarted) {
            requestAnimationFrame(this.gameLoop.bind(this));  // Solo seguir el bucle si el juego ha comenzado
        }
    }
}

// Clase para las palas
class Paddle {
    constructor(xPosition, fieldHeight) {
        const paddleGeometry = new THREE.BoxGeometry(2, 2, 5);
        const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.mesh.position.set(xPosition, 1.5, 0);
        this.width = paddleGeometry.parameters.width;
        this.depth = paddleGeometry.parameters.depth;
        this.fieldHeight = fieldHeight;
        this.score = 0;
    }

    moveUp(speed) {
        this.mesh.position.z += speed;
    }

    moveDown(speed) {
        this.mesh.position.z -= speed;
    }

    limitPosition(minZ, maxZ) {
        this.mesh.position.z = Math.max(
            Math.min(this.mesh.position.z, maxZ - this.depth / 2),
            minZ + this.depth / 2
        );
    }
}

// Clase para la pelota
class Ball {
    constructor(initialSpeed) {
        const ballRadius = 0.5;
        const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(ballGeometry, ballMaterial);
        this.initialSpeed = initialSpeed;
        this.speed = initialSpeed;
        this.resetPosition();
    }

    resetPosition() {
        this.mesh.position.set(0, 3, 0);
        const randomDirectionX = Math.random() < 0.5 ? 1 : -1;
        const randomDirectionZ = Math.random() < 0.5 ? 1 : -1;
        this.velocityX = randomDirectionX * this.initialSpeed;
        this.velocityY = randomDirectionZ * this.initialSpeed;
    }

    updatePosition() {
        this.mesh.position.x += this.velocityX;
        this.mesh.position.z += this.velocityY;
    }

    bounceX() {
        this.velocityX = -this.velocityX;
    }

    bounceY() {
        this.velocityY = -this.velocityY;
    }

    increaseSpeed(amount) {
        this.velocityX += (this.velocityX > 0 ? amount : -amount);
        this.velocityY += (this.velocityY > 0 ? amount : -amount);
    }
}

// Clase para el campo
class Field {
    constructor(width, height) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Rotar el campo para que esté alineado con la vista
        this.mesh.rotation.x = -Math.PI / 2; // Girar el campo para que esté recto
    }
}

// Clase para los muros
class Walls {
    constructor(fieldWidth, fieldHeight, wallHeight, wallThickness) {
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // Muro superior
        const topWallGeometry = new THREE.BoxGeometry(fieldWidth, wallThickness, wallThickness);
        this.topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
        this.topWall.position.set(0, wallHeight / 2, fieldHeight / 2 + wallThickness / 2);

        // Muro inferior
        const bottomWallGeometry = new THREE.BoxGeometry(fieldWidth, wallThickness, wallThickness);
        this.bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
        this.bottomWall.position.set(0, wallHeight / 2, -fieldHeight / 2 - wallThickness / 2);
    }
}

document.getElementById("pong-play-btn")?.addEventListener("click", (event) => {
    event.preventDefault();
    // Iniciar el juego
    const game = new Game();
    document.getElementById('main').innerHTML = "";
    game.init();  
});

