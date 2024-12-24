const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// تحميل صورة الطائرة
const planeImage = new Image();
planeImage.src = 'plane.png'; // تأكد من مسار صورة الطائرة

// تحميل صورة النيزك
const meteorImage = new Image();
meteorImage.src = 'meteor.png';  // تأكد من أن مسار صورة النيزك صحيح

const targetRadius = 30; // حجم الدائرة
let plane = { 
    x: canvas.width / 2, 
    y: canvas.height - 120, 
    width: 100,  // زيادة حجم الطائرة
    height: 100,  // زيادة حجم الطائرة
    speed: 8, 
};
let bullets = [];
let meteors = [];  // استبدال الكرات الحمراء بالنيازك
let level = 1;
let targetSpeed = 2; // سرعة حركة النيازك
let score = 0;  // إضافة متغير لتخزين النقاط
let gameOver = false;
let music = new Audio('background-music.mp3'); // تأكد من مسار موسيقى الخلفية
let shootSound = new Audio('shoot-sound.mp3'); // تأكد من مسار صوت الإطلاق
let crashSound = new Audio('crash-sound.mp3'); // صوت التصادم
let keys = {}; // لتتبع المفاتيح

// إنشاء النيازك
function generateMeteors() {
    meteors = []; // إعادة تعيين النيازك في كل مرة
    for (let i = 0; i < level * 5; i++) { // زيادة عدد النيازك مع كل مستوى
        let x = Math.random() * (canvas.width - 100);  // زيادة مساحة النيازك
        let y = -Math.random() * canvas.height;  // بداية النيازك من أعلى الشاشة
        meteors.push({ x: x, y: y, size: 80 + Math.random() * 40 });
    }
}

// بدء اللعبة
function startGame() {
    music.loop = true;
    music.play();
    generateMeteors();
    requestAnimationFrame(gameLoop);
}

// تغيير مستوى الصعوبة
function increaseDifficulty() {
    level++;
    targetSpeed += 0.5;  // زيادة سرعة النيازك
    generateMeteors();  // إعادة توليد النيازك بعد تغيير المستوى
}

// رسم الطائرة
function drawPlane() {
    if (planeImage.complete) {
        ctx.drawImage(planeImage, plane.x, plane.y, plane.width, plane.height);
    } else {
        ctx.fillStyle = 'blue'; // إذا كانت الصورة لم يتم تحميلها
        ctx.fillRect(plane.x, plane.y, plane.width, plane.height); 
    }
}

// رسم الرصاص
function drawBullets() {
    for (let bullet of bullets) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// رسم النيازك
function drawMeteors() {
    for (let meteor of meteors) {
        ctx.drawImage(meteorImage, meteor.x, meteor.y, meteor.size, meteor.size);  
    }
}

// تحريك النيازك
function moveMeteors() {
    for (let meteor of meteors) {
        meteor.y += targetSpeed;
        if (meteor.y > canvas.height) {
            meteor.y = -60;  // إعادة النيزك لأعلى الشاشة إذا مر من الأسفل
            meteor.x = Math.random() * (canvas.width - 100);  
        }
    }
}

// تحريك الرصاص
function moveBullets() {
    for (let bullet of bullets) {
        bullet.y -= 5;  // حركة الرصاصة للأعلى
        if (bullet.y < 0) {
            bullets = bullets.filter(b => b !== bullet);  // حذف الرصاصات التي خرجت من الشاشة
        }
    }
}

// التعامل مع التصادمات
function handleCollisions() {
    // التحقق من التصادم مع الطائرة
    for (let meteor of meteors) {
        let dx = plane.x - meteor.x;
        let dy = plane.y - meteor.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < meteor.size / 2) {  // التصادم بين الطائرة والنيزك
            crashSound.play();
            gameOver = true;
            break;
        }
    }

    // التعامل مع التصادمات بين الرصاصات والنيزك
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < meteors.length; j++) {
            let dx = bullets[i].x - meteors[j].x;
            let dy = bullets[i].y - meteors[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < meteors[j].size / 2) {  // التصادم بين الرصاصة والنيزك
                meteors.splice(j, 1);  // حذف النيزك
                bullets.splice(i, 1);  // حذف الرصاصة
                shootSound.play();
                score += 10;  // زيادة السكور
                if (score % 50 === 0) {  // زيادة المستوى كل 50 نقطة
                    increaseDifficulty();
                }
                break;
            }
        }
    }
}
// رسم السكور
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 50, 30); // عرض السكور في أعلى الشاشة
}
// رسم المستوى
function drawLevel() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';  // محاذاة النص في المنتصف
    ctx.fillText('Level: ' + level, canvas.width - 365, 70); // عرض المستوى في الزاوية العلوية اليمنى
}

function gameLoop() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 150, canvas.height / 2);
        ctx.fillText('Final Score: ' + score, canvas.width / 2 - 150, canvas.height / 2 + 60);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // مسح الشاشة في كل مرة
    drawPlane();
    drawBullets();
    drawMeteors();
    moveMeteors();
    moveBullets();
    handleCollisions();
    drawScore();
    drawLevel();
    handleKeys();
    requestAnimationFrame(gameLoop);
}

// التعامل مع حركة الطائرة
function handleKeys() {
    if (keys['ArrowLeft'] || keys['a']) plane.x -= plane.speed;
    if (keys['ArrowRight'] || keys['d']) plane.x += plane.speed;
    if (keys['ArrowUp'] || keys['w']) plane.y -= plane.speed;
    if (keys['ArrowDown'] || keys['s']) plane.y += plane.speed;
}

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// دعم الأجهزة المحمولة
canvas.addEventListener('touchstart', (e) => {
    let touch = e.touches[0];
    plane.x = touch.clientX - plane.width / 2;
    plane.y = touch.clientY - plane.height / 2;
    // إطلاق الرصاص عند لمس الشاشة
    bullets.push({ x: plane.x + plane.width / 2, y: plane.y, speed: 5 });
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    plane.x = touch.clientX - plane.width / 2;
    plane.y = touch.clientY - plane.height / 2;
});
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// إضافة إطلاق الرصاص باستخدام زر الفضاء
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        bullets.push({ x: plane.x + plane.width / 2, y: plane.y, speed: 5 });
    }
});

// بدء اللعبة
startGame();
